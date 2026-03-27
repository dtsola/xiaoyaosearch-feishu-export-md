/**
 * @module utils/config-manager
 * @description 配置管理器 - 管理应用配置文件和配置文件
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/** 配置文件数据结构 */
export interface ConfigProfile {
  appId: string;
  appSecret: string;
  endpoint: string;
  outputDir: string;
  [key: string]: unknown;
}

export interface ConfigData {
  profiles: Record<string, ConfigProfile>;
  currentProfile: string;
}

/**
 * 配置管理器
 * 负责配置文件的读写和管理
 */
export class ConfigManager {
  private configPath: string;
  private config: ConfigData;

  constructor(configDir: string = join(homedir(), '.feishu-export')) {
    this.configPath = join(configDir, 'config.json');
    this.config = {
      profiles: {},
      currentProfile: 'default',
    };
  }

  /**
   * 初始化配置
   */
  async init(): Promise<void> {
    // 确保目录存在
    const dir = join(this.configPath, '..');
    await fs.mkdir(dir, { recursive: true });

    // 加载现有配置
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(content);
    } catch {
      // 配置文件不存在，使用默认值
    }
  }

  /**
   * 获取配置
   */
  async get(key?: string): Promise<unknown> {
    await this.init();

    if (!key) {
      return this.config;
    }

    const profile = this.config.profiles[this.config.currentProfile];
    return profile?.[key];
  }

  /**
   * 获取当前 Profile
   */
  async getProfile(): Promise<ConfigProfile> {
    await this.init();
    return this.config.profiles[this.config.currentProfile] || {
      appId: '',
      appSecret: '',
      endpoint: 'https://open.feishu.cn',
      outputDir: './output',
    };
  }

  /**
   * 设置配置
   */
  async set(key: string, value: unknown): Promise<void> {
    await this.init();

    const profile: ConfigProfile =
      this.config.profiles[this.config.currentProfile] || {
        appId: '',
        appSecret: '',
        endpoint: 'https://open.feishu.cn',
        outputDir: './output',
      };
    profile[key] = value;

    this.config.profiles[this.config.currentProfile] = profile;
    await this.save();
  }

  /**
   * 设置整个 Profile
   */
  async setProfile(profile: ConfigProfile): Promise<void> {
    await this.init();
    this.config.profiles[this.config.currentProfile] = profile;
    await this.save();
  }

  /**
   * 保存配置
   */
  private async save(): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * 重置配置
   */
  async reset(): Promise<void> {
    this.config = {
      profiles: {},
      currentProfile: 'default',
    };
    await this.save();
  }

  /**
   * 切换 Profile
   */
  async switchProfile(profileName: string): Promise<void> {
    await this.init();
    if (!this.config.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" 不存在`);
    }
    this.config.currentProfile = profileName;
    await this.save();
  }

  /**
   * 列出所有 Profile
   */
  async listProfiles(): Promise<string[]> {
    await this.init();
    return Object.keys(this.config.profiles);
  }

  /**
   * 获取当前 Profile 名称
   */
  async getCurrentProfileName(): Promise<string> {
    await this.init();
    return this.config.currentProfile;
  }
}
