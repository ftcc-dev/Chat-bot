/**
 * Mirrors the backend parser. Used on the client to decide whether to
 * show the "Bot is processing your request..." loader immediately.
 */
export function isRegistrationCommand(text: string): boolean {
  if (!text) return false;
  const hasPin = /\d{12}/.test(text);
  const hasType = /(MM|DD|member|dependent)/i.test(text);
  return hasPin && hasType;
}
