/**
 * @module utils/config
 * @description 配置管理 - 支持环境变量和 CLI 参数两种配置方式
 */

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

/**
 * 从环境变量和 CLI 参数合并配置
 * CLI 参数优先级高于环境变量
 */
export function resolveConfig(cliOptions: CliConfigOptions): IConfig {
  const config: IConfig = {
    appId: cliOptions.appId || process.env.FEISHU_APP_ID || '',
    appSecret: cliOptions.appSecret || process.env.FEISHU_APP_SECRET || '',
    endpoint: cliOptions.endpoint || process.env.FEISHU_ENDPOINT || 'https://open.feishu.cn',
    outputDir: cliOptions.outputDir || process.env.OUTPUT_DIR || './output',
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
