#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""合并 MP3 文件"""

import os
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def merge_mp3_files(file_list, output_file):
    """使用简单的二进制连接合并 MP3 文件"""
    # 确保输出目录存在
    output_dir = os.path.dirname(output_file)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    print(f"正在合并到 {output_file}...")
    print(f"输出目录: {output_dir}")

    with open(output_file, 'wb') as outfile:
        for filename in file_list:
            if os.path.exists(filename):
                print(f"  添加: {filename}")
                with open(filename, 'rb') as infile:
                    outfile.write(infile.read())
            else:
                print(f"  跳过: {filename} (不存在)")

    file_size = os.path.getsize(output_file)
    print(f"\n完成: {output_file} ({file_size} bytes)")

def main():
    # 使用绝对路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    audio_dir = os.path.join(script_dir, 'public', 'audio')

    files = [os.path.join(audio_dir, f'shot{i:02d}.mp3') for i in range(1, 11)]
    output = os.path.join(audio_dir, 'voiceover.mp3')

    print(f"脚本目录: {script_dir}")
    print(f"音频目录: {audio_dir}")

    merge_mp3_files(files, output)

if __name__ == '__main__':
    main()
