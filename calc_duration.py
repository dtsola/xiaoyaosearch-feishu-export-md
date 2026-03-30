#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""计算新的场景时长（基于配音文件大小）"""

import os
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    audio_dir = 'docs/运营文档/video-project/public/audio'
    fps = 30

    # 获取文件大小
    files = []
    total_size = 0

    for i in range(1, 11):
        shot = f'shot{i:02d}'
        file_path = os.path.join(audio_dir, f'{shot}.mp3')

        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            files.append((shot, size))
            total_size += size

    print("=" * 60)
    print("场景时长计算（基于配音文件大小比例）")
    print("=" * 60)
    print()

    # 输出 Remotion 常量格式
    print("// 场景时长（帧数）- 基于配音实际时长")
    print("export const SCENE_DURATIONS = {")

    total_frames = 0

    for shot, size in files:
        # 按比例计算帧数
        frames = int((size / total_size) * (total_size / (128 * 1024 / 8)) * fps)
        # 或者直接基于总大小比例
        frames = int((size / total_size) * 1550)  # 约 51.3 秒 @ 30fps
        total_frames += frames

        duration_sec = frames / fps

        print(f"  {shot}: {frames},  // {duration_sec:.1f}秒")

    print("} as const;")
    print()
    print(f"// 总时长: {total_frames / fps:.1f}秒 @ {fps}fps")
    print(f"export const TOTAL_DURATION = {total_frames};")
    print()
    print("=" * 60)

if __name__ == '__main__':
    main()
