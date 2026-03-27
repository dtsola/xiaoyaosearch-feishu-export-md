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
  children?: WikiNode[];
}

/**
 * 递归获取 Wiki 树结构
 */
async function getWikiTree(
  documentClient: DocumentClient,
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
    children: [],
  };

  // 检查深度限制
  if (maxDepth !== undefined && currentDepth >= maxDepth) {
    return node;
  }

  // TODO: 获取子节点列表
  // 飞书 API: GET /open-apis/wiki/v2/spaces/{space_id}/nodes
  // 需要遍历 node_info.node.parent_node_token 或使用专门的子节点 API

  // 伪代码示例：
  // const children = await getWikiChildren(nodeToken);
  // for (const child of children) {
  //   node.children!.push(await getWikiTree(documentClient, child.token, maxDepth, currentDepth + 1));
  // }

  return node;
}

/**
 * 生成 Wiki 索引文件
 */
function generateWikiIndex(wiki: WikiNode): string {
  let markdown = `# ${wiki.title}\n\n`;
  markdown += `## 知识库索引\n\n`;

  function renderNode(node: WikiNode, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const prefix = depth === 0 ? '- ' : '* ';
    let md = `${indent}${prefix}[${node.title}](${sanitizeFilename(node.title)}.md)\n`;

    if (node.children) {
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
 * 递归导出 Wiki
 */
async function exportWikiRecursive(
  documentClient: DocumentClient,
  mediaDownloader: MediaDownloader,
  wiki: WikiNode,
  outputDir: string,
  indexOnly: boolean,
  downloadImages: boolean
): Promise<void> {
  const nodeDir = join(outputDir, sanitizeFilename(wiki.title));
  await fs.mkdir(nodeDir, { recursive: true });

  if (wiki.obj_type === 'docx' && !indexOnly) {
    // 导出文档内容
    const blocks = await documentClient.getAllDocumentBlocks(wiki.obj_token);
    const renderer = new MarkdownRenderer();
    let markdown = renderer.parse(blocks);

    // 下载媒体文件
    const fileTokens = renderer.fileTokens;
    if (downloadImages && fileTokens.length > 0) {
      const tokenToPath = await mediaDownloader.downloadAll(fileTokens, outputDir);
      markdown = replaceFileTokens(markdown, tokenToPath);
    }

    await writeFile(join(nodeDir, `${sanitizeFilename(wiki.title)}.md`), markdown);
  }

  // 递归处理子节点
  if (wiki.children) {
    for (const child of wiki.children) {
      await exportWikiRecursive(documentClient, mediaDownloader, child, nodeDir, indexOnly, downloadImages);
    }
  }
}

/**
 * 导出完整 Wiki
 */
export async function exportWiki(wikiId: string, options: WikiOptions): Promise<void> {
  // 设置 debug 模式
  logger.setDebug(options.debug === true);

  logger.info('开始导出知识库...');

  // 初始化客户端
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

  // 获取 Wiki 树结构
  const wikiTree = await getWikiTree(documentClient, wikiId, options.depth);

  // 生成索引文件
  const indexMarkdown = generateWikiIndex(wikiTree);
  await writeFile(join(options.output, 'README.md'), indexMarkdown);

  if (!options.indexOnly) {
    // 递归导出所有节点
    await exportWikiRecursive(
      documentClient,
      mediaDownloader,
      wikiTree,
      options.output,
      false,
      options.noImages !== false
    );
  }

  logger.done(`知识库导出完成: ${options.output}`);
}
