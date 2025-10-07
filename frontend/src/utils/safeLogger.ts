// Safe logging utility to prevent log injection
const sanitizeLogData = (data: any): string => {
  if (typeof data === 'string') {
    // Remove control characters and limit length
    return data.replace(/[\x00-\x1F\x7F-\x9F]/g, '').substring(0, 200);
  }
  if (typeof data === 'object' && data !== null) {
    try {
      return JSON.stringify(data).substring(0, 500);
    } catch {
      return '[Object]';
    }
  }
  return String(data);
};

export const safeLog = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args.map(sanitizeLogData));
    }
  },
  error: (...args: any[]) => {
    console.error(...args.map(sanitizeLogData));
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args.map(sanitizeLogData));
    }
  }
};
