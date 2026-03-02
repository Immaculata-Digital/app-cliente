/**
 * Parses a date string in "YYYY-MM-DD" format to a local Date object.
 * This avoids the common issue where "YYYY-MM-DD" is parsed as UTC.
 */
export function parseYYYYMMDDToLocalDate(dateString: string | undefined): Date | undefined {
  if (!dateString || typeof dateString !== 'string') return undefined;
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  
  // month is 0-indexed in JS Date
  const date = new Date(year, month - 1, day);
  
  // Check if it's a valid date
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Formats a local Date object to "YYYY-MM-DD" string.
 */
export function formatLocalDateToYYYYMMDD(date: Date | undefined): string {
  if (!date || isNaN(date.getTime())) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
