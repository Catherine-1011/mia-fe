const isDevelopment = process.env.NODE_ENV === "development";

export const devLogger = {
  error: (...args: unknown[]) => {
    if (isDevelopment) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) console.warn(...args);
  },
  log: (...args: unknown[]) => {
    if (isDevelopment) console.log(...args);
  },
  group: (...args: unknown[]) => {
    if (isDevelopment) console.group(...args);
  },
  groupEnd: () => {
    if (isDevelopment) console.groupEnd();
  },
  table: (data: unknown) => {
    if (isDevelopment) console.table(data);
  },
};
