/**
 * @module commands/folder
 * @description folder 命令 - 文件夹导出
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
import { MetaManager } from '../utils/meta-manager.js';
import { addDocFooter } from '../utils/footer.js';

export interface FolderOptions {
  output: string;
  depth?: number;
  noImages?: boolean;
  incremental?: boolean;
  debug?: boolean;
  config: IConfig;
}

/**
 * 导出单个文档
 */
async function exportSingleDocument(
  documentId: string,
  outputDir: string,
  documentClient: DocumentClient,
  mediaDownloader: MediaDownloader,
  downloadImages: boolean,
  endpoint: string,
  metaManager?: MetaManager
): Promise<string> {
  // 获取文档信息
  const docInfo = await documentClient.getDocumentInfo(documentId);
  const docTitle = docInfo.document.title || documentId;
  const updatedAt = docInfo.document.revision_id.toString();

  // 检查是否需要增量导出
  if (metaManager) {
    if (!metaManager.shouldExport(documentId, updatedAt)) {
      return join(outputDir, `${sanitizeFilename(docTitle)}.md`);
    }

    // 获取文档块
    const blocks = await documentClient.getAllDocumentBlocks(documentId);
    const renderer = new MarkdownRenderer();
    let markdown = renderer.parse(blocks);

    // 下载媒体文件
    const fileTokens = renderer.fileTokens;
    if (downloadImages && fileTokens.length > 0) {
      const tokenToPath = await mediaDownloader.downloadAll(fileTokens, outputDir);
      markdown = replaceFileTokens(markdown, tokenToPath);
    }

    // 添加来源 footer
    markdown = addDocFooter(markdown, documentId, 'docx', endpoint);

    // 写入文件
    const fileName = `${sanitizeFilename(docTitle)}.md`;
    const outputPath = join(outputDir, fileName);
    await writeFile(outputPath, markdown);

    // 记录元数据
    await metaManager.updateDocument(documentId, docTitle, updatedAt);

    return outputPath;
  }

  // 非增量模式直接导出
  const blocks = await documentClient.getAllDocumentBlocks(documentId);
  const renderer = new MarkdownRenderer();
  let markdown = renderer.parse(blocks);

  const fileTokens = renderer.fileTokens;
  if (downloadImages && fileTokens.length > 0) {
    const tokenToPath = await mediaDownloader.downloadAll(fileTokens, outputDir);
    markdown = replaceFileTokens(markdown, tokenToPath);
  }

  // 添加来源 footer
  markdown = addDocFooter(markdown, documentId, 'docx', endpoint);

  const fileName = `${sanitizeFilename(docTitle)}.md`;
  const outputPath = join(outputDir, fileName);
  await writeFile(outputPath, markdown);

  return outputPath;
}

/**
 * 递归导出文件夹
 */
export async function exportFolder(
  folderId: string,
  options: FolderOptions,
  currentDepth: number = 0
): Promise<void> {
  // 设置 debug 模式
  logger.setDebug(options.debug === true);

  // 检查深度限制
  if (options.depth !== undefined && currentDepth >= options.depth) {
    return;
  }

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

  // 增量导出管理器
  const metaManager = options.incremental ? new MetaManager() : undefined;
  if (metaManager) {
    await metaManager.load();
  }

  logger.step(step++, `开始导出文件夹: ${folderId}`);

  // ===== 第 2 步: 递归遍历文件夹 =====
  let totalExported = 0;
  let totalSkipped = 0;

  async function traverseFolder(folderToken: string, outputDir: string, depth: number): Promise<void> {
    // 检查深度限制
    if (options.depth !== undefined && depth >= options.depth) {
      logger.hint(`  达到最大深度 (${options.depth})，停止遍历`);
      return;
    }

    logger.info(`${'  '.repeat(depth)}扫描文件夹: ${folderToken}`);

    // 获取子节点列表
    const children = await documentClient.getFolderChildren(folderToken);

    for (const child of children) {
      const indent = '  '.repeat(depth + 1);

      try {
        if (child.type === 'folder') {
          // 子文件夹：创建目录并递归
          const folderName = sanitizeFilename(child.name || child.token);
          const folderPath = join(outputDir, folderName);
          await fs.mkdir(folderPath, { recursive: true });

          logger.info(`${indent}📁 ${folderName}/`);
          await traverseFolder(child.token, folderPath, depth + 1);
        } else if (child.type === 'docx' || child.type === 'doc') {
          // 文档：导出
          const docName = sanitizeFilename(child.name || child.token);

          // 检查是否需要导出
          const docInfo = await documentClient.getDocumentInfo(child.token);
          const shouldSkip = metaManager && !metaManager.shouldExport(child.token, docInfo.document.revision_id.toString());

          if (shouldSkip) {
            logger.hint(`${indent}⊘ ${docName} (未修改)`);
            totalSkipped++;
          } else {
            logger.info(`${indent}📄 ${docName}`);
            await exportSingleDocument(
              child.token,
              outputDir,
              documentClient,
              mediaDownloader,
              options.noImages !== false,
              options.config.endpoint,
              metaManager
            );
            totalExported++;
          }
        } else if (child.type === 'file') {
          // 普通文件：跳过或下载
          logger.hint(`${indent}📎 ${child.name || child.token} (文件，跳过)`);
        } else {
          logger.hint(`${indent}❓ ${child.name || child.token} (类型: ${child.type}，跳过)`);
        }
      } catch (err) {
        logger.error(`${indent}✗ 处理失败: ${child.name || child.token}`);
        if (options.debug) {
          logger.error(String(err));
        }
      }
    }
  }

  // ===== 第 3 步: 执行导出 =====
  await fs.mkdir(options.output, { recursive: true });
  await traverseFolder(folderId, options.output, 0);

  // ===== 结果输出 =====
  logger.done(`文件夹导出完成: ${options.output}`);
  logger.info(`  已导出: ${totalExported} 个文档`);

  if (metaManager && totalSkipped > 0) {
    logger.info(`  已跳过: ${totalSkipped} 个未修改文档`);
  }

  if (options.noImages) {
    logger.hint(`  提示: 使用了 --no-images 选项，图片未下载`);
  }
}
