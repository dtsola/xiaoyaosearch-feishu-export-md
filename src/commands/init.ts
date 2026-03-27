/**
 * @module commands/init
 * @description init 命令 - 交互式配置初始化
 */

import inquirer from 'inquirer';
import { ConfigManager } from '../utils/config-manager.js';
import { logger } from '../utils/logger.js';

export interface InitOptions {
  profile?: string;
}

/**
 * init 命令处理函数
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.init();

  const profileName = options.profile || 'default';

  console.log('🚀 欢迎使用小遥搜索飞书导出工具');
  console.log('');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appId',
      message: '请输入飞书 App ID:',
      validate: (input: string) => input.length > 0 || 'App ID 不能为空',
    },
    {
      type: 'password',
      name: 'appSecret',
      message: '请输入飞书 App Secret:',
      mask: '*',
      validate: (input: string) => input.length > 0 || 'App Secret 不能为空',
    },
    {
      type: 'input',
      name: 'outputDir',
      message: '请输入默认输出目录:',
      default: './output',
    },
  ]);

  // 设置 profile
  await configManager.setProfile({
    appId: answers.appId as string,
    appSecret: answers.appSecret as string,
    endpoint: 'https://open.feishu.cn',
    outputDir: answers.outputDir as string,
  });

  console.log('');
  logger.done('配置已保存');
  console.log('');
  console.log('接下来可以：');
  console.log('  • 导出单个文档: feishu-export export -d <doc_id>');
  console.log('  • 导出知识库: feishu-export export -w <wiki_id>');
  console.log('  • 批量导出: feishu-export docs --file <list.txt>');
}
