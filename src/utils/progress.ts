/**
 * @module utils/progress
 * @description 进度条管理器
 */

import cliProgress from 'cli-progress';

/**
 * 进度条管理器
 */
export class ProgressBar {
  private bar: cliProgress.SingleBar;
  private startTime: number;
  private currentValue: number = 0;

  constructor(total: number, title: string = '处理中') {
    this.startTime = Date.now();
    this.bar = new cliProgress.SingleBar({
      format: `${title} |[{bar}]| {percentage}% | {value}/{total} | 速度: {speed} docs/s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    this.bar.start(total, 0, { speed: 0 });
  }

  /**
   * 更新进度
   */
  update(value: number): void {
    this.currentValue = value;
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = elapsed > 0 ? (value / elapsed).toFixed(2) : '0';
    this.bar.update(value, { speed });
  }

  /**
   * 增加进度
   */
  increment(delta: number = 1): void {
    this.update(this.currentValue + delta);
  }

  /**
   * 完成进度
   */
  stop(): void {
    this.bar.stop();
  }

  /**
   * 更新标题
   * 注意：cli-progress 不支持动态更新格式，需要在创建时设置
   */
  setTitle(_title: string): void {
    // cli-progress 不支持运行时更新格式
    // 如需更改标题，请重新创建进度条
  }
}
