/**
 * Formats a Date object to a YYYY-MM-DD string using Local Time.
 * Use this instead of .toISOString().split('T')[0] which uses UTC and can cause off-by-one errors.
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object set to Local Midnight.
 * This avoids the UTC interpretation of hyphenated date strings in Date constructor.
 */
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  // Handle empty or invalid strings gracefully
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date();

  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};
