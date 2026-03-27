# PRD：小遥搜索飞书导出工具 MVP版本

## 1. 产品定位（一句话）

为飞书用户提供跨平台命令行的文档/知识库导出工具，将飞书内容批量导出为本地Markdown格式，支持保留目录结构和资源文件。

---

## 2. 用户故事（核心场景）

### 场景1：个人用户备份文档
- **作为** 知识管理爱好者
- **我想要** 将我的飞书文档备份到本地
- **以便于** 在没有网络时也能查看，并防止云端数据丢失

### 场景2：迁移到其他笔记工具
- **作为** 自由职业者
- **我想要** 将飞书文档导出为Markdown格式
- **以便于** 迁移到Obsidian、Logseq等其他本地笔记工具

### 场景3：企业知识库归档
- **作为** 创业团队的IT运维人员
- **我想要** 批量导出整个飞书知识库
- **以便于** 进行定期备份和合规归档

### 场景4：技术文档版本控制
- **作为** 技术文档维护者
- **我想要** 将API文档导出到本地Git仓库
- **以便于** 进行版本控制和变更追踪

### 场景5：自动化备份
- **作为** DevOps工程师
- **我想要** 将导出工具集成到定时任务
- **以便于** 每天自动备份公司知识库

### 场景6：跨平台使用
- **作为** 学生用户
- **我想要** 在Windows/macOS/Linux上都能使用
- **以便于** 在不同设备上都能完成导出操作

---

## 3. 功能清单（MVP范围）

> **MVP定义**：P0 + P1 功能均为MVP必须实现的功能

### P0功能（必须有）

#### 3.1 配置管理模块
- [ ] **配置初始化** (`feishu-export init`)
  - 交互式引导用户输入飞书App ID和App Secret
  - 生成配置文件 `~/.feishu-export/config.json`
  - 验证配置有效性（测试API连接）
- [ ] **配置查看** (`feishu-export config get`)
  - 显示当前配置信息（脱敏处理）
- [ ] **配置更新** (`feishu-export config set`)
  - 更新单个配置项
  - 支持重置配置
- [ ] **多租户支持**
  - 支持存储多个飞书应用配置
  - 通过 `--profile` 参数切换

#### 3.2 文档导出模块
- [ ] **单文档导出** (`feishu-export doc <doc_id>`)
  - 支持通过文档ID导出单个文档
  - 保留文档标题、正文、表格
  - **可选**下载图片到本地 `assets/` 目录（`--no-images` 跳过）
  - **可选**下载附件到本地（`--no-attachments` 跳过）
  - 下载时更新Markdown中的引用为本地路径
- [ ] **批量文档导出** (`feishu-export docs --file <ids.txt>`)
  - 从文件读取文档ID列表
  - 支持命令行传参多个ID
  - 显示导出进度和结果统计
  - 支持图片/附件下载选项
- [ ] **文件夹导出** (`feishu-export folder <folder_id>`)
  - 递归导出文件夹下所有文档
  - 保持文件夹层级结构
  - 支持设置最大递归深度

#### 3.3 知识库导出模块
- [ ] **完整知识库导出** (`feishu-export wiki <wiki_id>`)
  - 导出整个知识库的目录结构
  - 保留知识库的层级关系
  - 生成索引文件 `README.md`
  - 支持图片/附件下载选项
- [ ] **单节点导出** (`feishu-export wiki-node <node_id>`)
  - 导出知识库中的单个节点
  - 支持指定导出深度

#### 3.4 认证与授权
- [ ] **飞书开放平台认证**
  - 支持App ID + App Secret认证方式
  - 自动获取和管理 tenant_access_token
  - Token自动刷新机制
- [ ] **权限验证**
  - 导出前验证用户对文档的访问权限
  - 友好的权限错误提示

#### 3.5 资源处理（可选）
- [ ] **图片下载**（默认启用，可通过 `--no-images` 禁用）
  - 自动识别并下载文档中的图片
  - 支持PNG、JPG、JPEG、GIF等格式
  - 处理图片重名冲突（追加序号）
  - 未下载时保留原始URL引用
