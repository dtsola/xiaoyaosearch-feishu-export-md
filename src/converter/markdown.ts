/**
 * @module converter/markdown
 * @description Markdown 渲染器 - 将飞书 Docx Block 树转换为 Markdown GFM 格式
 * 参考实现: https://github.com/longbridge/feishu-pages/blob/main/feishu-docx/src/markdown_renderer.ts
 */

import { marked } from 'marked';
import { markedXhtml } from 'marked-xhtml';
import { Buffer, escapeHTMLTags, trimLastNewline } from './buffer.js';
import { getEmojiChar } from './emoji.js';
import type {
  Block,
  FileToken,
  ImageBlock,
  TableBlock,
  TableMergeInfo,
  TextBlock,
  TextElement,
  TextRun,
} from '../types/index.js';
import {
  BlockType,
  getCodeLanguage,
  getAlignStyle,
} from '../types/index.js';

marked.use(markedXhtml());

/** 颜色映射表 */
const CalloutBackgroundColorMap: Record<number, string> = {
  1: '#fef2f2',
  2: '#fff7ed',
  3: '#fefce8',
  4: '#f0fdf4',
  5: '#eff6ff',
  6: '#faf5ff',
  7: '#f9fafb',
  8: '#fecaca',
  9: '#fed7aa',
  10: '#fef08a',
  11: '#bbf7d0',
  12: '#bfdbfe',
  13: '#e9d5ff',
  14: '#e5e7eb',
};

const CalloutBorderColorMap: Record<number, string> = {
  1: '#fecaca',
  2: '#fed7aa',
  3: '#fef08a',
  4: '#bbf7d0',
  5: '#bfdbfe',
  6: '#e9d5ff',
  7: '#e5e7eb',
};

const FontColorMap: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#3b82f6',
  6: '#a855f7',
  7: '#6b7280',
};

/**
 * Markdown 渲染器
 */
export class MarkdownRenderer {
  /** block_id -> Block 的映射 */
  private blockMap: Map<string, Block> = new Map();
  /** 当前正在处理的 Block */
  private currentBlock: Block | null = null;
  /** 下一个同级 Block（用于列表换行判断） */
  private nextBlock: Block | null = null;
  /** 当前缩进层级 */
  private indent = 0;
  /** 收集到的文件 token 列表 */
  private _fileTokens: FileToken[] = [];
  /** 文档标题 */
  private _title = '';

  /** 获取所有文件 token */
  get fileTokens(): FileToken[] {
    return this._fileTokens;
  }

  /** 获取文档标题 */
  get title(): string {
    return this._title;
  }

  /**
   * 从 Block 列表解析出 Markdown
   */
  parse(blocks: Block[]): string {
    // 构建 blockMap
    this.blockMap.clear();
    this._fileTokens = [];

    for (const block of blocks) {
      this.blockMap.set(block.block_id, block);
    }

    // 找到根节点（Page Block）
    const rootBlock = blocks.find((b) => b.block_type === BlockType.Page);
    if (!rootBlock) {
      throw new Error('未找到文档根节点（Page Block）');
    }

    const result = this.parseBlock(rootBlock, 0);
    return result.toString().trim() + '\n';
  }

  // --- Block 解析 ---

