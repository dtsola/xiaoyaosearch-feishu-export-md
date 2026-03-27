/**
 * @module core/document
 * @description 文档获取模块 - 负责与飞书文档 API 交互
 */

import type {
  Block,
  DocumentBlocksResponse,
  DocumentInfo,
  FeishuApiResponse,
  WikiNodeInfo,
  WikiChildrenResponse,
  FolderChildrenResponse,
} from '../types/index.js';

/**
 * 飞书 API 速率限制延迟（ms）
 * 飞书 API 限制每分钟约 100 次请求
 */
const RATE_LIMIT_DELAY = 350;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 文档客户端
 * 负责与飞书文档 API 交互
 */
export class DocumentClient {
  constructor(
    private endpoint: string,
    private getAccessToken: () => Promise<string>
  ) {}

  /**
   * 发起飞书 API 请求
   */
  private async request<T>(path: string): Promise<T> {
    await sleep(RATE_LIMIT_DELAY);

    const accessToken = await this.getAccessToken();
    const url = `${this.endpoint}${path}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: HTTP ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as FeishuApiResponse<T>;

    if (result.code !== 0) {
      throw new Error(`API 错误: [${result.code}] ${result.msg}`);
    }

    return result.data;
  }

  /**
   * 获取 Wiki 节点信息
   * 将 node_token 转换为 document_id
   *
   * Wiki URL: https://xxx.feishu.cn/wiki/{node_token}
   * 需要先用此接口将 node_token 转为 obj_token，才能用文档 API 获取内容
   */
  async getWikiNodeInfo(nodeToken: string): Promise<WikiNodeInfo> {
    return this.request<WikiNodeInfo>(
      `/open-apis/wiki/v2/spaces/get_node?token=${nodeToken}`
    );
  }

  /**
   * 获取文档基本信息
   */
  async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
    return this.request<DocumentInfo>(`/open-apis/docx/v1/documents/${documentId}`);
  }

  /**
   * 获取文档所有块（自动处理分页）
   */
  async getAllDocumentBlocks(documentId: string): Promise<Block[]> {
    const allBlocks: Block[] = [];
    let pageToken: string | undefined;
    let pageNum = 1;

    do {
      let path = `/open-apis/docx/v1/documents/${documentId}/blocks?document_revision_id=-1&page_size=500`;
      if (pageToken) {
        path += `&page_token=${pageToken}`;
      }

      const data = await this.request<DocumentBlocksResponse>(path);

      if (data.items) {
        allBlocks.push(...data.items);
      }

      pageToken = data.has_more ? data.page_token : undefined;
      pageNum++;
    } while (pageToken);

    return allBlocks;
  }

  /**
   * 获取 Wiki 子节点列表
   * @param spaceId 知识库空间 ID
   * @param parentNodeToken 父节点 token（空字符串获取根节点）
   */
  async getWikiChildren(
    spaceId: string,
    parentNodeToken: string = ''
  ): Promise<WikiChildrenResponse['items']> {
    const allItems: WikiChildrenResponse['items'] = [];
    let pageToken: string | undefined;

    do {
      let path = `/open-apis/wiki/v2/spaces/${spaceId}/nodes?page_size=50`;
      if (parentNodeToken) {
        path += `&parent_node_token=${parentNodeToken}`;
      }
      if (pageToken) {
        path += `&page_token=${pageToken}`;
      }

      const data = await this.request<WikiChildrenResponse>(path);

      if (data.items) {
        allItems.push(...data.items);
      }

      pageToken = data.has_more ? data.page_token : undefined;
    } while (pageToken);

    return allItems;
  }

  /**
   * 获取文件夹子节点列表
   * @param folderToken 文件夹 token
   */
  async getFolderChildren(folderToken: string): Promise<FolderChildrenResponse['items']> {
    const allItems: FolderChildrenResponse['items'] = [];
    let pageToken: string | undefined;

    do {
      let path = `/open-apis/drive/v1/files/${folderToken}/children?page_size=50`;
      if (pageToken) {
        path += `&page_token=${pageToken}`;
      }

      const data = await this.request<FolderChildrenResponse>(path);

      if (data.items) {
        allItems.push(...data.items);
      }

      pageToken = data.has_more ? data.page_token : undefined;
    } while (pageToken);

    return allItems;
  }
}