- [ ] **附件处理**（默认启用，可通过 `--no-attachments` 禁用）
  - 下载附件到本地 `assets/` 目录
  - 下载时在Markdown中更新为本地链接
  - 未下载时保留附件原始链接

### P1功能（MVP必须实现）

#### 3.6 增量导出
- [ ] **变更检测**
  - 记录每次导出的文档元数据（`~/.feishu-export/meta.json`）
  - 通过文档的 `updated_at` 字段判断是否需要更新
- [ ] **增量导出模式** (`--incremental`)
  - 仅导出有变更的文档
  - 跳过未修改的文档以节省API调用

#### 3.7 并发控制
- [ ] **并发请求配置**
  - 支持设置并发数（默认3，最大10）
  - 避免触发API限流
- [ ] **速率限制**
  - 实现令牌桶算法
  - 自动适配飞书API限流策略

#### 3.8 进度显示
- [ ] **命令行进度条**
  - 显示当前导出进度（已处理/总数）
  - 显示当前处理速度（文档/秒）
  - 预估剩余时间
- [ ] **详细日志** (`--verbose`)
  - 显示每个文档的导出状态
  - 显示API请求详情

#### 3.9 错误处理
- [ ] **重试机制**
  - 网络错误自动重试（最多3次）
  - 指数退避策略
- [ ] **断点续传**
  - 记录导出进度到中间文件
  - 支持从中断处继续导出

### P2功能（未来考虑）

- [ ] **导出模板定制** - 支持自定义Markdown导出格式
- [ ] **多格式支持** - 支持导出为HTML、PDF格式
- [ ] **全文搜索** - 在本地导出的文档中进行全文搜索
- [ ] **自动更新** - CLI工具自动检测新版本

---

## 4. 核心流程图

### 4.1 首次使用流程

```
用户安装工具
    ↓
feishu-export init
    ↓
交互式输入App ID & Secret
    ↓
验证API连接
    ↓
配置保存成功
    ↓
feishu-export doc <doc_id> (首次导出测试)
```

### 4.2 日常导出流程

```
用户执行导出命令
    ↓
读取配置文件和参数
    ↓
获取 tenant_access_token
    ↓
遍历文档列表
    ↓
并发请求文档内容
    ↓
转换Markdown格式
    ↓
是否下载图片/附件？
    ├─ 是 → 下载资源 → 更新引用
    └─ 否 → 保留原始链接
    ↓
写入本地文件
    ↓
显示导出报告
```

### 4.3 错误处理流程

```
捕获异常
    ↓
判断错误类型
    ├─ 认证失败 → 提示重新配置 → 退出
    ├─ 权限不足 → 记录失败ID → 继续
    ├─ 网络错误 → 重试（最多3次）
    ├─ API限流 → 等待后重试
    └─ 未知错误 → 记录日志 → 跳过
    ↓
生成错误报告
```

---

## 5. 命令结构

### 5.1 命令树

```
feishu-export
├── init                    # 初始化配置
├── config                  # 配置管理
│   ├── get [key]          # 查看配置
│   ├── set <key> <value>  # 设置配置
│   └── reset              # 重置配置
├── doc <doc_id>           # 导出单个文档
├── docs                   # 批量导出文档
│   ├── --file <path>      # 从文件读取ID列表
│   └── --ids <id1,id2>    # 直接指定ID列表
├── folder <folder_id>     # 导出文件夹
├── wiki <wiki_id>         # 导出知识库
├── wiki-node <node_id>    # 导出知识库节点
└── --version              # 显示版本信息
```

