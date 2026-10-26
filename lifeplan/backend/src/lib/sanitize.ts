/**
 * Strip emoji characters and pictographs from text to comply with system constraints.
 */
export function removeEmojis(text: string): string {
  if (!text) return '';
  // Unicode Extended Pictographic + variation selectors + skin tone modifiers
  return text
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D\uD83C-\uDBFF\uDC00-\uDFFF]/gu, '')
    .trim();
}
