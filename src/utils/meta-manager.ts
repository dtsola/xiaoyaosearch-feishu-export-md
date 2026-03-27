/**
 * @module utils/meta-manager
 * @description 元数据管理器 - 用于增量导出
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/** 文档元数据 */
export interface DocumentMeta {
  title: string;
  updatedAt: string;
  exportedAt: string;
  version: number;
}

/** 元数据结构 */
export interface MetaData {
  lastExportAt: string;
  documents: Record<string, DocumentMeta>;
}

/**
 * 元数据管理器
 * 用于记录文档导出历史，支持增量导出
 */
export class MetaManager {
  private metaPath: string;
  private meta: MetaData;

  constructor() {
    this.metaPath = join(homedir(), '.feishu-export', 'meta.json');
    this.meta = {
      lastExportAt: '',
      documents: {},
    };
  }

  /**
   * 加载元数据
   */
  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.metaPath, 'utf-8');
      this.meta = JSON.parse(content);
    } catch {
      // 文件不存在，使用默认值
    }
  }

  /**
   * 保存元数据
   */
  async save(): Promise<void> {
    const dir = join(this.metaPath, '..');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.metaPath, JSON.stringify(this.meta, null, 2));
  }

  /**
   * 检查文档是否需要导出
   */
  shouldExport(docId: string, updatedAt: string): boolean {
    const docMeta = this.meta.documents[docId];

    // 首次导出
    if (!docMeta) return true;

    // 检查更新时间
    return new Date(updatedAt) > new Date(docMeta.updatedAt);
  }

  /**
   * 更新文档元数据
   */
  async updateDocument(docId: string, title: string, updatedAt: string): Promise<void> {
    const existing = this.meta.documents[docId];
    this.meta.documents[docId] = {
      title,
      updatedAt,
      exportedAt: new Date().toISOString(),
      version: (existing?.version || 0) + 1,
    };
    await this.save();
  }

  /**
   * 获取文档元数据
   */
  getDocumentMeta(docId: string): DocumentMeta | undefined {
    return this.meta.documents[docId];
  }

  /**
   * 清除元数据
   */
  async clear(): Promise<void> {
    this.meta = {
      lastExportAt: '',
      documents: {},
    };
    await this.save();
  }
}
