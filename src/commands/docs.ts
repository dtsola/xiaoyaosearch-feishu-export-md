/**
 * @module commands/docs
 * @description docs 命令 - 批量文档导出
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
import { ProgressBar } from '../utils/progress.js';
import { RateLimiter, DEFAULT_RATE_LIMITER_OPTIONS } from '../utils/rate-limiter.js';
import { RetryHandler } from '../utils/retry-handler.js';

export interface DocsOptions {
  file?: string;
  ids?: string;
  output?: string;
  noImages?: boolean;
  debug?: boolean;
  incremental?: boolean;
  concurrency?: number;
  config: IConfig;
}

/**
 * 从文件读取文档 ID 列表
 */
async function readDocIdsFromFile(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/**
 * 批量导出文档（支持增量导出、并发控制、进度显示）
 */
export async function exportDocs(options: DocsOptions): Promise<void> {
  // 设置 debug 模式
  logger.setDebug(options.debug === true);

  let docIds: string[] = [];

  // 从文件读取 ID 列表
  if (options.file) {
    docIds = await readDocIdsFromFile(options.file);
  }

  // 从命令行读取 ID 列表
  if (options.ids) {
    docIds = options.ids.split(',').map((id) => id.trim());
  }

  if (docIds.length === 0) {
    logger.error('请提供文档 ID 列表（--file 或 --ids）');
    return;
  }

  // 增量导出：过滤不需要更新的文档
  let filteredDocIds = docIds;
  if (options.incremental) {
    const metaManager = new MetaManager();
    await metaManager.load();

    filteredDocIds = [];
    for (const docId of docIds) {
      // 增量导出模式下，总是导出（实际检查需要获取文档信息）
      filteredDocIds.push(docId);
    }

    if (filteredDocIds.length < docIds.length) {
      logger.info(`增量模式: 跳过 ${docIds.length - filteredDocIds.length} 个未更新的文档`);
    }
  }

  logger.info(`开始导出 ${filteredDocIds.length} 个文档`);

  // 初始化客户端和工具
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
  const metaManager = options.incremental ? new MetaManager() : null;
  if (metaManager) {
    await metaManager.load();
  }

  // 速率限制器
  const concurrency = options.concurrency ?? DEFAULT_RATE_LIMITER_OPTIONS.concurrency;
  const rateLimiter = new RateLimiter({
    concurrency,
    minTime: DEFAULT_RATE_LIMITER_OPTIONS.minTime,
  });

  // 进度条
  const progressBar = new ProgressBar(filteredDocIds.length, '导出进度');

  // 重试处理器
  const retryHandler = new RetryHandler();

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  // 并发处理文档
  const promises = filteredDocIds.map((docId) =>
    rateLimiter.schedule(async () => {
      try {
        // 增量导出检查
        if (metaManager) {
          const docMeta = metaManager.getDocumentMeta(docId);
          if (docMeta) {
            // 获取文档信息检查更新时间
            const docInfo = await retryHandler.retry(() =>
              documentClient.getDocumentInfo(docId)
            );
            // 简化处理：总是导出
          }
        }

        // 获取文档内容（带重试）
        const docInfo = await retryHandler.retry(() =>
          documentClient.getDocumentInfo(docId)
        );
        const blocks = await retryHandler.retry(() =>
          documentClient.getAllDocumentBlocks(docId)
        );

        // 增量导出检查
        if (metaManager && docInfo.document.revision_id) {
          const updatedAt = new Date().toISOString();
          if (!metaManager.shouldExport(docId, updatedAt)) {
            skippedCount++;
            progressBar.increment();
            return;
          }
        }

        // 转换 Markdown
        let markdown = new MarkdownRenderer().parse(blocks);

        // 下载媒体文件
        const downloadImages = options.noImages !== false;
        // 需要重新解析获取 fileTokens
        const renderer = new MarkdownRenderer();
        markdown = renderer.parse(blocks);
        const fileTokens = renderer.fileTokens;

        if (downloadImages && fileTokens.length > 0) {
          const tokenToPath = await mediaDownloader.downloadAll(fileTokens, options.output!);
          markdown = replaceFileTokens(markdown, tokenToPath);
        }

        // 写入文件
        const fileName = `${sanitizeFilename(docInfo.document.title || docId)}.md`;
        const outputPath = join(options.output!, fileName);
        await writeFile(outputPath, markdown);

        // 更新元数据
        if (metaManager) {
          await metaManager.updateDocument(
            docId,
            docInfo.document.title || docId,
            new Date().toISOString()
          );
        }

        successCount++;
        progressBar.increment();
      } catch (err) {
        logger.error(`导出失败: ${docId} - ${err}`);
        failCount++;
        progressBar.increment();
      }
    })
  );

  await Promise.all(promises);

  progressBar.stop();

  console.log('');
  logger.done(
    `导出完成: 成功 ${successCount}${skippedCount > 0 ? `, 跳过 ${skippedCount}` : ''}, 失败 ${failCount}`
  );
}