  private parseBlock(block: Block, indent: number): string {
    this.indent = indent;

    if (!block) return '';

    const buf = new Buffer();
    buf.writeIndent(this.indent);

    this.currentBlock = block;

    switch (block.block_type) {
      case BlockType.Page:
        buf.write(this.parsePageBlock(block));
        break;
      case BlockType.Text:
        buf.write(this.parseTextBlock(block, block.text));
        break;
      case BlockType.Heading1:
        buf.write('# ');
        buf.write(this.parseTextBlock(block, block.heading1).trimStart());
        break;
      case BlockType.Heading2:
        buf.write('## ');
        buf.write(this.parseTextBlock(block, block.heading2).trimStart());
        break;
      case BlockType.Heading3:
        buf.write('### ');
        buf.write(this.parseTextBlock(block, block.heading3).trimStart());
        break;
      case BlockType.Heading4:
        buf.write('#### ');
        buf.write(this.parseTextBlock(block, block.heading4).trimStart());
        break;
      case BlockType.Heading5:
        buf.write('##### ');
        buf.write(this.parseTextBlock(block, block.heading5).trimStart());
        break;
      case BlockType.Heading6:
        buf.write('###### ');
        buf.write(this.parseTextBlock(block, block.heading6).trimStart());
        break;
      case BlockType.Heading7:
        buf.write('####### ');
        buf.write(this.parseTextBlock(block, block.heading7).trimStart());
        break;
      case BlockType.Heading8:
        buf.write('######## ');
        buf.write(this.parseTextBlock(block, block.heading8).trimStart());
        break;
      case BlockType.Heading9:
        buf.write('######### ');
        buf.write(this.parseTextBlock(block, block.heading9).trimStart());
        break;
      case BlockType.Bullet:
        buf.write(this.parseBulletBlock(block, indent).trimStart());
        break;
      case BlockType.Ordered:
        buf.write(this.parseOrderedBlock(block, indent));
        break;
      case BlockType.Code:
        buf.write('```');
        buf.write(getCodeLanguage(block.code?.style?.language || 1));
        buf.write('\n');
        buf.write(this.parseTextBlock(block, block.code).toString().trim());
        buf.write('\n```\n');
        break;
      case BlockType.Quote:
        buf.write('> ');
        buf.write(this.parseTextBlock(block, block.quote));
        break;
      case BlockType.TodoList:
        buf.write('- [');
        buf.write(block.todo?.style?.done ? 'x' : ' ');
        buf.write('] ');
        buf.write(this.parseTextBlock(block, block.todo));
        break;
      case BlockType.Divider:
        buf.write('---\n');
        break;
      case BlockType.Image:
        buf.write(this.parseImage(block.image));
        break;
      case BlockType.TableCell:
        buf.write(this.parseTableCell(block));
        break;
      case BlockType.Table:
        buf.write(this.parseTable(block.table));
        break;
      case BlockType.QuoteContainer:
        buf.write(this.parseQuoteContainer(block));
        break;
      case BlockType.View:
        buf.write(this.parseView(block));
        break;
      case BlockType.File:
        buf.write(this.parseFile(block));
        break;
      case BlockType.Grid:
        buf.write(this.parseGrid(block));
        break;
      case BlockType.GridColumn:
        // Grid column is handled by parseGrid
        break;
      case BlockType.Callout:
        buf.write(this.parseCallout(block));
        break;
      case BlockType.Iframe:
        buf.write(this.parseIframe(block));
        break;
      case BlockType.Board:
        buf.write(this.parseBoard(block.board));
        break;
      case BlockType.SyncedBlock:
        buf.write(this.parseSyncedBlock(block));
        break;
      default:
        buf.write(this.parseUnsupport(block));
        break;
    }

    return buf.toString();
  }

  // --- Page ---

  private parsePageBlock(block: Block): string {
    const buf = new Buffer();

    // 文档标题
    if (block.page?.elements && block.page.elements.length > 0) {
      const titleBuf = new Buffer();
      for (const el of block.page.elements) {
        this.parseTextElement(titleBuf, el, block.page.elements.length > 1);
      }
      this._title = titleBuf.toString().trim();
    }

    buf.write('# ');
    buf.write(this.parseTextBlock(block, block.page));
    buf.write('\n');

    // 渲染子块
    block.children?.forEach((childId, idx) => {
      const child = this.blockMap.get(childId);
      if (!child) return;

      this.nextBlock =
        block.children[idx + 1] ? this.blockMap.get(block.children[idx + 1]!) || null : null;

      const childText = this.parseBlock(child, 0);
      if (childText.length > 0) {
        buf.write(childText);
        buf.write('\n');
      }
    });

    return buf.toString();
  }

  // --- Text Block ---

