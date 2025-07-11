/**
 * Simple date/time utilities using web standards
 * Fixes UTC timezone issues by using browser's local timezone handling
 */
export const DateTimeUtils = {
  /**
   * Convert UTC timestamp to local date string (YYYY-MM-DD)
   * Uses browser's local timezone automatically
   */
  toLocalDateString: (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },
  
  /**
   * Get today's local date string (YYYY-MM-DD)
   */
  today: () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },
  
  /**
   * Create date range in local timezone
   */
  getDateRange: (days) => {
    const range = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      range.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    }
    return range;
  }
};

export default DateTimeUtils;