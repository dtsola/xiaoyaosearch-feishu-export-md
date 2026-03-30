#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重新生成配音（女声，正常语速）"""

import os
import sys
import asyncio
import edge_tts

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

VOICEOVER_TEXTS = {
    'shot01': '''大家好，我是 D-T-S-O-L-A，一个独立开发者。前段时间，我朋友遇到了一个很头疼的问题：他在飞书上整理了数百篇技术文档，但因为工作变动需要离职，想把所有文档导出到本地，却发现飞书官方的导出功能并不完善。''',

    'shot02': '''市面上的导出工具要么收费昂贵，要么功能有限：不能批量导出、无法保持目录结构、图片和附件下载失败、格式转换后丢失排版。这些痛点让我意识到：需要一个真正好用的飞书导出解决方案。''',

    'shot03': '''所以我开发了小遥搜索飞书导出工具。''',

    'shot04': '''这是一个完全开源、免费的 CLI 工具，专为飞书用户设计。核心功能包括：单个文档导出、完整知识库导出、批量导出、自动下载图片附件、增量导出。这个工具非常适合：知识管理爱好者备份文档、自由职业者迁移笔记、创业团队做知识库备份、技术文档维护者导出 Git、DevOps 工程师集成定时任务、以及学生用户跨平台使用。''',

    'shot05': '''使用非常简单，只需3步。第一步，安装工具。完全开源免费，支持 Windows、macOS 和 Linux。只需 npm 一键安装。''',

    'shot06': '''第二步，运行 feishu-export init，通过交互式向导快速配置飞书应用信息。''',

    'shot07': '''第三步，使用 feishu-export doc 加上文档 ID，就能导出单个文档。''',

    'shot08': '''如果需要批量导出，准备一个文档 ID 列表文件，运行 feishu-export docs --file。''',

    'shot09': '''要导出整个知识库，只需运行 feishu-export wiki 加上知识库 ID。所有文档都会转换为标准的 Markdown 格式，图片和附件自动下载，目录结构完美保持。详细使用文档和源码，请访问 github。''',

    'shot10': '''工具完全开源免费，欢迎试用。如果觉得有帮助，请给个三连支持独立开发。我是 D-T-S-O-L-A，我们下期见！''',
}

async def generate_all():
    audio_dir = r'docs\运营文档\video-project\public\audio'
    voice = 'zh-CN-XiaoxiaoNeural'  # 女声

    print("=" * 60)
    print("重新生成配音 - 女声，正常语速")
    print("=" * 60)
    print()

    # 删除旧文件
    for i in range(1, 11):
        shot = f'shot{i:02d}.mp3'
        path = os.path.join(audio_dir, shot)
        if os.path.exists(path):
            os.remove(path)
            print(f"已删除: {shot}")

    print()
    print("开始生成新配音...")
    print()

    # 生成新配音
    for i, (shot, text) in enumerate(VOICEOVER_TEXTS.items(), 1):
        output_file = os.path.join(audio_dir, f'{shot}.mp3')
        print(f"[{i}/10] 正在生成 {shot}...")

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)

        if os.path.exists(output_file):
            size = os.path.getsize(output_file)
            print(f"  完成: {shot} ({size} bytes)")
        print()

    print("=" * 60)
    print("配音生成完成！")
    print("=" * 60)

if __name__ == '__main__':
    asyncio.run(generate_all())
