/**
 * @module commands/config
 * @description config 命令 - 配置管理
 */

import { ConfigManager } from '../utils/config-manager.js';
import { logger } from '../utils/logger.js';

/**
 * config get 命令
 */
export async function configGet(key?: string): Promise<void> {
  const configManager = new ConfigManager();
  const value = await configManager.get(key);

  if (key) {
    // 脱敏显示
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('token')) {
      const strValue = String(value);
      console.log(`${key}: ${strValue ? '****' + strValue.slice(-4) : '(空)'}`);
    } else {
      console.log(`${key}: ${value ?? '(空)'}`);
    }
  } else {
    // 显示全部配置（脱敏）
    const profile = await configManager.getProfile();
    const displayConfig = {
      ...profile,
      appSecret: profile.appSecret ? '****' + profile.appSecret.slice(-4) : '',
    };
    console.log(JSON.stringify(displayConfig, null, 2));
  }
}

/**
 * config set 命令
 */
export async function configSet(key: string, value: string): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.set(key, value);
  logger.done(`已设置 ${key} = ${value}`);
}

/**
 * config reset 命令
 */
export async function configReset(): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.reset();
  logger.done('配置已重置');
}

/**
 * config list 命令
 */
export async function configList(): Promise<void> {
  const configManager = new ConfigManager();
  const profiles = await configManager.listProfiles();
  const current = await configManager.getCurrentProfileName();

  console.log('配置文件（Profiles）:');
  for (const profile of profiles) {
    const prefix = profile === current ? '* ' : '  ';
    console.log(`${prefix}${profile}`);
  }
}

/**
 * config use 命令
 */
export async function configUse(profileName: string): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.switchProfile(profileName);
  logger.done(`已切换到配置文件: ${profileName}`);
}