  private parseTextBlock(block: Block, textBlock?: TextBlock): string {
    if (!textBlock?.elements) return '';

    const buf = new Buffer();
    const inline = textBlock.elements.length > 1;

    for (const el of textBlock.elements) {
      this.parseTextElement(buf, el, inline);
    }

    if (buf.length > 0) {
      buf.write('\n');
    }

    // 带子块的文本类 Block，递归渲染子节点
    const childrenBlockTypes = [
      BlockType.Text,
      BlockType.Heading1,
      BlockType.Heading2,
      BlockType.Heading3,
      BlockType.Heading4,
      BlockType.Heading5,
      BlockType.Heading6,
      BlockType.Heading7,
      BlockType.Heading8,
      BlockType.Heading9,
    ];

    if (childrenBlockTypes.includes(block.block_type)) {
      block.children?.forEach((childId) => {
        const child = this.blockMap.get(childId);
        if (child) {
          buf.write(this.parseBlock(child, this.indent));
        }
      });
    }

    return buf.toString();
  }

  // --- Text element ---

  private parseTextElement(buf: Buffer, el: TextElement, inline: boolean): void {
    if (el.text_run) {
      this.parseTextRun(buf, el.text_run);
    } else if (el.equation) {
      const symbol = inline ? '$' : '$$';
      buf.write(symbol);
      buf.write(el.equation.content.trimEnd());
      buf.write(symbol);
    } else if (el.mention_doc) {
      const nodeToken = decodeURIComponent(el.mention_doc.token);
      buf.write(`[${el.mention_doc.title}](${nodeToken})`);
    }
  }

  private parseTextRun(buf: Buffer, textRun: TextRun): void {
    let preWrite = '';
    let postWrite = '';

    const style = textRun.text_element_style;
    let escape = true;

    if (style) {
      if (style.bold) {
        preWrite = '**';
        postWrite = '**';
      } else if (style.italic) {
        preWrite = '*';
        postWrite = '*';
      } else if (style.strikethrough) {
        preWrite = '~~';
        postWrite = '~~';
      } else if (style.underline) {
        preWrite = '<u>';
        postWrite = '</u>';
      } else if (style.inline_code) {
        preWrite = '`';
        postWrite = '`';
        escape = false;
      } else if (style.link) {
        const unescapeURL = decodeURIComponent(style.link.url);
        preWrite = '[';
        postWrite = `](${unescapeURL})`;
      }
    }

    let plainText = textRun.content || '';

    // 不在代码块中时转义 HTML 标签
    if (escape && this.currentBlock?.block_type !== BlockType.Code) {
      plainText = escapeHTMLTags(plainText);
    }

    // 如果末尾是标点符号，用 HTML 标签包裹加粗/斜体/删除线
    if (plainText.match(/[:：]$/)) {
      if (style?.bold) {
        preWrite = '<b>';
        postWrite = '</b>';
      } else if (style?.italic) {
        preWrite = '<i>';
        postWrite = '</i>';
      } else if (style?.strikethrough) {
        preWrite = '<s>';
        postWrite = '</s>';
      }
    }

    // 合并相同样式
    if (!buf.trimLastIfEndsWith(preWrite)) {
      buf.write(preWrite);
    }
    buf.write(plainText);
    buf.write(postWrite);
  }

  // --- Bullet list ---

