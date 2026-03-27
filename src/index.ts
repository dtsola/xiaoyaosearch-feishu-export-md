#!/usr/bin/env node
/**
 * @module index
 * @description 小遥搜索飞书导出工具 - CLI 入口
 * 将飞书文档转换为 Markdown 格式，支持图片下载到本地
 */

import { Command } from 'commander';
import { join } from 'path';
import { AuthManager } from './core/auth.js';
import { DocumentClient } from './core/document.js';
import { MediaDownloader } from './core/media.js';
import { MarkdownRenderer } from './converter/markdown.js';
import { resolveConfig, validateConfig } from './utils/config.js';
import { replaceFileTokens, sanitizeFilename, writeFile } from './utils/file.js';
import { logger } from './utils/logger.js';
import { initCommand } from './commands/init.js';
import { configGet, configSet, configReset, configList, configUse } from './commands/config.js';
import { exportDocs } from './commands/docs.js';
import { exportFolder } from './commands/folder.js';
import { exportWiki } from './commands/wiki.js';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('feishu-export')
  .description('小遥搜索飞书导出工具 / Xiaoyaosearch Feishu Export Tool - 将飞书文档转换为 Markdown 格式')
  .version(VERSION);

// --- export 子命令 ---

program
  .command('export')
  .description('导出飞书文档为 Markdown / Export Feishu documents to Markdown')
  .option('-d, --doc <token>', '云文档的 document_id 或 URL / Document ID or URL')
  .option('-w, --wiki <token>', '知识库文档的 node_token 或 URL / Wiki node token or URL')
  .option('--app-id <id>', '飞书应用 App ID（也可通过 FEISHU_APP_ID 环境变量设置） / Feishu App ID')
  .option('--app-secret <secret>', '飞书应用 App Secret（也可通过 FEISHU_APP_SECRET 环境变量设置） / Feishu App Secret')
  .option('-o, --output <dir>', '输出目录 / Output directory', './output')
  .option('--endpoint <url>', '飞书 API 端点 / Feishu API endpoint', 'https://open.feishu.cn')
  .option('--no-images', '不下载图片，保持 token 引用 / Do not download images')
  .option('--incremental', '增量导出模式 / Incremental export mode')
  .option('--debug', '输出详细调试日志 / Enable debug logging')
  .action(async (options: Record<string, unknown>) => {
    try {
      await exportDocument(options);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// --- init 子命令 ---

program
  .command('init')
  .description('初始化配置（交互式） / Initialize configuration interactively')
  .option('-p, --profile <name>', '配置文件名称 / Profile name', 'default')
  .action(async (options: Record<string, unknown>) => {
    try {
      await initCommand({ profile: options.profile as string });
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// --- config 子命令 ---

const configCmd = program.command('config').description('配置管理 / Configuration management');

configCmd
  .command('get [key]')
  .description('获取配置项 / Get configuration value')
  .action(async (key?: string) => {
    try {
      await configGet(key);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

configCmd
  .command('set <key> <value>')
  .description('设置配置项 / Set configuration value')
  .action(async (key: string, value: string) => {
    try {
      await configSet(key, value);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

configCmd
  .command('reset')
  .description('重置配置 / Reset configuration')
  .action(async () => {
    try {
      await configReset();
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

configCmd
  .command('list')
  .description('列出所有配置文件 / List all configuration profiles')
  .action(async () => {
    try {
      await configList();
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

configCmd
  .command('use <profile>')
  .description('切换配置文件 / Switch configuration profile')
  .action(async (profile: string) => {
    try {
      await configUse(profile);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// --- docs 子命令 ---

program
  .command('docs')
  .description('批量导出文档 / Batch export documents')
  .option('--file <path>', '从文件读取文档 ID 列表 / Read document IDs from file')
  .option('--ids <list>', '逗号分隔的文档 ID 列表 / Comma-separated document IDs')
  .option('-o, --output <dir>', '输出目录 / Output directory', './output')
  .option('--no-images', '不下载图片 / Do not download images')
  .option('--incremental', '增量导出（仅导出有更新的文档） / Incremental export')
  .option('-c, --concurrency <number>', '并发数量 / Concurrency limit', parseInt)
  .option('--debug', '输出详细调试日志 / Enable debug logging')
  .option('--app-id <id>', '飞书应用 App ID / Feishu App ID')
  .option('--app-secret <secret>', '飞书应用 App Secret / Feishu App Secret')
  .action(async (options: Record<string, unknown>) => {
    try {
      const config = resolveConfig({
        appId: options.appId as string | undefined,
        appSecret: options.appSecret as string | undefined,
        outputDir: options.output as string | undefined,
      });
      await exportDocs({
        file: options.file as string | undefined,
        ids: options.ids as string | undefined,
        output: config.outputDir,
        noImages: options.images === false,
        incremental: options.incremental === true,
        concurrency: options.concurrency as number | undefined,
        debug: options.debug === true,
        config,
      });
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// --- folder 子命令 ---

program
  .command('folder <folder_id>')
  .description('导出文件夹 / Export folder')
  .option('-o, --output <dir>', '输出目录 / Output directory', './output')
  .option('--depth <number>', '最大递归深度 / Maximum recursion depth', parseInt)
  .option('--no-images', '不下载图片 / Do not download images')
  .option('--debug', '输出详细调试日志 / Enable debug logging')
  .option('--app-id <id>', '飞书应用 App ID / Feishu App ID')
  .option('--app-secret <secret>', '飞书应用 App Secret / Feishu App Secret')
  .action(async (folderId: string, options: Record<string, unknown>) => {
    try {
      const config = resolveConfig({
        appId: options.appId as string | undefined,
        appSecret: options.appSecret as string | undefined,
        outputDir: options.output as string | undefined,
      });
      await exportFolder(folderId, {
        output: config.outputDir,
        depth: options.depth as number | undefined,
        noImages: options.images === false,
        debug: options.debug === true,
        config,
      });
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// --- wiki 子命令 ---

program
  .command('wiki <wiki_id>')
  .description('导出完整知识库 / Export entire wiki')
  .option('-o, --output <dir>', '输出目录 / Output directory', './output')
  .option('--index-only', '仅生成索引文件 / Generate index file only')
  .option('--depth <number>', '最大递归深度 / Maximum recursion depth', parseInt)
  .option('--no-images', '不下载图片 / Do not download images')
  .option('--debug', '输出详细调试日志 / Enable debug logging')
  .option('--app-id <id>', '飞书应用 App ID / Feishu App ID')
  .option('--app-secret <secret>', '飞书应用 App Secret / Feishu App Secret')
  .action(async (wikiId: string, options: Record<string, unknown>) => {
    try {
      const config = resolveConfig({
        appId: options.appId as string | undefined,
        appSecret: options.appSecret as string | undefined,
        outputDir: options.output as string | undefined,
      });
      await exportWiki(wikiId, {
        output: config.outputDir,
        indexOnly: options.indexOnly === true,
        depth: options.depth as number | undefined,
        noImages: options.images === false,
        debug: options.debug === true,
        config,
      });
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

/** 文档来源类型 */
type DocSource = { type: 'docx'; token: string } | { type: 'wiki'; nodeToken: string };

/**
 * 从 URL 中提取 token 部分
 * 如果是完整 URL 则解析出最后的 path 段，否则原样返回（当作纯 token）
 */
function extractToken(input: string): string {
  try {
    const url = new URL(input);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 1) {
      return pathParts[pathParts.length - 1]!;
    }
  } catch {
    // 不是 URL，原样返回
  }
  return input;
}

/**
 * 根据 CLI 参数解析文档来源
 */
function resolveDocSource(options: Record<string, unknown>): DocSource {
  const docInput = options.doc as string | undefined;
  const wikiInput = options.wiki as string | undefined;

  if (docInput && wikiInput) {
    logger.error('-d 和 -w 不能同时使用，请选择其中一个');
    process.exit(1);
  }

  if (!docInput && !wikiInput) {
    logger.error('请指定要导出的文档:');
    logger.hint('-d <token>  云文档的 document_id 或 URL');
    logger.hint('-w <token>  知识库文档的 node_token 或 URL');
    console.log('');
    logger.hint('示例:');
    logger.hint('  feishu-export export -d doxcnXXXXXXXX');
    logger.hint('  feishu-export export -w V0gQw6yEZikjBAkKcrVcd8OlnYe');
    logger.hint('  feishu-export export -d "https://xxx.feishu.cn/docx/doxcnXXXXXX"');
    logger.hint('  feishu-export export -w "https://my.feishu.cn/wiki/V0gQw6yEZikj..."');
    process.exit(1);
  }

  if (wikiInput) {
    return { type: 'wiki', nodeToken: extractToken(wikiInput) };
  }

  return { type: 'docx', token: extractToken(docInput!) };
}

/**
 * 核心导出流程
 */
async function exportDocument(options: Record<string, unknown>): Promise<void> {
  // 设置 debug 模式
  logger.setDebug(options.debug === true);

  const docSource = resolveDocSource(options);

  // 解析配置
  const config = resolveConfig({
    appId: options.appId as string | undefined,
    appSecret: options.appSecret as string | undefined,
    endpoint: options.endpoint as string | undefined,
    outputDir: options.output as string | undefined,
  });

  // 校验配置
  const errors = validateConfig(config);
  if (errors.length > 0) {
    for (const err of errors) {
      logger.error(err);
    }
    console.log('');
    logger.hint('使用方式:');
    logger.hint('  方式一: 设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
    logger.hint('  方式二: 通过 --app-id 和 --app-secret 参数传入');
    console.log('');
    logger.hint('如何获取 App ID/Secret:');
    logger.hint('  1. 访问 https://open.feishu.cn/app 创建应用');
    logger.hint('  2. 开通 docx:document:readonly、drive:drive:readonly 权限');
    logger.hint('  3. 若需导出知识库，还需开通 wiki:wiki:readonly 权限');
    logger.hint('  4. 发布应用并审批通过');
    process.exit(1);
  }

  // 步骤计数器
  let step = 1;

  // ===== 第 1 步: 初始化客户端 =====
  const authManager = new AuthManager(config.endpoint, config.appId, config.appSecret);
  const documentClient = new DocumentClient(config.endpoint, () => authManager.getAccessToken());
  const mediaDownloader = new MediaDownloader(config.endpoint, () =>
    authManager.getAccessToken()
  );

  // ===== 第 2 步: Wiki 解析（仅知识库文档） =====
  let documentId: string;

  if (docSource.type === 'wiki') {
    const wikiInfo = await documentClient.getWikiNodeInfo(docSource.nodeToken);

    const objType = wikiInfo.node.obj_type;
    documentId = wikiInfo.node.obj_token;

    if (objType !== 'docx' && objType !== 'doc') {
      throw new Error(`该知识库节点类型为 "${objType}"，目前仅支持 docx 类型文档的导出`);
    }

    logger.step(step++, `解析知识库节点: "${wikiInfo.node.title}" -> ${documentId}`);
  } else {
    documentId = docSource.token;
  }

  // ===== 第 3 步: 获取文档信息 + 文档块 =====
  const docInfo = await documentClient.getDocumentInfo(documentId);
  const docTitle = docInfo.document.title || documentId;

  const blocks = await documentClient.getAllDocumentBlocks(documentId);
  logger.step(step++, `获取文档: ${docTitle} (${blocks.length} 个块)`);

  // ===== 第 4 步: 转换 Markdown =====
  const renderer = new MarkdownRenderer();
  let markdown = renderer.parse(blocks);
  logger.step(step++, '转换 Markdown 完成');

  // ===== 第 5 步: 下载媒体文件 =====
  const downloadImages = options.images !== false;
  const fileTokens = renderer.fileTokens;

  if (downloadImages && fileTokens.length > 0) {
    const tokenToPath = await mediaDownloader.downloadAll(fileTokens, config.outputDir);

    markdown = replaceFileTokens(markdown, tokenToPath);
    logger.step(step++, `下载媒体: ${fileTokens.length}/${fileTokens.length} 完成`);
  } else if (fileTokens.length > 0) {
    logger.step(step++, `跳过下载 ${fileTokens.length} 个媒体文件（--no-images）`);
  }

  // ===== 写入文件 =====
  const fileName = `${sanitizeFilename(docTitle)}.md`;
  const outputPath = join(config.outputDir, fileName);
  await writeFile(outputPath, markdown);

  // ===== 结果输出 =====
  logger.done(`导出完成: ${outputPath}`);

  if (fileTokens.length > 0 && downloadImages) {
    logger.hint(`媒体文件: ${config.outputDir}/images/`);
  }
}

// 解析命令行参数
program.parse();
