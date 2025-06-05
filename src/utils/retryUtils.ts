/**
 * Utility function to retry an async operation with exponential backoff
 * @param operation The async operation to retry
 * @param maxAttempts Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds (default: 1000ms)
 * @returns Promise that resolves with the operation result or rejects after all attempts fail
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};