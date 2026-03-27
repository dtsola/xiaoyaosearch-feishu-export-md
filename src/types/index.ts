/**
 * @module types
 * @description 类型定义模块 - 飞书 API 和文档数据结构
 */

/**
 * 飞书文档 Block 类型枚举
 * 参考: https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block
 */
export enum BlockType {
  /** 文档根节点 */
  Page = 1,
  /** 段落 */
  Text = 2,
  Heading1 = 3,
  Heading2 = 4,
  Heading3 = 5,
  Heading4 = 6,
  Heading5 = 7,
  Heading6 = 8,
  Heading7 = 9,
  Heading8 = 10,
  Heading9 = 11,
  /** 无序列表 */
  Bullet = 12,
  /** 有序列表 */
  Ordered = 13,
  /** 代码块 */
  Code = 14,
  /** 引用 */
  Quote = 15,
  /** 引用文档 */
  MentionDoc = 16,
  /** 代办事项 */
  TodoList = 17,
  /** 多维表格 */
  Bitable = 18,
  /** 高亮块 */
  Callout = 19,
  /** 群聊卡片 */
  ChatCard = 20,
  /** 流程图/UML */
  Diagram = 21,
  /** 分割线 */
  Divider = 22,
  /** 文件 */
  File = 23,
  /** 分栏 */
  Grid = 24,
  /** 分栏列 */
  GridColumn = 25,
  /** 内嵌网页 */
  Iframe = 26,
  /** 图片 */
  Image = 27,
  /** 小组件 */
  Widget = 28,
  /** 思维笔记 */
  MindNote = 29,
  /** 电子表格 */
  Sheet = 30,
  /** 表格 */
  Table = 31,
  /** 表格单元格 */
  TableCell = 32,
  /** 视图 */
  View = 33,
  /** 引用容器 */
  QuoteContainer = 34,
  /** 画板 */
  Board = 43,
  /** 同步块 */
  SyncedBlock = 999,
}

/** 样式对齐方式 */
export enum StyleAlign {
  Left = 1,
  Center = 2,
  Right = 3,
}

/** 代码语言 */
export enum CodeLanguage {
  PlainText = 1,
  ABAP,
  Ada,
  Apache,
  Apex,
  AssemblyLanguage,
  Bash,
  CSharp,
  CPlusPlus,
  C,
  COBOL,
  CSS,
  CoffeeScript,
  D,
  Dart,
  Delphi,
  Django,
  Dockerfile,
  Erlang,
  Fortran,
  FoxPro,
  Go,
  Groovy,
  HTML,
  HTMLBars,
  HTTP,
  Haskell,
  JSON,
  Java,
  JavaScript,
  Julia,
  Kotlin,
  LateX,
  Lisp,
  Logo,
  Lua,
  MATLAB,
  Makefile,
  Markdown,
  Nginx,
  ObjectiveC,
  OpenEdgeABL,
  PHP,
  Perl,
  PostScript,
  PowerShell,
  Prolog,
  ProtoBuf,
  Python,
  R,
  RPG,
  Ruby,
  Rust,
  SAS,
  SCSS,
  SQL,
  Scala,
  Scheme,
  Scratch,
  Shell,
  Swift,
  Thrift,
  TypeScript,
  VBScript,
  VisualBasic,
  XML,
  YAML,
  CMake,
  Diff,
  Gherkin,
  GraphQL,
  OpenGLShadingLanguage,
  Properties,
  Solidity,
  TOML,
}

/**
 * 获取代码语言名称
 */
export function getCodeLanguage(code: CodeLanguage): string {
  switch (code) {
    case CodeLanguage.PlainText:
      return 'text';
    case CodeLanguage.AssemblyLanguage:
      return 'assembly';
    case CodeLanguage.CPlusPlus:
      return 'cpp';
    case CodeLanguage.CSharp:
      return 'csharp';
    case CodeLanguage.CoffeeScript:
      return 'coffee';
    case CodeLanguage.Dockerfile:
      return 'docker';
    case CodeLanguage.FoxPro:
      return 'foxpro';
    case CodeLanguage.TypeScript:
      return 'typescript';
    case CodeLanguage.JavaScript:
      return 'javascript';
    case CodeLanguage.Rust:
      return 'rust';
    case CodeLanguage.Python:
      return 'python';
    case CodeLanguage.Ruby:
      return 'ruby';
    case CodeLanguage.Markdown:
      return 'markdown';
    case CodeLanguage.ObjectiveC:
      return 'objectivec';
    case CodeLanguage.VisualBasic:
      return 'vb';
    default:
      return CodeLanguage[code]?.toLowerCase() || '';
  }
}

/** 颜色 */
export enum Color {
  LightPink = 1,
  LightOrange,
  LightYellow,
  LightGreen,
  LightBlue,
  LightPurple,
  LightGray,
  DarkPink,
  DarkOrange,
  DarkYellow,
  DarkGreen,
  DarkBlue,
  DarkPurple,
  DarkGray,
  DarkSilverGray,
}

/** 内嵌网页类型 */
export enum IframeType {
  Bilibili = 1,
  Xigua = 2,
  Youku = 3,
  Airtable = 4,
  BaiduMap = 5,
  GaodeMap = 6,
  Figma = 8,
  Modao = 9,
  Canva = 10,
  CodePen = 11,
  FeishuWenjuan = 12,
  Jinshuju = 13,
}

/** 文本样式 */
export interface TextStyle {
  align: StyleAlign;
  done: boolean;
  folded: boolean;
  language: CodeLanguage;
  wrap: boolean;
}

