# 小遥搜索飞书导出工具 - AI 助手规范

> **项目概述**：这是一个基于 TypeScript + Node.js 的飞书文档/知识库导出 CLI 工具，支持批量导出为 Markdown 格式。

---

## 一、语言与沟通规范

### 1.1 强制中文规则
- **所有 AI 回复必须使用中文**
- **所有文档编写必须使用中文**
- **所有代码注释必须使用中文**
- **所有变量/函数命名使用英文**，但注释说明用中文

### 1.2 功能完成自检清单
每次完成一个功能后，**必须**自己检查一遍是否真正完成：

```markdown
## 功能自检清单
- [ ] 功能是否按照 PRD 需求完整实现？
- [ ] 是否处理了边界情况和错误场景？
- [ ] 是否添加了必要的日志输出？
- [ ] 代码是否通过了 ESLint 检查？
- [ ] 代码是否通过了 TypeScript 类型检查？
- [ ] 是否编写/更新了相关测试用例？
- [ ] 是否更新了相关文档？
- [ ] 是否在本地实际测试通过？
```

---

## 二、技术选型规范

### 2.1 核心技术栈

| 类别 | 技术选型 | 版本要求 | 说明 |
|------|---------|---------|------|
| 运行时 | Node.js | 18.x+ | LTS 版本 |
| 编程语言 | TypeScript | 5.x+ | 严格模式 |
| 包管理器 | pnpm | 8.x+ | 强制使用 pnpm |
| CLI 框架 | Commander.js | 12.x+ | 命令行框架 |
| HTTP 客户端 | Axios | 1.x+ | 请求拦截器支持 |
| 速率限制 | bottleneck | 2.x+ | 令牌桶算法 |
| 进度显示 | cli-progress | 3.x+ | 进度条 |
| 交互配置 | inquirer | 9.x+ | 交互式输入 |
| Markdown 转换 | turndown | 7.x+ | HTML → MD |
| 日志 | winston | 3.x+ | 日志框架 |
| 配置管理 | cosmiconfig | 9.x+ | 多格式支持 |
| 文件操作 | fs-extra | 11.x+ | 增强的 fs |
| 构建工具 | tsup | 8.x+ | 快速打包 |
| 测试框架 | Vitest | 1.x+ | 单元测试 |
| 代码检查 | ESLint | 8.x+ | 代码质量 |
| 代码格式化 | Prettier | 3.x+ | 代码风格 |

### 2.2 技术选型参考文档
详见：[技术选型文档](./docs/技术选型.md)

---

## 三、代码规范

### 3.1 命名约定

| 类型 | 命名风格 | 示例 |
|------|---------|------|
| 类 / 接口 / 类型 | PascalCase | `ConfigManager`, `AuthClient` |
| 函数 / 变量 | camelCase | `getAccessToken()`, `configPath` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_ENDPOINT` |
| 文件名 | kebab-case | `rate-limiter.ts`, `markdown.ts` |
| 接口（非组件） | `I` 前缀 | `IConfig`, `IFeishuBlock` |

### 3.2 目录结构规范

```
src/
├── commands/       # CLI 命令层，每个命令一个文件
├── core/          # 核心业务逻辑，按业务模块划分
├── converter/     # 格式转换，保持独立性
├── utils/         # 工具模块，纯函数优先
├── api/           # API 客户端，按 API 模块划分
├── types/         # TypeScript 类型声明
└── constants/     # 全局常量和枚举
```

详细架构说明：[代码架构文档](./docs/代码架构文档.md)

### 3.3 代码风格规则

- 使用 **ESLint** 进行代码检查
- 使用 **Prettier** 进行代码格式化
- 使用 **TypeScript** 严格模式
- 导入顺序：外部库 → 内部模块 → 类型导入
- 文件头部必须添加注释说明模块功能

### 3.4 注释规范

```typescript
/**
 * 文件级注释：说明文件功能
 * @module config
 * @description 配置管理模块，负责配置文件的读写和验证
 */

