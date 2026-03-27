# 小遥搜索飞书导出工具

[English](README_EN.md) | 简体中文

> 将飞书文档/知识库导出为 Markdown 格式的 CLI 工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen.svg)](https://nodejs.org)

> **💡 本工具是 [小遥搜索](https://github.com/dtsola/xiaoyaosearch) 生态的扩展工具**
>
> [小遥搜索](https://github.com/dtsola/xiaoyaosearch) —— 听懂你的话、看懂你的图，用 AI 找到本地任何文件。让搜索像聊天一样简单。

<!-- <p align="center">
  <img src="docs/产品文档/产品截图/宣传海报图.png" alt="小遥搜索飞书导出工具宣传海报">
</p> -->

---

## 作者介绍

<p align="center">
  <img src="docs/产品文档/产品截图/作者头像.jpg" alt="dtsola" width="120" height="120" style="border-radius: 50%;">
</p>

<p align="center">
  <b>dtsola</b> — IT解决方案架构师 | 一人公司实践者
</p>

<p align="center">
  🌐 <a href="https://www.dtsola.com">个人站点</a> &nbsp;|&nbsp;
  📺 <a href="https://space.bilibili.com/736015">B站</a> &nbsp;|&nbsp;
  💬 微信：dtsola（技术交流 | 商务合作）
</p>

<p align="center">
  <img src="docs/产品文档/产品截图/个人二维码.png" alt="微信二维码" width="120">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/产品文档/产品截图/开发者交流群图.png" alt="开发者交流群" width="120">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/产品文档/产品截图/用户交流群图.png" alt="用户交流群" width="120">
</p>

<p align="center">
  <small>微信联系 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 开发者交流群 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 用户交流群</small>
</p>

---

## 适用人群

- 👨‍💻 **知识管理爱好者** - 希望将云端文档备份到本地，防止数据丢失
- 💼 **自由职业者** - 需要将飞书内容迁移到 Obsidian、Logseq 等本地笔记工具
- 🏢 **创业团队 IT 运维** - 负责企业知识库的定期备份和合规归档
- 📝 **技术文档维护者** - 需要将 API 文档导出到 Git 仓库进行版本控制
- 🚀 **DevOps 工程师** - 希望将导出工具集成到定时任务实现自动化备份
- 🎓 **学生用户** - 在 Windows/macOS/Linux 等不同平台上都需要使用

## 使用场景

### 📦 个人知识备份
将珍贵的飞书文档备份到本地，即使没有网络也能随时查看，同时避免云端数据丢失风险。

### 🔄 笔记工具迁移
导出为标准 Markdown 格式，轻松迁移到 Obsidian、Logseq、Notion 等其他知识管理工具。

### 🏛️ 企业知识归档
批量导出整个飞书知识库，保持原有目录结构，满足企业合规和审计要求。

### 📊 技术文档版本控制
将 API 文档、技术规范导出到本地 Git 仓库，实现完整的版本控制和变更追踪。

### ⏰ 自动化定时备份
通过 CLI 工具集成到 crontab 或 CI/CD 流程，实现无人值守的自动化知识库备份。

### 🌐 跨平台灵活使用
无论是在 Windows、macOS 还是 Linux，都能统一使用相同的命令完成导出操作。

---

## 特性

- ✅ 支持单个文档导出
- ✅ 支持知识库文档导出
- ✅ 支持批量文档导出
- ✅ 支持文件夹递归导出
- ✅ 支持完整知识库导出
- ✅ 自动下载图片和附件
- ✅ 增量导出（仅导出有更新的文档）
- ✅ 并发控制（可配置 API 并发数）
- ✅ 交互式配置初始化
- ✅ 多配置文件支持

## 安装

### 环境要求

- **Node.js**: 21.x+ ([下载地址](https://nodejs.org/en/download))
- **npm**: 18.x+ 或 pnpm 8.x+

### 全局安装

```bash
npm install -g xiaoyaosearch-feishu-export
```

### 本地使用

```bash
# 克隆仓库
git clone https://github.com/xiaoyaosearch/xiaoyaosearch-feishu-export-md.git
cd xiaoyaosearch-feishu-export-md

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局（可选）
npm link
```

## 快速开始

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建自建应用
3. 开通以下权限：
   - `docx:document:readonly` - 获取文档内容
   - `drive:drive:readonly` - 获取文件/图片
   - `wiki:wiki:readonly` - 获取知识库（如需导出知识库）
4. 发布应用并等待审批通过

### 2. 初始化配置

```bash
feishu-export init
```

按提示输入：
- App ID
- App Secret
- 默认输出目录

### 3. 导出文档

```bash
# 导出单个文档
feishu-export export -d doxcnXXXXXXXX

# 导出知识库文档
feishu-export export -w wiki_node_token
```

## 命令参考

### `init` - 初始化配置

```bash
feishu-export init [--profile <name>]
```

选项：
- `-p, --profile <name>` - 指定配置文件名称（默认：default）

### `export` - 导出单个文档

```bash
feishu-export export (-d <doc_id> | -w <wiki_id>) [options]
```

选项：
- `-d, --doc <token>` - 云文档的 document_id 或 URL
- `-w, --wiki <token>` - 知识库文档的 node_token 或 URL
- `-o, --output <dir>` - 输出目录（默认：./output）
- `--no-images` - 不下载图片
- `--incremental` - 增量导出模式
- `--debug` - 输出详细调试日志

### `docs` - 批量导出文档

```bash
feishu-export docs [options]
```

选项：
- `--file <path>` - 从文件读取文档 ID 列表
- `--ids <list>` - 逗号分隔的文档 ID 列表
- `-o, --output <dir>` - 输出目录（默认：./output）
- `--no-images` - 不下载图片
- `--incremental` - 增量导出模式
- `-c, --concurrency <n>` - 并发数量（默认：5）

### `folder` - 导出文件夹

```bash
feishu-export folder <folder_id> [options]
```

选项：
- `-o, --output <dir>` - 输出目录（默认：./output）
- `--depth <n>` - 最大递归深度
- `--no-images` - 不下载图片

### `wiki` - 导出完整知识库

```bash
feishu-export wiki <wiki_id> [options]
```

选项：
- `-o, --output <dir>` - 输出目录（默认：./output）
- `--index-only` - 仅生成索引文件
- `--depth <n>` - 最大递归深度
- `--no-images` - 不下载图片

### `config` - 配置管理

```bash
feishu-export config get [key]
feishu-export config set <key> <value>
feishu-export config reset
feishu-export config list
feishu-export config use <profile>
```

## 使用示例

### 获取文档 ID

从飞书文档 URL 中提取 ID：

```bash
# 云文档 URL: https://xxx.feishu.cn/docx/doxcnXXXXXXXX
# 文档 ID: doxcnXXXXXXXX

# 知识库 URL: https://xxx.feishu.cn/wiki/V0gQw6yEZikjBAkKcrVcd8OlnYe
# 节点 ID: V0gQw6yEZikjBAkKcrVcd8OlnYe
```

### 批量导出

创建一个文本文件 `docs.txt`：

```text
doxcnDocumentId1
doxcnDocumentId2
doxcnDocumentId3
```

执行批量导出：

```bash
feishu-export docs --file docs.txt -o ./output
```

### 增量导出

仅导出有更新的文档：

```bash
feishu-export docs --file docs.txt --incremental
```

### 并发控制

控制 API 并发请求数量（避免触发限流）：

```bash
feishu-export docs --file docs.txt --concurrency 3
```

## 配置文件

配置文件位置：`~/.feishu-export/config.json`

```json
{
  "profiles": {
    "default": {
      "appId": "cli_xxxxxxxxx",
      "appSecret": "xxxxxxxxxxxxxxxx",
      "endpoint": "https://open.feishu.cn",
      "outputDir": "./output"
    }
  },
  "currentProfile": "default"
}
```

## 环境变量

也可以通过环境变量设置配置：

```bash
export FEISHU_APP_ID="cli_xxxxxxxxx"
export FEISHU_APP_SECRET="xxxxxxxxxxxxxxxx"
export OUTPUT_DIR="./output"
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 常见问题

### 1. 认证失败

检查 App ID 和 App Secret 是否正确，确认应用已发布并审批通过。

### 2. 权限不足

确认应用已开通必要权限：
- `docx:document:readonly`
- `drive:drive:readonly`
- `wiki:wiki:readonly`（导出知识库需要）

### 3. API 限流

使用 `--concurrency` 参数降低并发数，默认值为 5。

### 4. 找不到文档

确认文档 ID 正确且有访问权限。

## 许可证

[MIT](LICENSE)

## 相关链接

- [小遥搜索](https://github.com/dtsola/xiaoyaosearch) - 本地 AI 搜索工具
- [飞书开放平台](https://open.feishu.cn/)
- [飞书 API 文档](https://open.feishu.cn/document/)
- [更新日志](CHANGELOG.md)
