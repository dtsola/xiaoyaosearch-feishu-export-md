/**
 * @module commands/wiki
 * @description wiki 命令 - 完整知识库导出
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { IConfig } from '../types/index.js';
import { DocumentClient } from '../core/document.js';
import { MarkdownRenderer } from '../converter/markdown.js';
import { MediaDownloader } from '../core/media.js';
import { AuthManager } from '../core/auth.js';
import { replaceFileTokens, sanitizeFilename, writeFile } from '../utils/file.js';
import { logger } from '../utils/logger.js';
import { addDocFooter } from '../utils/footer.js';

export interface WikiOptions {
  output: string;
  indexOnly?: boolean;
  noImages?: boolean;
  depth?: number;
  debug?: boolean;
  config: IConfig;
}

/** Wiki 节点 */
export interface WikiNode {
  node_token: string;
  obj_type: string;
  obj_token: string;
  title: string;
  node_type: string;
  children?: WikiNode[];
}

/**
 * 递归获取 Wiki 树结构
 */
async function getWikiTree(
  documentClient: DocumentClient,
  spaceId: string,
  nodeToken: string,
  maxDepth?: number,
  currentDepth: number = 0
): Promise<WikiNode> {
  // 获取当前节点信息
  const nodeInfo = await documentClient.getWikiNodeInfo(nodeToken);

  const node: WikiNode = {
    node_token: nodeToken,
    obj_type: nodeInfo.node.obj_type,
    obj_token: nodeInfo.node.obj_token,
    title: nodeInfo.node.title,
    node_type: nodeInfo.node.node_type,
    children: [],
  };

  // 检查深度限制
  if (maxDepth !== undefined && currentDepth >= maxDepth) {
    return node;
  }

  // 如果有子节点，递归获取
  if (nodeInfo.node.has_child) {
    try {
      const children = await documentClient.getWikiChildren(spaceId, nodeToken);

      for (const child of children) {
        const childNode = await getWikiTree(
          documentClient,
          spaceId,
          child.node_token,
          maxDepth,
          currentDepth + 1
        );
        node.children!.push(childNode);
      }
    } catch (err) {
      logger.warn(`获取子节点失败: ${node.title} - ${err}`);
    }
  }

  return node;
}

/**
 * 生成 Wiki 索引文件
 */
function generateWikiIndex(wiki: WikiNode): string {
  let markdown = `# ${wiki.title}\n\n`;
  markdown += `## 知识库索引 / Wiki Index\n\n`;

  function renderNode(node: WikiNode, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const prefix = depth === 0 ? '- ' : '* ';

    // 计算相对路径
    const level = depth;
    const prefixPath = '../'.repeat(level);
    const fileName = sanitizeFilename(node.title);
    let md = `${indent}${prefix}[${node.title}](${prefixPath}${fileName}.md)\n`;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        md += renderNode(child, depth + 1);
      }
    }

    return md;
  }

  markdown += renderNode(wiki);
  return markdown;
}

/**
 * 导出单个 Wiki 节点文档
 */
async function exportWikiDocument(
  wiki: WikiNode,
  outputDir: string,
  documentClient: DocumentClient,
  mediaDownloader: MediaDownloader,
  downloadImages: boolean,
  endpoint: string
): Promise<void> {
  if (wiki.obj_type !== 'docx' && wiki.obj_type !== 'doc') {
    logger.hint(`  跳过非文档节点: ${wiki.title} (类型: ${wiki.obj_type})`);
    return;
  }

  try {
    // 获取文档块
    const blocks = await documentClient.getAllDocumentBlocks(wiki.obj_token);
    const renderer = new MarkdownRenderer();
    let markdown = renderer.parse(blocks);

    // 下载媒体文件
    const fileTokens = renderer.fileTokens;
    if (downloadImages && fileTokens.length > 0) {
      const tokenToPath = await mediaDownloader.downloadAll(fileTokens, outputDir);
      markdown = replaceFileTokens(markdown, tokenToPath);
    }

    // 添加来源 footer（使用 node_token 作为 wiki URL）
    markdown = addDocFooter(markdown, wiki.node_token, 'wiki', endpoint);

    // 写入文件
    const fileName = `${sanitizeFilename(wiki.title)}.md`;
    const outputPath = join(outputDir, fileName);
    await writeFile(outputPath, markdown);

    logger.info(`  ✓ ${wiki.title}`);
  } catch (err) {
    logger.error(`  ✗ 导出失败: ${wiki.title} - ${err}`);
  }
}

