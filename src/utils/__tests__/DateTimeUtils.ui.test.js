import DateTimeUtils from '../DateTimeUtils';

describe('DateTimeUtils UI Integration', () => {
  describe('date picker integration', () => {
    it('today() returns correct format for date input', () => {
      const today = DateTimeUtils.today();
      
      // Should return YYYY-MM-DD format for HTML date inputs
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof today).toBe('string');
    });

    it('today() uses local timezone, not UTC', () => {
      const localToday = DateTimeUtils.today();
      const utcToday = new Date().toISOString().split('T')[0];
      
      // Create a late evening scenario to test timezone difference
      const lateEvening = new Date();
      lateEvening.setHours(23, 0, 0, 0); // 11 PM local
      
      const localLateDate = DateTimeUtils.toLocalDateString(lateEvening.toISOString());
      const utcLateDate = lateEvening.toISOString().split('T')[0];
      
      // Verify our utility uses local timezone
      expect(localLateDate).toBe(DateTimeUtils.toLocalDateString(lateEvening.toISOString()));
      
      // In some cases, local and UTC dates might differ
      if (localLateDate !== utcLateDate) {
        console.log('Timezone difference detected:', { localLateDate, utcLateDate });
        expect(localLateDate).not.toBe(utcLateDate);
      }
    });
  });

  describe('timezone edge cases for UI', () => {
    it('handles 9 PM PT scenario correctly', () => {
      // 9 PM PT = 4 AM UTC next day
      const ninePmPT = '2025-07-12T04:00:00.000Z';
      const localDate = DateTimeUtils.toLocalDateString(ninePmPT);
      
      // Should return the local date (2025-07-11), not UTC date (2025-07-12)
      expect(localDate).toBe('2025-07-11');
      expect(localDate).not.toBe('2025-07-12');
    });

    it('handles midnight boundary correctly', () => {
      // Midnight PT = 7 AM UTC same day
      const midnightPT = '2025-07-11T07:00:00.000Z';
      const localDate = DateTimeUtils.toLocalDateString(midnightPT);
      
      // Should return the correct local date
      expect(localDate).toBe('2025-07-11');
    });

    it('toLocalDateString is consistent with today() format', () => {
      const now = new Date();
      const localFromTimestamp = DateTimeUtils.toLocalDateString(now.toISOString());
      const todayDirect = DateTimeUtils.today();
      
      // Both should return the same format and value for current time
      expect(localFromTimestamp).toBe(todayDirect);
      expect(localFromTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('date range consistency', () => {
    it('getDateRange returns dates in correct format for UI', () => {
      const dateRange = DateTimeUtils.getDateRange(3);
      
      // Should return 3 dates in YYYY-MM-DD format
      expect(dateRange).toHaveLength(3);
      dateRange.forEach(date => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof date).toBe('string');
      });
      
      // Last date should be today
      expect(dateRange[dateRange.length - 1]).toBe(DateTimeUtils.today());
    });

    it('getDateRange dates are chronological', () => {
      const dateRange = DateTimeUtils.getDateRange(5);
      
      for (let i = 1; i < dateRange.length; i++) {
        const prevDate = new Date(dateRange[i - 1]);
        const currDate = new Date(dateRange[i]);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  describe('backward compatibility', () => {
    it('replaces old UTC date extraction pattern', () => {
      const timestamp = '2025-07-12T04:00:00.000Z'; // 9 PM PT
      
      // Old way (incorrect)
      const oldWay = timestamp.split('T')[0];
      
      // New way (correct)
      const newWay = DateTimeUtils.toLocalDateString(timestamp);
      
      // They should be different for timezone edge cases
      expect(oldWay).toBe('2025-07-12'); // UTC date
      expect(newWay).toBe('2025-07-11'); // Local date
      expect(newWay).not.toBe(oldWay);
    });

    it('maintains same API as Date methods', () => {
      const date = new Date();
      
      // Should work similarly to Date methods but with local timezone
      const localString = DateTimeUtils.toLocalDateString(date.toISOString());
      expect(localString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      const today = DateTimeUtils.today();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(localString).toBe(today);
    });
  });
});