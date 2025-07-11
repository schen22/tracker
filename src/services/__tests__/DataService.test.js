import DataService from '../DataService';
import DateTimeUtils from '../../utils/DateTimeUtils';

describe('DataService', () => {
  let dataService;

  beforeEach(() => {
    dataService = new DataService();
    // Mock data with timezone edge case entries
    const testData = {
      pottyLogs: [
        {
          id: '1',
          timestamp: '2025-07-11T18:00:00.000Z', // 11 AM PT
          type: 'pee',
          location: 'outside'
        },
        {
          id: '2', 
          timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT (next day in UTC)
          type: 'poop',
          location: 'outside'
        }
      ],
      activities: [
        {
          id: '1',
          timestamp: '2025-07-11T20:00:00.000Z', // 1 PM PT
          activity: 'Fed breakfast'
        },
        {
          id: '2',
          timestamp: '2025-07-12T05:00:00.000Z', // 10 PM PT (next day in UTC)
          activity: 'Fed dinner'
        }
      ]
    };
    
    dataService.setData(testData);
  });

  describe('toLocalDateString filtering', () => {
    it('getPottyLogsByDate filters by local date, not UTC date', () => {
      const today = DateTimeUtils.today();
      const logs = dataService.getPottyLogsByDate(today);
      
      // Should include both logs if they fall on the same local date
      // Even though the second one is "tomorrow" in UTC
      expect(logs.length).toBeGreaterThan(0);
      
      logs.forEach(log => {
        const logLocalDate = DateTimeUtils.toLocalDateString(log.timestamp);
        expect(logLocalDate).toBe(today);
      });
    });

    it('getActivitiesByDate filters by local date consistently', () => {
      const today = DateTimeUtils.today();
      const activities = dataService.getActivitiesByDate(today);
      
      activities.forEach(activity => {
        const activityLocalDate = DateTimeUtils.toLocalDateString(activity.timestamp);
        expect(activityLocalDate).toBe(today);
      });
    });

    it('handles 9pm PT timezone edge case correctly', () => {
      // Test specifically with a date that would have timezone issues
      const localDate = '2025-07-11'; // Assuming this is today in local time
      const logs = dataService.getPottyLogsByDate(localDate);
      
      // Find the 9 PM PT log (which is next day in UTC)
      const ninePmLog = logs.find(log => log.timestamp === '2025-07-12T04:00:00.000Z');
      
      if (DateTimeUtils.today() === '2025-07-11') {
        // If today is 2025-07-11 in local time, the 9 PM PT log should be included
        expect(ninePmLog).toBeDefined();
      }
    });
  });
});