### 5.2 全局参数

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--output` | `-o` | string | `./output` | 输出目录路径 |
| `--concurrency` | `-c` | number | `3` | 并发请求数（1-10） |
| `--incremental` | `-i` | flag | `false` | 增量导出模式 |
| `--no-images` | - | flag | `false` | 跳过图片下载，保留原始URL |
| `--no-attachments` | - | flag | `false` | 跳过附件下载，保留原始链接 |
| `--assets-dir` | - | string | `assets` | 资源文件目录名称 |
| `--verbose` | `-v` | flag | `false` | 显示详细日志 |
| `--profile` | `-p` | string | `default` | 使用的配置文件名称 |
| `--timeout` | `-t` | number | `30000` | API请求超时时间(ms) |
| `--help` | `-h` | flag | - | 显示帮助信息 |

### 5.3 命令详细说明

#### `feishu-export init`
初始化配置，交互式引导用户输入。

```bash
feishu-export init [--profile <name>]
```

**交互流程：**
1. 提示用户输入飞书App ID
2. 提示用户输入飞书App Secret
3. 选择默认输出目录
4. 验证配置有效性
5. 保存配置文件

#### `feishu-export doc <doc_id>`
导出单个文档。

```bash
feishu-export doc <doc_id> [--output <path>] [--no-images] [--no-attachments]
```

**示例：**
```bash
# 完整导出（包含图片和附件）
feishu-export doc doxcnAbCdEfGhIjKlMnOpQrStUv

# 仅导出Markdown，不下载图片和附件
feishu-export doc doxcnAbCdEfGhIjKlMnOpQrStUv --no-images --no-attachments

