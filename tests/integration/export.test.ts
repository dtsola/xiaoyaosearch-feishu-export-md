/**
 * @tests/integration/export.test
 * @description 导出功能集成测试
 */

import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../../src/converter/markdown.js';
import { BlockType, type Block } from '../../src/types/index.js';

describe('导出集成测试', () => {
  describe('MarkdownRenderer', () => {
    it('应该正确解析简单的文本块', () => {
      const blocks: Block[] = [
        {
          block_id: 'root',
          block_type: BlockType.Page,
          parent_id: '',
          children: ['text1'],
          page: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [
              {
                text_run: {
                  content: '文档标题',
                },
              },
            ],
            children: [],
          },
        },
        {
          block_id: 'text1',
          block_type: BlockType.Text,
          parent_id: 'root',
          children: [],
          text: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [
              {
                text_run: {
                  content: '这是一段普通文本',
                },
              },
            ],
            children: [],
          },
        },
      ];

      const renderer = new MarkdownRenderer();
      const markdown = renderer.parse(blocks);

      expect(markdown).toContain('# 文档标题');
      expect(markdown).toContain('这是一段普通文本');
    });

    it('应该正确解析标题块', () => {
      const blocks: Block[] = [
        {
          block_id: 'root',
          block_type: BlockType.Page,
          parent_id: '',
          children: ['h1'],
          page: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [],
            children: [],
          },
        },
        {
          block_id: 'h1',
          block_type: BlockType.Heading1,
          parent_id: 'root',
          children: [],
          heading1: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [
              {
                text_run: {
                  content: '一级标题',
                },
              },
            ],
            children: [],
          },
        },
      ];

      const renderer = new MarkdownRenderer();
      const markdown = renderer.parse(blocks);

      expect(markdown).toContain('# 一级标题');
    });

    it('应该正确解析代码块', () => {
      const blocks: Block[] = [
        {
          block_id: 'root',
          block_type: BlockType.Page,
          parent_id: '',
          children: ['code1'],
          page: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [],
            children: [],
          },
        },
        {
          block_id: 'code1',
          block_type: BlockType.Code,
          parent_id: 'root',
          children: [],
          code: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 7, // bash (CodeLanguage.Bash = 7)
              wrap: false,
            },
            elements: [
              {
                text_run: {
                  content: 'echo "hello world"',
                },
              },
            ],
            children: [],
          },
        },
      ];

      const renderer = new MarkdownRenderer();
      const markdown = renderer.parse(blocks);

      expect(markdown).toContain('```bash');
      expect(markdown).toContain('echo "hello world"');
      expect(markdown).toContain('```');
    });

    it('应该收集文件 token', () => {
      const blocks: Block[] = [
        {
          block_id: 'root',
          block_type: BlockType.Page,
          parent_id: '',
          children: ['img1'],
          page: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [],
            children: [],
          },
        },
        {
          block_id: 'img1',
          block_type: BlockType.Image,
          parent_id: 'root',
          children: [],
          image: {
            token: 'img_token_123',
            width: 800,
            height: 600,
            align: 1,
          },
        },
      ];

      const renderer = new MarkdownRenderer();
      renderer.parse(blocks);

      expect(renderer.fileTokens).toHaveLength(1);
      expect(renderer.fileTokens[0]?.token).toBe('img_token_123');
      expect(renderer.fileTokens[0]?.type).toBe('image');
    });

    it('应该正确解析待办事项', () => {
      const blocks: Block[] = [
        {
          block_id: 'root',
          block_type: BlockType.Page,
          parent_id: '',
          children: ['todo1'],
          page: {
            style: {
              align: 1,
              done: false,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [],
            children: [],
          },
        },
        {
          block_id: 'todo1',
          block_type: BlockType.TodoList,
          parent_id: 'root',
          children: [],
          todo: {
            style: {
              align: 1,
              done: true,
              folded: false,
              language: 1,
              wrap: false,
            },
            elements: [
              {
                text_run: {
                  content: '已完成的事项',
                },
              },
            ],
            children: [],
          },
        },
      ];

      const renderer = new MarkdownRenderer();
      const markdown = renderer.parse(blocks);

      expect(markdown).toContain('- [x] 已完成的事项');
    });
  });
});
