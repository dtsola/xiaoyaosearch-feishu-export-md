#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""使用 ffmpeg 正确合并 MP3 文件"""

import os
import subprocess
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def merge_mp3_with_ffmpeg(audio_dir, output_file):
    """使用 ffmpeg 合并 MP3 文件"""
    print("=" * 60)
    print("使用 ffmpeg 合并配音文件")
    print("=" * 60)
    print()

    # 创建临时文件列表
    filelist_path = os.path.join(audio_dir, 'filelist.txt')

    # 检查文件列表
    if not os.path.exists(filelist_path):
        print(f"错误: 文件列表不存在 {filelist_path}")
        return False

    # 输出文件路径
    output_path = os.path.join(audio_dir, output_file)

    # 删除旧的输出文件
    if os.path.exists(output_path):
        os.remove(output_path)

    # ffmpeg 命令
    cmd = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', filelist_path,
        '-c', 'copy',
        output_path,
        '-y'  # 覆盖输出文件
    ]

    print(f"执行命令:")
    print(f"  cd {audio_dir}")
    print(f"  ffmpeg -f concat -safe 0 -i filelist.txt -c copy {output_file}")
    print()

    # 执行命令
    try:
        result = subprocess.run(
            cmd,
            cwd=audio_dir,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        if result.returncode == 0:
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"成功: {output_file} ({file_size} bytes)")
                print()
                return True
            else:
                print(f"错误: 输出文件未生成")
                print(result.stderr)
                return False
        else:
            print(f"ffmpeg 错误 (退出码: {result.returncode}):")
            print(result.stderr)
            return False

    except FileNotFoundError:
        print("错误: ffmpeg 未安装或不在 PATH 中")
        print("请安装 ffmpeg: https://ffmpeg.org/download.html")
        return False
    except Exception as e:
        print(f"错误: {e}")
        return False

def main():
    audio_dir = r'docs\运营文档\video-project\public\audio'
    output_file = 'voiceover.mp3'

    success = merge_mp3_with_ffmpeg(audio_dir, output_file)

    print("=" * 60)
    if success:
        print("合并完成！")
        print(f"输出: {os.path.join(audio_dir, output_file)}")
    else:
        print("合并失败，请检查错误信息")
    print("=" * 60)

if __name__ == '__main__':
    main()
