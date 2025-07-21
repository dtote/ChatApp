// Production configuration
export const isProduction = process.env.NODE_ENV === 'production';

// Disable console logs in production
if (isProduction) {
  // Override console methods to prevent logging in production
  const noop = () => { };

  // Only keep console.error for critical errors, but make them less verbose
  const originalError = console.error;
  console.error = (...args) => {
    // Only log critical errors, not API errors
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Critical')) {
      originalError(...args);
    }
  };

  // Disable other console methods in production
  console.warn = noop;
  console.info = noop;
  console.debug = noop;
  console.log = noop;
}

// Production utilities
export const productionConfig = {
  // Disable React DevTools in production
  disableReactDevTools: () => {
    if (isProduction) {
      // Remove React DevTools from window
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => { };
      }
    }
  },

  // Disable source maps in production
  disableSourceMaps: () => {
    if (isProduction) {
      // This is typically handled by the build process
      // but we can add additional checks here
    }
  }
}; 