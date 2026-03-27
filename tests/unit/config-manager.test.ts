/**
 * @tests/unit/config-manager.test
 * @description ConfigManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager } from '../../src/utils/config-manager.js';

// Mock fs 模块
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockWriteFile = vi.fn().mockResolvedValue(undefined);
const mockReadFile = vi.fn();

vi.mock('fs/promises', () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
  readFile: mockReadFile,
}));

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager('/tmp/test-feishu-export');
    vi.clearAllMocks();
  });

  it('应该正确初始化', async () => {
    mockReadFile.mockRejectedValue(new Error('File not found'));

    await configManager.init();

    expect(mockMkdir).toHaveBeenCalled();
  });

  it('应该正确保存和加载配置', async () => {
    const mockConfig = {
      profiles: {
        default: {
          appId: 'test-app-id',
          appSecret: 'test-secret',
          endpoint: 'https://open.feishu.cn',
          outputDir: './output',
        },
      },
      currentProfile: 'default',
    };

    mockReadFile.mockResolvedValue(JSON.stringify(mockConfig));

    await configManager.set('appId', 'test-app-id');
    await configManager.set('appSecret', 'test-secret');
    await configManager.set('endpoint', 'https://open.feishu.cn');
    await configManager.set('outputDir', './output');

    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('应该正确获取配置值', async () => {
    const mockConfig = {
      profiles: {
        default: {
          appId: 'test-app-id',
          appSecret: 'test-secret',
          endpoint: 'https://open.feishu.cn',
          outputDir: './output',
        },
      },
      currentProfile: 'default',
    };

    mockReadFile.mockResolvedValue(JSON.stringify(mockConfig));

    const value = await configManager.get('appId');
    expect(value).toBe('test-app-id');
  });

  it('应该正确重置配置', async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReadFile.mockRejectedValue(new Error('File not found'));

    await configManager.reset();

    const writtenData = mockWriteFile.mock.calls[0]?.[1];
    const parsed = JSON.parse(writtenData as string);
    expect(parsed.profiles).toEqual({});
    expect(parsed.currentProfile).toBe('default');
  });
});