# 指定输出目录
feishu-export doc doxcnAbCdEfGhIjKlMnOpQrStUv -o ./docs
```

#### `feishu-export docs`
批量导出文档。

```bash
feishu-export docs --file <path> | --ids <id1,id2,...>
```

**示例：**
```bash
feishu-export docs --file ./doc_ids.txt
feishu-export docs --ids "doxcnAbCd,doxcnEfGh,doxcnIjKl"
```

**doc_ids.txt 格式：**
```
# 每行一个文档ID，支持#注释
doxcnAbCdEfGhIjKlMnOpQrStUv
doxcn1234567890abcdefghij
```

#### `feishu-export folder <folder_id>`
导出文件夹及子文档。

```bash
feishu-export folder <folder_id> [--depth <number>]
```

**参数：**
- `--depth`: 最大递归深度，默认不限制

#### `feishu-export wiki <wiki_id>`
导出完整知识库。

```bash
feishu-export wiki <wiki_id> [--index-only]
```

**参数：**
- `--index-only`: 仅导出目录索引，不导出文档内容

---

## 6. 日志记录计划

### 6.1 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| ERROR | 错误信息，需要用户关注 | 认证失败、权限不足 |
| WARN | 警告信息，不影响主要流程 | API限流、部分文档失败 |
| INFO | 一般信息，默认显示 | 开始导出、导出完成 |
| DEBUG | 调试信息，仅 `--verbose` 模式 | API请求详情 |

### 6.2 日志事件

| 事件 | 级别 | 记录内容 |
|------|------|----------|
| 命令开始执行 | INFO | 命令名称、参数 |
| 配置加载 | DEBUG | 配置文件路径、配置项 |
| API调用 | DEBUG | 请求URL、响应状态码 |
| 文档导出成功 | INFO | 文档ID、标题、输出路径 |
| 文档导出失败 | ERROR | 文档ID、错误原因 |
| 图片下载 | DEBUG | 原URL、本地路径 |
| 跳过图片下载 | INFO | 用户指定 `--no-images` |
| 附件下载 | DEBUG | 原URL、本地路径 |
| 跳过附件下载 | INFO | 用户指定 `--no-attachments` |
| API限流 | WARN | 限流触发、等待时间 |
| 命令执行完成 | INFO | 总数、成功数、失败数、耗时 |

### 6.3 日志输出

**控制台输出：**
- 默认仅显示 INFO 及以上级别
- `--verbose` 模式显示 DEBUG 级别
- 使用彩色输出提高可读性（成功=绿色，错误=红色，警告=黄色）

**日志文件：**
- 路径：`~/.feishu-export/logs/`
- 文件命名：`feishu-export-YYYY-MM-DD.log`
- 日志轮转：单个文件最大10MB，保留最近7天

---

## 7. 非功能需求

### 7.1 性能要求

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 工具启动时间 | < 1秒 | 命令执行到显示第一个输出 |
| 单文档导出 | < 3秒 | 从请求到写入完成 |
| 批量导出（100文档） | < 5分钟 | 总耗时统计 |
| 内存占用 | < 200MB | Node.js进程内存 |
| CPU占用 | < 30%（空闲时） | 系统监控 |

### 7.2 兼容性要求

| 平台 | Node.js版本 | 测试状态 |
|------|-------------|----------|
| Windows 10/11 | 18.x, 20.x | ✅ 必须支持 |
| macOS 12+ | 18.x, 20.x | ✅ 必须支持 |
| Ubuntu 20.04+ | 18.x, 20.x | ✅ 必须支持 |
| CentOS 7+ | 18.x, 20.x | ⚠️ 尽力支持 |

### 7.3 安全要求

| 要求 | 实现方式 |
|------|----------|
| 敏感信息保护 | 配置文件中的Secret加密存储（可选） |
| 传输安全 | 强制使用HTTPS |
| 权限最小化 | 仅请求必要的API权限 |
| 数据隔离 | 不同profile的配置和缓存隔离 |
| 日志脱敏 | 日志中不输出App Secret等敏感信息 |

### 7.4 可靠性要求

| 要求 | 目标 |
|------|------|
| 错误恢复 | 网络错误自动重试，最多3次 |
| 数据完整性 | 导出失败不影响已完成的文档 |
| 幂等性 | 重复执行同一命令产生相同结果 |
| 资源清理 | 异常退出时清理临时文件 |

---

## 8. 附录

### 8.1 错误码表

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| `E001` | 配置文件不存在 | 运行 `feishu-export init` |
| `E002` | App ID或App Secret无效 | 检查配置文件，重新输入 |
| `E003` | 无法获取access_token | 检查网络连接和App凭证 |
| `E004` | 文档不存在或无权访问 | 确认文档ID和权限 |
| `E005` | API调用限流 | 程序自动等待后重试 |
| `E006` | 网络连接超时 | 检查网络连接 |
| `E007` | 输出目录无写入权限 | 检查目录权限 |
| `E008` | 磁盘空间不足 | 清理磁盘空间 |
| `E009` | Node.js版本过低 | 升级到18.x以上 |

### 8.2 API限流策略

飞书开放平台API限流规则：
- **tenant_access_token**: 每分钟最多刷新100次
- **文档内容API**: 每秒最多5次请求
- **图片下载**: 每秒最多10次请求

**工具适配策略：**
- 实现令牌桶算法
- 默认并发数为3，避免触发限流
- 检测到429状态码自动退避重试

### 8.3 技术选型说明

| 组件 | 选择 | 理由 |
|------|------|------|
| CLI框架 | Commander.js | 成熟稳定，社区活跃 |
| HTTP客户端 | Axios | 支持拦截器，便于处理Token |
| 进度显示 | cli-progress | 支持多种进度条样式 |
| 日志 | Winston | 支持多输出和日志分级 |
| Markdown转换 | 自研 + turndown | 飞书富文本定制需求 |
| 配置管理 | cosmiconfig | 支持多种配置文件格式 |

### 8.4 目录结构示例

**包含资源的导出（默认）：**
```
output/
├── my-folder/
│   ├── doc1.md
│   ├── doc2.md
│   └── assets/
│       ├── image1.png
│       └── file.pdf
└── my-wiki/
    ├── README.md          # 知识库索引
    ├── chapter1/
    │   ├── page1.md
    │   └── page2.md
    └── assets/
        └── cover.png
```

**不含资源的导出（使用 --no-images --no-attachments）：**
```
output/
├── my-folder/
│   ├── doc1.md           # 图片保留原始URL
│   └── doc2.md
└── my-wiki/
    ├── README.md
    └── chapter1/
        ├── page1.md
        └── page2.md
```

---

**创建日期：** 2026-03-27
**基于MRD：** [00-mrd.md](./00-mrd.md)
**预计开发时间：** 4-5周（MVP包含P0+P1功能）
**上线时间目标：** 待定
**版本：** v1.0-MVP
