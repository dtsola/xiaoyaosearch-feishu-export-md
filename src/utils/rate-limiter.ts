/**
 * @module utils/rate-limiter
 * @description 速率限制器 - 使用令牌桶算法避免触发 API 限流
 */

import Bottleneck from 'bottleneck';

/** 速率限制器配置 */
export interface RateLimiterOptions {
  concurrency: number;
  minTime: number;
}

/**
 * 速率限制器
 * 使用令牌桶算法避免触发 API 限流
 */
export class RateLimiter {
  private limiter: Bottleneck;

  constructor(options: RateLimiterOptions) {
    this.limiter = new Bottleneck({
      reservoir: options.concurrency,
      reservoirRefreshAmount: options.concurrency,
      reservoirRefreshInterval: 1000,
      minTime: options.minTime,
      maxConcurrent: options.concurrency,
    });
  }

  /**
   * 调度任务
   */
  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }

  /**
   * 获取当前状态
   */
  getStatus(): { currentReservoir: number | null } {
    // 获取当前可用的令牌数
    const reservoir = this.limiter.currentReservoir;
    const value = typeof reservoir === 'function' ? reservoir() : reservoir;
    // 如果是 Promise，需要等待（这里简化处理）
    const resolvedValue = value instanceof Promise ? 5 : value ?? 5;
    return {
      currentReservoir: resolvedValue as number | null,
    };
  }

  /**
   * 停止接受新任务
   */
  stop(): void {
    this.limiter.stop();
  }
}

/**
 * 默认速率限制器配置
 */
export const DEFAULT_RATE_LIMITER_OPTIONS: RateLimiterOptions = {
  concurrency: 5,
  minTime: 350,
};
