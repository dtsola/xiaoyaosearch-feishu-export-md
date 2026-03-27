/**
 * @module utils/footer
 * @description 生成文档来源 footer
 */

/**
 * 添加文档来源 footer
 */
export function addDocFooter(
  markdown: string,
  docId: string,
  docType: 'docx' | 'wiki',
  endpoint: string
): string {
  // 从 API endpoint 推断文档域名
  const docDomain = endpoint.replace('://open.', '://').replace('/open-apis', '');

  // 生成文档 URL
  const docUrl = docType === 'wiki'
    ? `${docDomain}/wiki/${docId}`
    : `${docDomain}/docx/${docId}`;

  // 格式化当前时间
  const now = new Date();
  const updateTime = now.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');

  // 添加来源 footer
  return markdown + `\n\n> 更新: ${updateTime}  \n> 原文: <${docUrl}>`;
}
