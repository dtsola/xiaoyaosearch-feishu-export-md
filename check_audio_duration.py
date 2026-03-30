#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查 MP3 文件时长"""

import os
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_mp3_duration(file_path):
    """简单估算 MP3 时长（基于文件大小）"""
    # MP3 平均比特率约 128kbps = 16KB/s
    size = os.path.getsize(file_path)
    estimated_duration = size / (128 * 1024 / 8)  # 秒
    return estimated_duration

def main():
    audio_dir = 'docs/运营文档/video-project/public/audio'

    print("=" * 60)
    print("配音文件时长检查")
    print("=" * 60)
    print()

    # 预设时长（秒）
    expected_durations = {
        'shot01': 15,
        'shot02': 20,
        'shot03': 10,
        'shot04': 30,
        'shot05': 10,
        'shot06': 15,
        'shot07': 10,
        'shot08': 13,
        'shot09': 12,
        'shot10': 15,
    }

    total_estimated = 0
    total_expected = 0

    for i in range(1, 11):
        shot = f'shot{i:02d}'
        file_path = os.path.join(audio_dir, f'{shot}.mp3')

        if os.path.exists(file_path):
            estimated = get_mp3_duration(file_path)
            expected = expected_durations[shot]
            total_estimated += estimated
            total_expected += expected

            diff = estimated - expected
            status = "✓" if abs(diff) < 2 else "!"

            print(f"{shot}: 预估 {estimated:.1f}秒 | 设定 {expected}秒 | 差异 {diff:+.1f}秒 {status}")
        else:
            print(f"{shot}: 文件不存在")

    print()
    print("=" * 60)
    print(f"总计: 预估 {total_estimated:.1f}秒 | 设定 {total_expected}秒 | 差异 {total_estimated - total_expected:+.1f}秒")
    print("=" * 60)

    # 完整配音文件
    voiceover_path = os.path.join(audio_dir, 'voiceover.mp3')
    if os.path.exists(voiceover_path):
        total_duration = get_mp3_duration(voiceover_path)
        print(f"完整配音 voiceover.mp3: 预估 {total_duration:.1f}秒")

if __name__ == '__main__':
    main()
