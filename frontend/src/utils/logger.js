class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Log errors only in development
  error(message, error = null) {
    if (this.isDevelopment) {
      if (error) {
        console.error(`❌ [${message}]`, error);
      } else {
        console.error(`❌ [${message}]`);
      }
    }
  }

  // Log warnings only in development
  warn(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.warn(`⚠️ [${message}]`, data);
      } else {
        console.warn(`⚠️ [${message}]`);
      }
    }
  }

  // Log info only in development
  info(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.info(`ℹ️ [${message}]`, data);
      } else {
        console.info(`ℹ️ [${message}]`);
      }
    }
  }

  // Log debug only in development
  debug(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.debug(`🔍 [${message}]`, data);
      } else {
        console.debug(`🔍 [${message}]`);
      }
    }
  }

  // Silent fail - no logging at all
  silent() {
    // Do nothing - completely silent
  }
}

export const logger = new Logger(); 