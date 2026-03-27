/**
 * @module utils/config
 * @description 配置管理 - 支持配置文件、环境变量和 CLI 参数三种配置方式
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { IConfig } from '../types/index.js';

/**
 * CLI 配置选项（部分字段可选）
 */
export interface CliConfigOptions {
  appId?: string;
  appSecret?: string;
  endpoint?: string;
  outputDir?: string;
}

/** 配置文件数据结构 */
interface ConfigFileData {
  profiles: Record<string, IConfig>;
  currentProfile: string;
}

/**
 * 从配置文件读取配置
 */
async function loadConfigFromFile(): Promise<Partial<IConfig> | null> {
  const configPath = join(homedir(), '.feishu-export', 'config.json');

  try {
    const content = await readFile(configPath, 'utf-8');
    const data = JSON.parse(content) as ConfigFileData;

    const profileName = data.currentProfile || 'default';
    const profile = data.profiles[profileName];

    if (profile) {
      return profile;
    }

    return null;
  } catch {
    // 配置文件不存在或读取失败
    return null;
  }
}

/**
 * 从配置文件、环境变量和 CLI 参数合并配置
 * 优先级：CLI 参数 > 环境变量 > 配置文件 > 默认值
 */
export async function resolveConfig(cliOptions: CliConfigOptions): Promise<IConfig> {
  // 从配置文件读取
  const fileConfig = await loadConfigFromFile();

  const config: IConfig = {
    appId: cliOptions.appId || process.env.FEISHU_APP_ID || fileConfig?.appId || '',
    appSecret: cliOptions.appSecret || process.env.FEISHU_APP_SECRET || fileConfig?.appSecret || '',
    endpoint: cliOptions.endpoint || process.env.FEISHU_ENDPOINT || fileConfig?.endpoint || 'https://open.feishu.cn',
    outputDir: cliOptions.outputDir || process.env.OUTPUT_DIR || fileConfig?.outputDir || './output',
  };

  return config;
}

/**
 * 校验必要配置是否存在
 */
export function validateConfig(config: IConfig): string[] {
  const errors: string[] = [];

  if (!config.appId) {
    errors.push('缺少 App ID，请通过 --app-id 参数或 FEISHU_APP_ID 环境变量提供');
  }

  if (!config.appSecret) {
    errors.push('缺少 App Secret，请通过 --app-secret 参数或 FEISHU_APP_SECRET 环境变量提供');
  }

  return errors;
}
