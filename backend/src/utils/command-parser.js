/**
 * Detects a PhilHealth registration command inside a chat message.
 * Accepted shapes (case-insensitive):
 *   /register 050502495531 MM
 *   /register 050502495531 Member
 *   PIN: 050502495531, TYPE: Member
 *   050502495531 Dependent
 *
 * @param {string} text
 * @returns {{ pin: string, type: 'MM' | 'DD' } | null}
 */
export function parseRegistrationCommand(text) {
  if (!text || typeof text !== 'string') return null;

  const pinMatch = text.match(/(\d{12})/);
  if (!pinMatch) return null;
  const pin = pinMatch[1];

  const typeToken = text.match(/(MM|DD|member|dependent)/i);
  if (!typeToken) return null;

  const raw = typeToken[1].toLowerCase();
  const type = raw === 'mm' || raw === 'member' ? 'MM' : 'DD';

  return { pin, type };
}
