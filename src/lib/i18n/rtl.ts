const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

