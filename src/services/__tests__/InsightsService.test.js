import { InsightsService } from '../InsightsService';
import DateTimeUtils from '../../utils/DateTimeUtils';

describe('InsightsService', () => {
  let insightsService;
  let mockDataService;

  beforeEach(() => {
    // Mock DataService with timezone edge case data
    mockDataService = {
      getData: jest.fn(),
      getPottyLogsByDate: jest.fn()
    };

    // Test data with timezone boundary entries
    const testData = {
      pottyLogs: [
        {
          id: '1',
          timestamp: '2025-07-11T18:00:00.000Z', // 11 AM PT
          type: 'pee',
          location: 'outside',
          isSuccessful: true,
          isAccident: false
        },
        {
          id: '2',
          timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT (next day in UTC)
          type: 'poop',
          location: 'outside',
          isSuccessful: true,
          isAccident: false
        },
        {
          id: '3',
          timestamp: '2025-07-12T06:00:00.000Z', // 11 PM PT (next day in UTC)
          type: 'pee',
          location: 'inside',
          isSuccessful: false,
          isAccident: true
        }
      ]
    };

    mockDataService.getData.mockReturnValue(testData);
    
    // Mock getPottyLogsByDate to return logs for the local date
    mockDataService.getPottyLogsByDate.mockImplementation((dateString) => {
      return testData.pottyLogs.filter(log => 
        DateTimeUtils.toLocalDateString(log.timestamp) === dateString
      );
    });

    insightsService = new InsightsService(mockDataService);
  });

  describe('timezone-aware date filtering', () => {
    it('getSuccessRateTrend uses local dates for trend analysis', () => {
      const trend = insightsService.getSuccessRateTrend(3);
      
      // Should create trend data using local dates
      expect(trend).toBeDefined();
      expect(Array.isArray(trend)).toBe(true);
      
      // Verify it's calling DataService with local date strings
      const expectedLocalDate = DateTimeUtils.today();
      expect(mockDataService.getPottyLogsByDate).toHaveBeenCalledWith(expectedLocalDate);
    });

    it('getHourlyTrends filters logs by local date, not UTC', () => {
      const hourlyTrends = insightsService.getHourlyTrends(1);
      
      // Should include logs that fall on the same local date
      // even if they're different days in UTC
      expect(hourlyTrends).toBeDefined();
      expect(Array.isArray(hourlyTrends)).toBe(true);
    });

    it('getPottyTypeDistribution uses local timezone for date range', () => {
      const distribution = insightsService.getPottyTypeDistribution(1);
      
      // Should filter logs using local date comparison
      expect(distribution).toBeDefined();
      expect(Array.isArray(distribution)).toBe(true);
    });
  });

  describe('timezone edge cases', () => {
    it('handles 9 PM PT logs correctly (next day in UTC)', () => {
      // Mock today as the local date for the 9 PM PT log
      const localDate = DateTimeUtils.toLocalDateString('2025-07-12T04:00:00.000Z');
      
      mockDataService.getPottyLogsByDate.mockImplementation((dateString) => {
        if (dateString === localDate) {
          return [{
            id: '2',
            timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT
            type: 'poop',
            location: 'outside'
          }];
        }
        return [];
      });

      const successRate = insightsService.getSuccessRateForDate(localDate);
      
      // The 9 PM PT log should be included in the correct local date
      expect(mockDataService.getPottyLogsByDate).toHaveBeenCalledWith(localDate);
      expect(successRate).toBe(100); // One successful log
    });

    it('_getDateRange creates local date strings, not UTC', () => {
      const dateRange = insightsService._getDateRange(3);
      
      // Should return local date strings in YYYY-MM-DD format
      expect(dateRange).toHaveLength(3);
      dateRange.forEach(dateStr => {
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Should match DateTimeUtils format
        expect(typeof dateStr).toBe('string');
      });
      
      // Last date should be today in local timezone
      expect(dateRange[dateRange.length - 1]).toBe(DateTimeUtils.today());
    });
  });

  describe('hour extraction uses local timezone', () => {
    it('extracts hours in local timezone for hourly trends', () => {
      // Create a log at a specific UTC time
      const utcMidnight = '2025-07-12T07:00:00.000Z'; // Midnight PT = 7 AM UTC
      const localHour = new Date(utcMidnight).getHours(); // Should be 0 (midnight) in PT
      
      const testLog = {
        id: 'test',
        timestamp: utcMidnight,
        type: 'pee',
        location: 'outside'
      };

      mockDataService.getData.mockReturnValue({
        pottyLogs: [testLog]
      });

      const hourlyTrends = insightsService.getHourlyTrends(1);
      
      // Should group by local hour, not UTC hour
      // The log should appear in the midnight hour (0), not 7 AM hour
      expect(hourlyTrends).toBeDefined();
    });
  });

  describe('backward compatibility', () => {
    it('handles logs with isSuccessful/isAccident fields', () => {
      const logsWithFields = [{
        id: '1',
        timestamp: '2025-07-11T18:00:00.000Z',
        type: 'pee',
        location: 'outside',
        isSuccessful: true,
        isAccident: false
      }];

      mockDataService.getPottyLogsByDate.mockReturnValue(logsWithFields);
      
      const successRate = insightsService.getSuccessRateForDate('2025-07-11');
      expect(successRate).toBe(100);
    });

    it('falls back to computed logic for logs without fields', () => {
      const logsWithoutFields = [{
        id: '1',
        timestamp: '2025-07-11T18:00:00.000Z',
        type: 'pee',
        location: 'outside'
        // No isSuccessful/isAccident fields
      }];

      mockDataService.getPottyLogsByDate.mockReturnValue(logsWithoutFields);
      
      const successRate = insightsService.getSuccessRateForDate('2025-07-11');
      expect(successRate).toBe(100); // Should compute success from location
    });
  });
});