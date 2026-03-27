/**
 * @tests/unit/utils.test
 * @description 工具函数单元测试
 */

import { describe, it, expect } from 'vitest';
import { sanitizeFilename, replaceFileTokens } from '../../src/utils/file.js';
import { getCodeLanguage } from '../../src/types/index.js';

describe('工具函数', () => {
  describe('sanitizeFilename', () => {
    it('应该清理文件名中的非法字符', () => {
      // 实现使用正则 /[<>:"/\\|?*]/g 将每个非法字符替换为下划线
      // 多个连续非法字符会产生多个下划线
      expect(sanitizeFilename('test/file:name')).toBe('test_file_name');
      expect(sanitizeFilename('test<>file')).toBe('test__file'); // < 和 > 各变成一个 _
      expect(sanitizeFilename('test??file')).toBe('test__file'); // 两个 ? 各变成一个 _
    });

    it('应该替换空格为下划线', () => {
      expect(sanitizeFilename('test file name')).toBe('test_file_name');
    });

    it('应该保留中文字符', () => {
      expect(sanitizeFilename('测试文档')).toBe('测试文档');
    });

    it('应该处理空字符串', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('replaceFileTokens', () => {
    it('应该替换 Markdown 中的图片 token', () => {
      const markdown = '<img src="token123" />';
      const tokenMap = new Map([['token123', 'images/token123.png']]);
      const result = replaceFileTokens(markdown, tokenMap);
      expect(result).toBe('<img src="images/token123.png" />');
    });

    it('应该替换 Markdown 中的文件链接 token', () => {
      const markdown = '[文件名](token456)';
      const tokenMap = new Map([['token456', 'files/token456.pdf']]);
      const result = replaceFileTokens(markdown, tokenMap);
      expect(result).toBe('[文件名](files/token456.pdf)');
    });

    it('应该同时替换多个 token', () => {
      const markdown = '<img src="token1" />\n[文件](token2)';
      const tokenMap = new Map([
        ['token1', 'images/token1.png'],
        ['token2', 'files/token2.pdf'],
      ]);
      const result = replaceFileTokens(markdown, tokenMap);
      expect(result).toContain('images/token1.png');
      expect(result).toContain('files/token2.pdf');
    });
  });

  describe('getCodeLanguage', () => {
    it('应该正确映射常见语言', () => {
      expect(getCodeLanguage(1)).toBe('text'); // PlainText
      expect(getCodeLanguage(7)).toBe('bash'); // Bash
      expect(getCodeLanguage(63)).toBe('typescript'); // TypeScript (枚举第 63 个)
      expect(getCodeLanguage(30)).toBe('javascript'); // JavaScript (枚举第 30 个)
      expect(getCodeLanguage(49)).toBe('python'); // Python (枚举第 49 个)
    });

    it('应该返回小写的语言名称', () => {
      expect(getCodeLanguage(29)).toBe('java'); // Java (枚举第 29 个)
      expect(getCodeLanguage(22)).toBe('go'); // Go (枚举第 22 个)
    });
  });
});
