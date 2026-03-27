/**
 * @module core/auth
 * @description 认证管理模块 - 负责飞书 API 认证和 token 管理
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { TenantAccessTokenResponse } from '../types/index.js';

/**
 * 认证管理器
 * 负责获取和缓存 tenant_access_token
 */
export class AuthManager {
  private accessToken: string | null = null;
  private expiresAt: number = 0;
  private cacheFile: string;

  constructor(
    private endpoint: string,
    private appId: string,
    private appSecret: string,
    cacheDir: string = join(homedir(), '.feishu-export')
  ) {
    this.cacheFile = join(cacheDir, 'cache.json');
  }

  /**
   * 获取 access token
   * 自动处理缓存和刷新
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    // 尝试从文件加载缓存
    if (!this.accessToken) {
      await this.loadCache();
      if (this.accessToken && Date.now() < this.expiresAt) {
        return this.accessToken;
      }
    }

    // 获取新 token
    await this.refreshToken();
    return this.accessToken!;
  }

  /**
   * 刷新 access token
   */
  private async refreshToken(): Promise<void> {
    const url = `${this.endpoint}/open-apis/auth/v3/tenant_access_token/internal`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`认证失败: HTTP ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TenantAccessTokenResponse;

    if (data.code !== 0) {
      throw new Error(`认证失败: [${data.code}] ${data.msg}`);
    }

    this.accessToken = data.tenant_access_token;
    // 提前 5 分钟过期
    this.expiresAt = Date.now() + (data.expire - 300) * 1000;

    // 保存缓存
    await this.saveCache();
  }

  /**
   * 保存 token 缓存
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheDir = join(this.cacheFile, '..');
      await fs.mkdir(cacheDir, { recursive: true });

      const cache = {
        accessToken: this.accessToken,
        expiresAt: this.expiresAt,
      };
      await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      // 缓存保存失败不影响主流程
      console.warn('保存 token 缓存失败:', error);
    }
  }

  /**
   * 加载 token 缓存
   */
  private async loadCache(): Promise<void> {
    try {
      const content = await fs.readFile(this.cacheFile, 'utf-8');
      const cache = JSON.parse(content);

      if (cache.accessToken && cache.expiresAt) {
        this.accessToken = cache.accessToken;
        this.expiresAt = cache.expiresAt;
      }
    } catch {
      // 缓存文件不存在或解析失败，忽略
      this.accessToken = null;
      this.expiresAt = 0;
    }
  }

  /**
   * 清除缓存
   */
  async clearCache(): Promise<void> {
    this.accessToken = null;
    this.expiresAt = 0;
    try {
      await fs.unlink(this.cacheFile);
    } catch {
      // 文件不存在，忽略
    }
  }
}
