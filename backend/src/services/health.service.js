import { env } from '../config/env.js';

const startTime = Date.now();

export class HealthService {
  /**
   * Retrieves current health, uptime, and system status metrics.
   * @returns {Object} System health status object
   */
  static getSystemHealth() {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      environment: env.nodeEnv,
      service: 'store-rating-api',
      version: '1.0.0',
    };
  }
}