/**
 * 递归导出 Wiki
 */
async function exportWikiRecursive(
  documentClient: DocumentClient,
  mediaDownloader: MediaDownloader,
  wiki: WikiNode,
  outputDir: string,
  downloadImages: boolean,
  endpoint: string,
  level: number = 0
): Promise<void> {
  // 为每个子节点创建单独的目录
  if (wiki.children && wiki.children.length > 0) {
    for (const child of wiki.children) {
      // 创建子目录（使用节点标题）
      const childDirName = sanitizeFilename(child.title);
      const childDir = join(outputDir, childDirName);
      await fs.mkdir(childDir, { recursive: true });

      // 导出当前节点的文档内容
      await exportWikiDocument(child, childDir, documentClient, mediaDownloader, downloadImages, endpoint);

      // 递归处理子节点
      await exportWikiRecursive(documentClient, mediaDownloader, child, childDir, downloadImages, endpoint, level + 1);
    }
  } else {
    // 没有子节点，导出当前节点文档
    await exportWikiDocument(wiki, outputDir, documentClient, mediaDownloader, downloadImages, endpoint);
  }
}

/**
 * 导出完整 Wiki
 */
export async function exportWiki(wikiId: string, options: WikiOptions): Promise<void> {
  // 设置 debug 模式
  logger.setDebug(options.debug === true);

  let step = 1;

  // ===== 第 1 步: 初始化客户端 =====
  const authManager = new AuthManager(
    options.config.endpoint,
    options.config.appId,
    options.config.appSecret
  );
  const documentClient = new DocumentClient(options.config.endpoint, () =>
    authManager.getAccessToken()
  );
  const mediaDownloader = new MediaDownloader(options.config.endpoint, () =>
    authManager.getAccessToken()
  );

  logger.step(step++, '开始导出知识库...');

  // ===== 第 2 步: 获取 Wiki 根节点信息 =====
  const rootNodeInfo = await documentClient.getWikiNodeInfo(wikiId);
  const spaceId = rootNodeInfo.node.space_id;
  const wikiTitle = rootNodeInfo.node.title || wikiId;

  logger.step(step++, `知识库: ${wikiTitle} (space_id: ${spaceId})`);

  // ===== 第 3 步: 构建 Wiki 树 =====
  logger.info('正在获取知识库结构...');
  const wikiTree = await getWikiTree(documentClient, spaceId, wikiId, options.depth);

  // 统计节点数量
  function countNodes(node: WikiNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += countNodes(child);
      }
    }
    return count;
  }
  const totalNodes = countNodes(wikiTree);
  logger.step(step++, `获取知识库结构完成 (${totalNodes} 个节点)`);

  // ===== 第 4 步: 生成索引文件 =====
  const indexMarkdown = generateWikiIndex(wikiTree);
  await fs.mkdir(options.output, { recursive: true });
  await writeFile(join(options.output, 'README.md'), indexMarkdown);

  // ===== 第 5 步: 递归导出所有节点 =====
  if (!options.indexOnly) {
    logger.info('开始导出文档...');
    await exportWikiRecursive(
      documentClient,
      mediaDownloader,
      wikiTree,
      options.output,
      options.noImages !== false,
      options.config.endpoint
    );
  }

  // ===== 结果输出 =====
  logger.done(`知识库导出完成: ${options.output}`);

  if (options.indexOnly) {
    logger.hint('  提示: 使用了 --index-only 选项，仅生成索引文件');
  }

  if (options.noImages) {
    logger.hint('  提示: 使用了 --no-images 选项，图片未下载');
  }
}