// 函数注释：使用 JSDoc 风格
/**
 * 获取访问令牌
 * @param {string} appId - 飞书应用 ID
 * @param {string} appSecret - 飞书应用密钥
 * @returns {Promise<string>} 访问令牌
 */
async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  // 实现代码...
}

// 行内注释：解释复杂逻辑
// 检查 Token 是否即将过期（提前 5 分钟刷新）
if (tokenExpiresAt - Date.now() < 5 * 60 * 1000) {
  await refreshToken();
}
```

---

## 四、Git 规范

### 4.1 分支管理

| 分支类型 | 命名规则 | 说明 |
|---------|---------|------|
| 主分支 | `main` | 稳定版本，可发布 |
| 开发分支 | `dev` | 日常开发分支 |
| 功能分支 | `feature/功能名称` | 新功能开发 |
| 修复分支 | `fix/问题描述` | Bug 修复 |
| 发布分支 | `release/版本号` | 发布准备 |

### 4.2 提交信息规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

**类型（type）：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关

**示例：**
```
feat(config): 实现交互式配置初始化命令

- 集成 inquirer 库实现交互式输入
- 支持 App ID 和 App Secret 验证
- 自动创建配置文件到 ~/.feishu-export/

Closes #123
```

### 4.3 提交前检查

在提交代码前，确保：
```bash
# 1. 代码格式检查
pnpm lint

# 2. 类型检查
pnpm type-check

# 3. 运行测试
pnpm test

# 4. 构建检查
pnpm build
```

---

## 五、测试规范

### 5.1 测试分类

| 测试类型 | 目录 | 命令 | 覆盖率要求 |
|---------|------|------|-----------|
| 单元测试 | `tests/unit/` | `pnpm test` | > 80% |
| 集成测试 | `tests/integration/` | `pnpm test:integration` | 核心流程覆盖 |
| 端到端测试 | 手动测试 | 真实飞书环境 | 关键场景验证 |

### 5.2 测试编写规范

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ConfigManager', () => {
  it('应该正确读取配置文件', async () => {
    // Arrange
    const mockConfig = { appId: 'test', appSecret: 'secret' };

    // Act
    const config = await loadConfig();

    // Assert
    expect(config.appId).toBe(mockConfig.appId);
  });

  it('应该在配置不存在时抛出错误', async () => {
    await expect(loadConfig()).rejects.toThrow('配置文件不存在');
  });
});
```

### 5.3 测试命令

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式（开发时使用）
pnpm test:watch

# 运行集成测试
pnpm test:integration
```

---

## 六、部署规范

### 6.1 版本号规范

采用 [语义化版本](https://semver.org/lang/zh-CN/)：
- `MAJOR.MINOR.PATCH`（如 1.0.0）
- MAJOR：不兼容的 API 变更
- MINOR：向下兼容的功能新增
- PATCH：向下兼容的 Bug 修复

### 6.2 发布流程

```bash
# 1. 更新版本号
pnpm version patch|minor|major

# 2. 构建项目
pnpm build

# 3. 运行测试
pnpm test

# 4. 发布到 npm
pnpm publish

