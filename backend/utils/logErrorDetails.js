export const logDetailedError = (label, error) => {
  console.error(`❌ [${label}] Error message:`, error.message);

  if (error.response) {
    console.error(`🔁 [${label}] Response status:`, error.response.status);
    console.error(`📦 [${label}] Response data:`, error.response.data);
    console.error(`📄 [${label}] Response headers:`, error.response.headers);
  }

  if (error.config) {
    console.error(`🧾 [${label}] Request config:`, {
      method: error.config.method,
      url: error.config.url,
      headers: error.config.headers,
      data: error.config.data
    });
  }

  if (error.stack) {
    console.error(`🧠 [${label}] Stack trace:\n`, error.stack);
  }
};
