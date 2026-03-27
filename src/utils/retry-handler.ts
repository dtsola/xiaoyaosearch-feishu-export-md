/**
 * @module utils/retry-handler
 * @description 重试处理器 - 实现指数退避重试策略
 */

import { logger } from './logger.js';

/** 重试配置 */
export interface RetryOptions {
  maxRetries?: number;
  backoffMultiplier?: number;
  initialDelay?: number;
}

/**
 * 重试处理器
 * 实现指数退避重试策略
 */
export class RetryHandler {
  private readonly maxRetries: number;
  private readonly backoffMultiplier: number;
  private readonly initialDelay: number;

  constructor(options: RetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.backoffMultiplier = options.backoffMultiplier ?? 2;
    this.initialDelay = options.initialDelay ?? 1000;
  }

  /**
   * 执行带重试的函数
   */
  async retry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.maxRetries;
    const backoffMultiplier = options?.backoffMultiplier ?? this.backoffMultiplier;
    const initialDelay = options?.initialDelay ?? this.initialDelay;

    let lastError: Error | undefined;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          logger.warn(`重试 ${attempt + 1}/${maxRetries}: ${lastError.message}`);
          await this.sleep(delay);
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }

  /**
   * 异步等待
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** 默认重试处理器实例 */
export const defaultRetryHandler = new RetryHandler();
