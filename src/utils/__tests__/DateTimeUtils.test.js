import DateTimeUtils from '../DateTimeUtils';

describe('DateTimeUtils', () => {
  describe('toLocalDateString', () => {
    it('converts UTC timestamp to local date string', () => {
      // Test with a known timestamp
      const utcTimestamp = '2025-07-12T04:00:00.000Z'; // 9 PM PT = 4 AM UTC next day
      const result = DateTimeUtils.toLocalDateString(utcTimestamp);
      
      // Should convert to local date (depends on system timezone)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      expect(typeof result).toBe('string');
    });

    it('handles current timestamp correctly', () => {
      const now = new Date();
      const timestamp = now.toISOString();
      const result = DateTimeUtils.toLocalDateString(timestamp);
      
      // Should match the local date components
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('today', () => {
    it('returns current local date in YYYY-MM-DD format', () => {
      const result = DateTimeUtils.today();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      expect(result).toBe(expected);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getDateRange', () => {
    it('creates array of local date strings', () => {
      const days = 3;
      const result = DateTimeUtils.getDateRange(days);
      
      expect(result).toHaveLength(days);
      expect(result[result.length - 1]).toBe(DateTimeUtils.today()); // Last item should be today
      
      // All items should be valid date strings
      result.forEach(dateStr => {
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('returns dates in chronological order', () => {
      const result = DateTimeUtils.getDateRange(5);
      
      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1]);
        const currDate = new Date(result[i]);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  describe('timezone edge case', () => {
    it('handles 9 PM PT timezone boundary correctly', () => {
      // Simulate 9 PM PT (which becomes next day in UTC)
      const localDate = new Date();
      localDate.setHours(21, 0, 0, 0); // 9 PM local
      
      const utcTimestamp = localDate.toISOString();
      const localDateString = DateTimeUtils.toLocalDateString(utcTimestamp);
      const todayString = DateTimeUtils.today();
      
      // The local date string should match today (not tomorrow as UTC would suggest)
      expect(localDateString).toBe(todayString);
    });
  });
});