# 5. 创建 GitHub Release
gh release create v1.0.0 --notes "发布说明"
```

### 6.3 发布检查清单

```markdown
## 发布检查清单
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] README.md 中的版本号已更新
- [ ] package.json 中的版本号已更新
- [ ] Git tag 已创建并推送
```

---

## 七、项目文档索引

### 7.1 核心设计文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **市场需求文档** | [docs/00-mrd.md](./docs/00-mrd.md) | 项目背景、目标用户、竞品分析 |
| **产品需求文档** | [docs/01-prd.md](./docs/01-prd.md) | 功能清单、用户故事、命令结构 |
| **技术方案文档** | [docs/03-技术方案文档.md](./docs/03-技术方案文档.md) | 技术选型、系统架构、API 设计 |
| **技术选型文档** | [docs/技术选型.md](./docs/技术选型.md) | 详细技术选型对比和说明 |
| **代码架构文档** | [docs/代码架构文档.md](./docs/代码架构文档.md) | 项目目录结构、模块说明 |
| **开发任务清单** | [docs/04-开发任务清单.md](./docs/04-开发任务清单.md) | 任务分解、工作量估算 |
| **开发排期** | [docs/05-开发排期.md](./docs/05-开发排期.md) | 时间规划、里程碑 |
| **开发进度** | [docs/开发进度.md](./docs/开发进度.md) | 当前进度跟踪 |
| **实施步骤** | [docs/实施步骤文档.md](./docs/实施步骤文档.md) | 具体实施步骤 |

### 7.2 文档模板

| 模板 | 路径 | 说明 |
|------|------|------|
| 精益 MRD 模板 | [docs/base/00-精益MRD-模版.md](./docs/base/00-精益MRD-模版.md) | MRD 编写模板 |
| 精简 PRD 模板 | [docs/base/01-精简PRD-模版.md](./docs/base/01-精简PRD-模版.md) | PRD 编写模板 |
| 技术方案模板 | [docs/base/03-技术方案文档-模版.md](./docs/base/03-技术方案文档-模版.md) | 技术方案编写模板 |
| 开发任务清单模板 | [docs/base/04-开发任务清单-模版.md](./docs/base/04-开发任务清单-模版.md) | 任务清单模板 |
| 开发排期模板 | [docs/base/05-开发排期-模版.md](./docs/base/05-开发排期-模版.md) | 排期表模板 |
| 技术选型模板 | [docs/base/06-技术选型-模版.md](./docs/base/06-技术选型-模版.md) | 技术选型模板 |
| 代码架构模板 | [docs/base/07-代码架构-模版.md](./docs/base/07-代码架构-模版.md) | 架构文档模板 |

---

## 八、开发流程规范

### 8.1 功能开发流程

```
1. 阅读相关设计文档（PRD、技术方案）
   ↓
2. 使用 TodoWrite 工具创建任务清单
   ↓
3. 编写代码实现
   ↓
4. 本地测试验证
   ↓
5. 运行代码检查（lint、type-check）
   ↓
6. 编写/更新测试用例
   ↓
7. 更新相关文档
   ↓
8. 提交代码（遵循 Git 规范）
   ↓
9. 完成功能自检清单
```

### 8.2 问题解决流程

```
遇到问题时：
1. 先查阅相关设计文档
2. 检查代码架构文档
3. 搜索项目已有实现
4. 参考 PRD 中的需求描述
5. 如果仍无法解决，询问用户
```

---

## 九、常用命令速查

### 9.1 开发命令

```bash
# 开发模式（监听文件变化）
pnpm dev

# 构建
pnpm build

# 运行 CLI
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check

# 运行测试
pnpm test
```

### 9.2 CLI 命令

```bash
# 初始化配置
feishu-export init

# 配置管理
feishu-export config get
feishu-export config set <key> <value>

# 导出命令
feishu-export doc <doc_id>
feishu-export docs --file <path>
feishu-export folder <folder_id>
feishu-export wiki <wiki_id>

# 全局参数示例
feishu-export doc <id> -o ./output -c 5 --no-images --incremental
```

---

## 十、重要提醒

### 10.1 关键约束
1. **所有回复、文档、代码注释必须使用中文**
2. **每次完成功能必须自检**
3. **遵循既定的技术选型，不随意更改**
4. **代码提交前必须通过 lint 和 type-check**
5. **参考设计文档实现功能，不偏离需求**

### 10.2 风险提醒
- 飞书 API 有变更风险，定期检查官方公告
- API 有限流，注意并发控制
- 跨平台路径问题，使用 path 模块处理
- Token 有有效期，需要自动刷新机制

---

**文档版本**：v1.0
**创建日期**：2026-03-27
**维护者**：项目团队