  private parseBulletBlock(block: Block, indent: number = 0): string {
    const buf = new Buffer();

    buf.write('- ');
    let itemText = this.parseTextBlock(block, block.bullet).toString();

    if (
      this.nextBlock?.block_type === block.block_type &&
      this.nextBlock?.parent_id === block.parent_id &&
      !block.children?.length
    ) {
      itemText = trimLastNewline(itemText);
    }

    buf.write(itemText);

    // 子列表
    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        this.nextBlock = null;
        buf.write(this.parseBlock(child, indent + 1));
      }
    });

    return buf.toString();
  }

  // --- Ordered list ---

  private parseOrderedBlock(block: Block, indent: number = 0): string {
    const buf = new Buffer();

    // 计算序号
    const parent = this.blockMap.get(block.parent_id);
    let order = 1;

    if (parent?.children) {
      for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i] === block.block_id) {
          for (let j = i - 1; j >= 0; j--) {
            const prevBlock = this.blockMap.get(parent.children[j]!);
            if (prevBlock?.block_type === BlockType.Ordered) {
              order++;
            } else {
              break;
            }
          }
          break;
        }
      }
    }

    buf.write(`${order}. `);
    let itemText = this.parseTextBlock(block, block.ordered).toString();

    if (
      this.nextBlock?.block_type === block.block_type &&
      this.nextBlock?.parent_id === block.parent_id &&
      !block.children?.length
    ) {
      itemText = trimLastNewline(itemText);
    }

    buf.write(itemText);

    // 子列表
    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        this.nextBlock = null;
        buf.write(this.parseBlock(child, indent + 1));
      }
    });

    return buf.toString();
  }

  // --- Image ---

  private parseImage(image?: ImageBlock): string {
    if (!image) return '';

    const buf = new Buffer();
    const align = getAlignStyle(image.align);

    // 使用 <img> 标签以支持宽高和对齐
    const attrs: string[] = [`src="${image.token}"`];
    if (image.width) attrs.push(`src-width="${image.width}"`);
    if (image.height) attrs.push(`src-height="${image.height}"`);
    if (align && align !== 'left') attrs.push(`align="${align}"`);

    buf.write(`<img ${attrs.join(' ')} />`);
    buf.write('\n');

    this.addFileToken('image', image.token);
    return buf.toString();
  }

  // --- Table ---

  private parseTableCell(block: Block): string {
    const buf = new Buffer();

    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        buf.write(this.parseBlock(child, 0));
      }
    });

    return buf.toString();
  }

  private parseTable(table?: TableBlock): string {
    if (!table) return '';

    if (this.isComplexTable(table)) {
      return this.parseTableAsHTML(table);
    }

    const rows: string[][] = [[]];

    table.cells.forEach((blockId, idx) => {
      const block = this.blockMap.get(blockId);
      if (!block) return;

      let cellText = this.parseBlock(block, 0);
      cellText = trimLastNewline(cellText).replace(/\n/gm, ' ');

      const row = Math.floor(idx / table.property.column_size);
      if (rows.length < row + 1) {
        rows.push([]);
      }
      rows[row]!.push(cellText);
    });

    const buf = new Buffer();

    // 表头
    let headRow: string[] = [];
    if (table.property?.header_row) {
      headRow = rows.shift() || [];
    }

    buf.write('|');
    for (let i = 0; i < table.property?.column_size; i++) {
      buf.write(headRow[i] || ' ');
      buf.write('|');
    }
    buf.write('\n');

    // 分割线
    buf.write('|');
    for (let i = 0; i < table.property?.column_size; i++) {
      buf.write('---|');
    }
    buf.write('\n');

    // 表体
    for (const row of rows) {
      buf.write('|');
      row.forEach((cell) => {
        buf.write(cell);
        buf.write('|');
      });
      buf.write('\n');
    }

    return buf.toString();
  }

  private parseTableAsHTML(table: TableBlock): string {
    const rows: string[][] = [[]];

    table.cells.forEach((blockId, idx) => {
      const block = this.blockMap.get(blockId);
      if (!block) return;

      let cellHTML = this.markdownToHTML(this.parseBlock(block, 0));
      const row = Math.floor(idx / table.property.column_size);
      if (rows.length < row + 1) {
        rows.push([]);
      }
      rows[row]!.push(cellHTML.trim());
    });

    // 构建 table 属性
    const attrs: string[] = [];
    if (table.property.header_column) attrs.push('header_column="1"');
    if (table.property.header_row) attrs.push('header_row="1"');
    const attrHTML = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';

    const buf = new Buffer();
    buf.writeln(`<table${attrHTML}>`);

    // colgroup
    buf.writeln('  <colgroup>');
    for (let i = 0; i < table.property?.column_size; i++) {
      const width = table.property?.column_width?.[i];
      const widthAttr = width ? ` width="${width}"` : '';
      buf.writeln(`    <col${widthAttr} />`);
    }
    buf.writeln('  </colgroup>');

    let cellIdx = 0;
    const mergeInfos = table.property?.merge_info || [];
    const columnSize = table.property?.column_size;

    // 计算需要生成的单元格
    const cellInfos = mergeInfos.map(() => 1);
    for (let i = 0; i < mergeInfos.length; i++) {
      const info = mergeInfos[i]!;
      if (info.row_span > 1) {
        for (let j = 1; j < info.row_span; j++) {
          const targetIdx = i + j * columnSize;
          if (targetIdx < cellInfos.length) cellInfos[targetIdx] = 0;
        }
      }
      if (info.col_span > 1) {
        for (let j = 1; j < info.col_span; j++) {
          const targetIdx = i + j;
          if (targetIdx < cellInfos.length) cellInfos[targetIdx] = 0;
        }
      }
    }

    const writeCell = (b: Buffer, cell: string, tag: 'th' | 'td'): void => {
      const attr = this.tableCellAttrHTML(mergeInfos, cellIdx);
      if (cellInfos[cellIdx] === 1) {
        b.write(`<${tag}${attr}>${cell || ''}</${tag}>`);
      }
      cellIdx += 1;
    };

    // 表头
    if (table.property?.header_row) {
      const headRow = rows.shift() || [];
      buf.writeln('  <thead>');
      buf.write('    <tr>');
      for (let i = 0; i < columnSize; i++) {
        writeCell(buf, headRow[i] || '', 'th');
      }
      buf.writeln('</tr>');
      buf.writeln('  </thead>');
    }

    // 表体
    buf.writeln('  <tbody>');
    for (const row of rows) {
      buf.write('    <tr>');
      row.forEach((cell) => {
        writeCell(buf, cell, 'td');
      });
      buf.writeln('</tr>');
    }
    buf.writeln('  </tbody>');
    buf.writeln('</table>');

    return buf.toString();
  }

  private tableCellAttrHTML(mergeInfos: TableMergeInfo[], idx: number): string {
    const mergeInfo = mergeInfos[idx];
    if (!mergeInfo) return '';

    const attrs: string[] = [];
    if (mergeInfo.row_span > 1) attrs.push(`rowspan="${mergeInfo.row_span}"`);
    if (mergeInfo.col_span > 1) attrs.push(`colspan="${mergeInfo.col_span}"`);

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
  }

  private isComplexTable(table: TableBlock): boolean {
    const mergeInfos = table.property?.merge_info || [];
    const hasMerge = mergeInfos.some((info) => info.row_span > 1 || info.col_span > 1);
    const hasColWidth = table.property?.column_width?.some((width) => width > 100);
    return hasMerge || !!hasColWidth;
  }

  // --- Quote container ---

  private parseQuoteContainer(block: Block): string {
    const buf = new Buffer();

    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        buf.write('> ');
        buf.write(this.parseBlock(child, 0));
      }
    });

    return buf.toString();
  }

  // --- View ---

  private parseView(block: Block): string {
    const buf = new Buffer();

    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        buf.write(this.parseBlock(child, 0));
      }
    });

    return buf.toString();
  }

  // --- File ---

  private parseFile(block: Block): string {
    if (!block.file) return '';

    const buf = new Buffer();
    this.addFileToken('file', block.file.token);

    buf.write(`[${block.file.name}](${block.file.token})`);
    buf.write('\n');

    return buf.toString();
  }

  // --- Grid (分栏) ---

  private parseGrid(block: Block): string {
    const buf = new Buffer();
    const columnSize = block.grid?.column_size || 1;

    buf.writeln(
      `<div class="grid" style="display: grid; grid-template-columns: repeat(${columnSize}, 1fr); gap: 16px;">`
    );

    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        buf.write(this.parseGridColumn(child));
      }
    });

    buf.writeln('</div>');
    return buf.toString();
  }

  private parseGridColumn(block: Block): string {
    const buf = new Buffer();
    const widthRatio = block.grid_column?.width_ratio;

    buf.writeln(`<div class="grid-column" style="flex: ${widthRatio || 1};">`);

    const inner =
      block.children
        ?.map((childId) => {
          const child = this.blockMap.get(childId);
          return child ? this.parseBlock(child, 0) : '';
        })
        .join('\n') || '';

    buf.write(this.markdownToHTML(inner));
    buf.writeln('</div>');

    return buf.toString();
  }

  // --- Callout (高亮块) ---

  private parseCallout(block: Block): string {
    const buf = new Buffer();

    const styleEntries: string[] = [];
    const classNames = ['callout'];

    if (block.callout?.background_color) {
      const bg = CalloutBackgroundColorMap[block.callout.background_color];
      if (bg) styleEntries.push(`background: ${bg}`);
      classNames.push(`callout-bg-${block.callout.background_color}`);
    }

    if (block.callout?.border_color) {
      const border = CalloutBorderColorMap[block.callout.border_color];
      if (border) styleEntries.push(`border: 1px solid ${border}`);
      classNames.push(`callout-border-${block.callout.border_color}`);
    }

    if (block.callout?.text_color) {
      const color = FontColorMap[block.callout.text_color] || '#222';
      styleEntries.push(`color: ${color}`);
      classNames.push(`callout-color-${block.callout.text_color}`);
    }

    const styleAttr = styleEntries.length ? ` style="${styleEntries.join('; ')}"` : '';

    buf.writeln(`<div class="${classNames.join(' ')}"${styleAttr}>`);

    if (block.callout?.emoji_id) {
      buf.write('<span class="callout-emoji">');
      buf.write(getEmojiChar(block.callout.emoji_id));
      buf.writeln('</span>');
    }

    // 内部内容转为 HTML
    const markdownBuf = new Buffer();
    const innerParts =
      block.children
        ?.map((childId) => {
          const child = this.blockMap.get(childId);
          return child ? this.parseBlock(child, 0) : '';
        })
        .join('\n') || '';
    markdownBuf.write(innerParts);

    buf.write(this.markdownToHTML(markdownBuf.toString()));
    buf.writeln('</div>');

    return buf.toString();
  }

  // --- Iframe ---

  private parseIframe(block: Block): string {
    const url = block.iframe?.component?.url;
    if (!url) return '';

    const buf = new Buffer();
    const decodedUrl = decodeURIComponent(url);
    buf.write(`<iframe src="${decodedUrl}"></iframe>`);
    buf.write('\n');

    return buf.toString();
  }

  // --- Board (画板) ---

  private parseBoard(board?: ImageBlock): string {
    if (!board) return '';

    const buf = new Buffer();
    const align = getAlignStyle(board.align);

    const attrs: string[] = [`src="${board.token}"`];
    if (board.width) attrs.push(`src-width="${board.width}"`);
    if (board.height) attrs.push(`src-height="${board.height}"`);
    if (align && align !== 'left') attrs.push(`align="${align}"`);

    buf.write(`<img ${attrs.join(' ')} />`);
    buf.write('\n');

    this.addFileToken('board', board.token);
    return buf.toString();
  }

  // --- SyncedBlock (同步块) ---

  private parseSyncedBlock(block: Block): string {
    const buf = new Buffer();

    block.children?.forEach((childId) => {
      const child = this.blockMap.get(childId);
      if (child) {
        buf.write(this.parseBlock(child, 0));
      }
    });

    return buf.toString();
  }

  // --- Unsupported ---

  private parseUnsupport(block: Block): string {
    const buf = new Buffer();
    buf.write('```\n');
    buf.write(`// [Unsupported] ${BlockType[block.block_type]}\n`);
    buf.write(JSON.stringify(block, null, 2));
    buf.write('\n```\n');
    return buf.toString();
  }

  // --- Helpers ---

  private addFileToken(type: FileToken['type'], token: string): void {
    if (token) {
      this._fileTokens.push({ token, type });
    }
  }

  private markdownToHTML(markdown: string): string {
    return marked.parse(markdown, { gfm: true, breaks: true }) as string;
  }
}
