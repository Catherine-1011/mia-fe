    export const generateClientFingerprint = (): string => {
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  return btoa(`${screenInfo}|${timezone}|${language}|${platform}|${userAgent}`);
};