/** 文本链接 */
export interface TextLink {
  url: string;
}

/** 文本元素样式 */
export interface TextElementStyle {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  inline_code: boolean;
  background_color: Color;
  text_color: Color;
  link: TextLink;
}

/** 文本元素 */
export interface TextElement {
  text_run?: TextRun;
  file?: InlineFile;
  inline_block?: InlineBlock;
  equation?: TextRun;
  mention_doc?: MentionDoc;
}

/** 对象类型 */
export enum ObjType {
  Doc = 1,
  Sheet = 3,
  Bitable = 8,
  MindNote = 11,
  File = 12,
  Slide = 15,
  Wiki = 16,
  Docx = 22,
}

/** 引用文档 */
export interface MentionDoc {
  token: string;
  obj_type: ObjType;
  url: string;
  title: string;
  text_element_style: TextElementStyle;
}

/** 内联文件 */
export interface InlineFile {
  file_token: string;
  source_block_id: string;
  text_element_style: TextElementStyle;
}

/** 文本运行 */
export interface TextRun {
  content: string;
  text_element_style?: TextElementStyle;
}

/** 内联块 */
export interface InlineBlock {
  block_id: string;
  text_element_style: TextElementStyle;
}

/** 文本块 */
export interface TextBlock {
  style: TextStyle;
  elements: TextElement[];
  children: string[];
}

/** 图片块 */
export interface ImageBlock {
  width: number;
  height: number;
  token: string;
  align: StyleAlign;
}

/** 表格块 */
export interface TableBlock {
  cells: string[];
  property: {
    row_size: number;
    column_size: number;
    column_width: number[];
    header_column: boolean;
    header_row: boolean;
    merge_info: TableMergeInfo[];
  };
}

/** 表格合并信息 */
export interface TableMergeInfo {
  row_span: number;
  col_span: number;
}

/** 高亮块背景颜色 */
export enum CalloutBackgroundColor {
  LightRed = 1,
  LightOrange = 2,
  LightYellow = 3,
  LightGreen = 4,
  LightBlue = 5,
  LightPurple = 6,
  LightGray = 7,
  DarkRed = 8,
  DarkOrange = 9,
  DarkYellow = 10,
  DarkGreen = 11,
  DarkBlue = 12,
  DarkPurple = 13,
  DarkGray = 14,
}

/** 高亮块边框颜色 */
export enum CalloutBorderColor {
  Red = 1,
  Orange = 2,
  Yellow = 3,
  Green = 4,
  Blue = 5,
  Purple = 6,
  Gray = 7,
}

/** 字体颜色 */
export type FontColor = CalloutBorderColor;

/** 高亮块 */
export interface CalloutBlock {
  background_color: CalloutBackgroundColor;
  border_color: CalloutBorderColor;
  text_color: FontColor;
  emoji_id: string;
}

/** 文档块（联合类型） */
export interface Block {
  block_id: string;
  parent_id: string;
  children: string[];
  block_type: BlockType;
  page?: TextBlock;
  text?: TextBlock;
  heading1?: TextBlock;
  heading2?: TextBlock;
  heading3?: TextBlock;
  heading4?: TextBlock;
  heading5?: TextBlock;
  heading6?: TextBlock;
  heading7?: TextBlock;
  heading8?: TextBlock;
  heading9?: TextBlock;
  bullet?: TextBlock;
  ordered?: TextBlock;
  code?: TextBlock;
  quote?: TextBlock;
  todo?: TextBlock;
  bitable?: TextBlock;
  callout?: CalloutBlock;
  chat_card?: TextBlock;
  diagram?: TextBlock;
  divider?: TextBlock;
  file?: {
    name: string;
    token: string;
  };
  grid?: {
    column_size: number;
  };
  grid_column?: {
    width_ratio: number;
  };
  iframe?: {
    component: {
      iframe_type: IframeType;
      url: string;
    };
  };
  image?: ImageBlock;
  table?: TableBlock;
  table_cell?: TextBlock;
  board?: ImageBlock;
}

/** 文件 Token */
export interface FileToken {
  token: string;
  type: 'file' | 'image' | 'board';
}

// ==================== API 响应类型 ====================

/** 飞书 API 响应基础结构 */
export interface FeishuApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/** Tenant Access Token 响应 */
export interface TenantAccessTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

/** 文档信息 */
export interface DocumentInfo {
  document: {
    document_id: string;
    revision_id: number;
    title: string;
  };
}

/** 文档块响应 */
export interface DocumentBlocksResponse {
  items: Block[];
  has_more: boolean;
  page_token?: string;
}

// ==================== Wiki 类型 ====================

/** Wiki 节点信息 */
export interface WikiNodeInfo {
  node: {
    space_id: string;
    node_token: string;
    obj_token: string;
    obj_type: string;
    parent_node_token: string;
    node_type: string;
    origin_node_token: string;
    origin_space_id: string;
    has_child: boolean;
    title: string;
    obj_create_time: string;
    obj_edit_time: string;
    node_create_time: string;
    creator: string;
    owner: string;
  };
}

// ==================== 应用配置 ====================

/** 应用配置 */
export interface IConfig {
  appId: string;
  appSecret: string;
  endpoint: string;
  outputDir: string;
  concurrency?: number;
  timeout?: number;
}

// ==================== 辅助函数 ====================

/**
 * 获取对齐样式
 */
export function getAlignStyle(align: StyleAlign): string {
  switch (align) {
    case StyleAlign.Left:
      return 'left';
    case StyleAlign.Center:
      return 'center';
    case StyleAlign.Right:
      return 'right';
    default:
      return 'left';
  }
}
