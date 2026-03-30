#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证配音文件内容是否正确"""

VOICEOVER_TEXTS = {
    'shot01': '''大家好，我是 dtsola，一个独立开发者。前段时间，我朋友遇到了一个很头疼的问题：他在飞书上整理了数百篇技术文档，但因为工作变动需要离职，想把所有文档导出到本地，却发现飞书官方的导出功能并不完善。''',

    'shot02': '''市面上的导出工具要么收费昂贵，要么功能有限：不能批量导出、无法保持目录结构、图片和附件下载失败、格式转换后丢失排版。这些痛点让我意识到：需要一个真正好用的飞书导出解决方案。''',

    'shot03': '''所以我开发了小遥搜索飞ishu导出工具。''',

    'shot04': '''这是一个完全开源、免费的 CLI 工具，专为飞书用户设计。核心功能包括：单个文档导出、完整知识库导出、批量导出、自动下载图片附件、增量导出。这个工具非常适合：知识管理爱好者备份文档、自由职业者迁移笔记、创业团队做知识库备份、技术文档维护者导出 Git、DevOps 工程师集成定时任务、以及学生用户跨平台使用。''',

    'shot05': '''使用非常简单，只需3步。第一步，安装工具。完全开源免费，支持 Windows、macOS 和 Linux。只需运行：npm install -g xiaoyaosearch-feishu-export''',

    'shot06': '''第二步，运行 feishu-export init，通过交互式向导快速配置飞书应用信息。''',

    'shot07': '''第三步，使用 feishu-export doc 加上文档 ID，就能导出单个文档。''',

    'shot08': '''如果需要批量导出，准备一个文档 ID 列表文件，运行 feishu-export docs --file。''',

    'shot09': '''要导出整个知识库，只需运行 feishu-export wiki 加上知识库 ID。所有文档都会转换为标准的 Markdown 格式，图片和附件自动下载，目录结构完美保持。详细使用文档和源码，请访问：github.com/xiaoyaosearch/xiaoyaosearch-feishu-export-md''',

    'shot10': '''工具完全开源免费，欢迎试用。如果觉得有帮助，请给个 Star 支持独立开发。我是 dtsola，我们下期见！''',
}

# 场景描述（来自脚本）
SCENE_DESCRIPTIONS = {
    'shot01': '背景故事 - 我朋友遇到了头疼的问题',
    'shot02': '问题分析 - 市面工具的痛点',
    'shot03': '解决方案标题 - 我开发了小遥搜索飞书导出工具',
    'shot04': '功能与场景 - 核心功能和适用场景',
    'shot05': '安装工具 - 第一步安装',
    'shot06': '初始化 - 第二步 init',
    'shot07': '单文档导出 - 第三步 doc命令',
    'shot08': '批量导出 - docs --file',
    'shot09': '知识库导出 - wiki命令',
    'shot10': 'CTA - 开源免费，求Star',
}

print("=" * 70)
print("配音文件内容验证")
print("=" * 70)
print()

for shot in ['shot01', 'shot02', 'shot03', 'shot04', 'shot05', 'shot06', 'shot07', 'shot08', 'shot09', 'shot10']:
    text = VOICEOVER_TEXTS.get(shot, '未找到')
    desc = SCENE_DESCRIPTIONS.get(shot, '未找到')

    print(f"【{shot}】{desc}")
    print(f"配音: {text[:50]}...")
    print()

print("=" * 70)
