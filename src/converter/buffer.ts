/**
 * @module converter/buffer
 * @description 字符串缓冲区工具 - 用于构建 Markdown 输出
 */

/** 字符串缓冲区 */
export class Buffer {
  private parts: string[] = [];

  get length(): number {
    return this.parts.reduce((acc, p) => acc + p.length, 0);
  }

  write(content: string | Buffer): void {
    if (content instanceof Buffer) {
      this.parts.push(content.toString());
    } else {
      this.parts.push(content);
    }
  }

  writeln(content: string): void {
    this.parts.push(content + '\n');
  }

  writeIndent(indent: number): void {
    if (indent > 0) {
      this.parts.push('   '.repeat(indent));
    }
  }

  /**
   * 如果末尾以指定字符串结尾则移除它，返回是否移除成功
   * 用于合并相同样式的文本
   */
  trimLastIfEndsWith(suffix: string): boolean {
    if (!suffix || this.parts.length === 0) return false;

    const current = this.toString();
    if (current.endsWith(suffix)) {
      this.parts = [current.slice(0, -suffix.length)];
      return true;
    }
    return false;
  }

  toString(options?: { indent?: number }): string {
    const result = this.parts.join('');
    if (options?.indent && options.indent > 0) {
      const indentStr = '   '.repeat(options.indent);
      return result
        .split('\n')
        .map((line) => (line.trim() ? indentStr + line : line))
        .join('\n');
    }
    return result;
  }
}

/**
 * 移除末尾的换行符
 */
export function trimLastNewline(text: string): string {
  return text.replace(/\n$/, '');
}

/**
 * 转义 HTML 标签
 */
export function escapeHTMLTags(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
