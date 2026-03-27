/**
 * @module utils/file
 * @description 文件操作工具
 */

import { mkdir, writeFile as fsWriteFile } from 'fs/promises';
import { dirname } from 'path';

/**
 * 将内容写入文件，自动创建目录
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await fsWriteFile(filePath, content, 'utf-8');
}

/**
 * 替换 Markdown 中的文件 token 为本地路径
 */
export function replaceFileTokens(markdown: string, tokenToPath: Map<string, string>): string {
  let result = markdown;

  for (const [token, localPath] of tokenToPath) {
    // 替换 <img src="token" 中的 token
    result = result.replaceAll(`src="${token}"`, `src="${localPath}"`);
    // 替换 [name](token) 中的 token
    result = result.replaceAll(`](${token})`, `](${localPath})`);
  }

  return result;
}

/**
 * 清理文件名中的非法字符
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}
