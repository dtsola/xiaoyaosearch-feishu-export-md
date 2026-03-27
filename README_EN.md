# Xiaoyao Search Feishu Export Tool

English | [简体中文](README.md)

> A CLI tool to export Feishu (Lark) documents and wikis to Markdown format

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen.svg)](https://nodejs.org)

> **💡 This tool is an extension of the [Xiaoyao Search](https://github.com/dtsola/xiaoyaosearch) ecosystem**
>
> [Xiaoyao Search](https://github.com/dtsola/xiaoyaosearch) — XiaoyaoSearch: Understands your words, reads your images, finds any local file with AI. Making search as easy as chatting.

---

## Author

<p align="center">
  <img src="docs/产品文档/产品截图/作者头像.jpg" alt="dtsola" width="120" height="120" style="border-radius: 50%;">
</p>

<p align="center">
  <b>dtsola</b> — IT Solution Architect | Solopreneur
</p>

<p align="center">
  🌐 <a href="https://www.dtsola.com">Website</a> &nbsp;|&nbsp;
  📺 <a href="https://space.bilibili.com/736015">Bilibili</a> &nbsp;|&nbsp;
  💬 WeChat: dtsola (Technical Discussion | Business)
</p>

---

## Target Audience

- 👨‍💻 **Knowledge Management Enthusiasts** - Backup cloud documents locally to prevent data loss
- 💼 **Freelancers** - Migrate Feishu content to Obsidian, Logseq, and other local note-taking tools
- 🏢 **Startup IT Ops** - Responsible for regular enterprise knowledge base backups and compliance archiving
- 📝 **Technical Document Maintainers** - Export API documentation to Git repositories for version control
- 🚀 **DevOps Engineers** - Integrate export tools into scheduled tasks for automated backups
- 🎓 **Students** - Use across different platforms like Windows/macOS/Linux

## Use Cases

### 📦 Personal Knowledge Backup
Backup valuable Feishu documents locally for offline access anytime, while avoiding cloud data loss risks.

### 🔄 Note Tool Migration
Export to standard Markdown format for easy migration to other knowledge management tools like Obsidian, Logseq, or Notion.

### 🏛️ Enterprise Knowledge Archiving
Batch export entire Feishu knowledge bases while maintaining the original directory structure to meet enterprise compliance and audit requirements.

### 📊 Technical Document Version Control
Export API documentation and technical specifications to local Git repositories for complete version control and change tracking.

### ⏰ Automated Scheduled Backups
Integrate the CLI tool into crontab or CI/CD pipelines for unattended automated knowledge base backups.

### 🌐 Cross-Platform Flexibility
Use the same commands to complete export operations on Windows, macOS, or Linux.

---

## Features

- ✅ Single document export
- ✅ Wiki document export
- ✅ Batch document export
- ✅ Recursive folder export
- ✅ Complete knowledge base export
- ✅ Automatic download of images and attachments
- ✅ Incremental export (only export updated documents)
- ✅ Concurrency control (configurable API concurrency)
- ✅ Interactive configuration initialization
- ✅ Multiple configuration file support

## Installation

### Requirements

- **Node.js**: 21.x+ ([Download](https://nodejs.org/en/download))
- **npm**: 18.x+ or pnpm 8.x+

### Global Installation

```bash
npm install -g xiaoyaosearch-feishu-export
```

### Local Usage

```bash
# Clone repository
git clone https://github.com/xiaoyaosearch/xiaoyaosearch-feishu-export-md.git
cd xiaoyaosearch-feishu-export-md

# Install dependencies
npm install

# Build project
npm run build

# Link to global (optional)
npm link
```

## Quick Start

### 1. Create Feishu App

1. Visit [Feishu Open Platform](https://open.feishu.cn/app)
2. Create a self-built app
3. Enable the following permissions:
   - `docx:document:readonly` - Get document content
   - `drive:drive:readonly` - Get files/images
   - `wiki:wiki:readonly` - Get knowledge base (required for wiki export)
4. Publish app and wait for approval

### 2. Initialize Configuration

```bash
feishu-export init
```

Follow prompts to enter:
- App ID
- App Secret
- Default output directory

### 3. Export Documents

```bash
# Export single document
feishu-export export -d doxcnXXXXXXXX

# Export wiki document
feishu-export export -w wiki_node_token
```

## Command Reference

### `init` - Initialize Configuration

```bash
feishu-export init [--profile <name>]
```

Options:
- `-p, --profile <name>` - Specify configuration profile name (default: default)

### `export` - Export Single Document

```bash
feishu-export export (-d <doc_id> | -w <wiki_id>) [options]
```

Options:
- `-d, --doc <token>` - Document ID or URL
- `-w, --wiki <token>` - Wiki node token or URL
- `-o, --output <dir>` - Output directory (default: ./output)
- `--no-images` - Skip image download
- `--incremental` - Incremental export mode
- `--debug` - Output detailed debug logs

### `docs` - Batch Export Documents

```bash
feishu-export docs [options]
```

Options:
- `--file <path>` - Read document ID list from file
- `--ids <list>` - Comma-separated document ID list
- `-o, --output <dir>` - Output directory (default: ./output)
- `--no-images` - Skip image download
- `--incremental` - Incremental export mode
- `-c, --concurrency <n>` - Concurrency number (default: 5)

### `folder` - Export Folder

```bash
feishu-export folder <folder_id> [options]
```

Options:
- `-o, --output <dir>` - Output directory (default: ./output)
- `--depth <n>` - Maximum recursion depth
- `--no-images` - Skip image download

### `wiki` - Export Complete Knowledge Base

```bash
feishu-export wiki <wiki_id> [options]
```

Options:
- `-o, --output <dir>` - Output directory (default: ./output)
- `--index-only` - Generate index file only
- `--depth <n>` - Maximum recursion depth
- `--no-images` - Skip image download

### `config` - Configuration Management

```bash
feishu-export config get [key]
feishu-export config set <key> <value>
feishu-export config reset
feishu-export config list
feishu-export config use <profile>
```

## Usage Examples

### Getting Document IDs

Extract IDs from Feishu document URLs:

```bash
# Document URL: https://xxx.feishu.cn/docx/doxcnXXXXXXXX
# Document ID: doxcnXXXXXXXX

# Wiki URL: https://xxx.feishu.cn/wiki/V0gQw6yEZikjBAkKcrVcd8OlnYe
# Node ID: V0gQw6yEZikjBAkKcrVcd8OlnYe
```

### Batch Export

Create a text file `docs.txt`:

```text
doxcnDocumentId1
doxcnDocumentId2
doxcnDocumentId3
```

Run batch export:

```bash
feishu-export docs --file docs.txt -o ./output
```

### Incremental Export

Export only updated documents:

```bash
feishu-export docs --file docs.txt --incremental
```

### Concurrency Control

Control API concurrent request count (avoid rate limiting):

```bash
feishu-export docs --file docs.txt --concurrency 3
```

## Configuration File

Configuration file location: `~/.feishu-export/config.json`

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

## Environment Variables

Configuration can also be set via environment variables:

```bash
export FEISHU_APP_ID="cli_xxxxxxxxx"
export FEISHU_APP_SECRET="xxxxxxxxxxxxxxxx"
export OUTPUT_DIR="./output"
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build project
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

## FAQ

### 1. Authentication Failed

Check if App ID and App Secret are correct, ensure the app is published and approved.

### 2. Insufficient Permissions

Ensure the app has the required permissions:
- `docx:document:readonly`
- `drive:drive:readonly`
- `wiki:wiki:readonly` (required for wiki export)

### 3. API Rate Limiting

Use the `--concurrency` parameter to reduce concurrent requests, default is 5.

### 4. Document Not Found

Confirm the document ID is correct and you have access permissions.

## License

[MIT](LICENSE)

## Related Links

- [Xiaoyao Search](https://github.com/dtsola/xiaoyaosearch) - Local AI Search Tool
- [Feishu Open Platform](https://open.feishu.cn/)
- [Feishu API Documentation](https://open.feishu.cn/document/)
- [Changelog](CHANGELOG.md)
