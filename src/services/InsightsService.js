export class InsightsService {
    constructor(dataService) {
      this.dataService = dataService;
    }
  
    getSuccessRateForDate(date) {
      const logs = this.dataService.getPottyLogsByDate(date);
      if (logs.length === 0) return 0;
      
      const successful = logs.filter(log => log.isSuccessful).length;
      return Math.round((successful / logs.length) * 100);
    }
  
    getSuccessRateTrend(days = 14) {
      const trendData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayLogs = this.dataService.getPottyLogsByDate(dateStr);
        const successRate = this.getSuccessRateForDate(dateStr);
        // console.log("success rate for date: ", dateStr, "is ", successRate);
        trendData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          successRate,
          total: dayLogs.length
        });
      }
      
      return trendData.filter(day => day.total > 0);
    }
  
    getHourlyTrends(days = 7) {
      const dateRange = this._getDateRange(days);
      const allLogs = (this.dataService.pottyLogs || []).filter(log =>
        dateRange.includes(log.date)
      );

      // console.log("allLogs = ", allLogs);
      // console.log("this.dataService.pottyLogs = ", this.dataService.pottyLogs);
  
      return Array.from({ length: 24 }, (_, hour) => {
        const hourStr = hour.toString().padStart(2, '0');
        const hourLogs = allLogs.filter(log => 
          parseInt(log.time.split(':')[0]) === hour
        );
        
        return {
          hour: `${hourStr}:00`,
          successful: hourLogs.filter(log => log.isSuccessful).length,
          accidents: hourLogs.filter(log => log.isAccident).length,
          total: hourLogs.length
        };
      }).filter(data => data.total > 0);
    }
  
    getDailyHourlyActivity(date) {
      const pottyLogs = this.dataService.getPottyLogsByDate(date);
      const activities = this.dataService.getActivitiesByDate(date);
      const allActivities = [...pottyLogs, ...activities];
      
      return Array.from({ length: 24 }, (_, hour) => {
        const hourStr = hour.toString().padStart(2, '0');
        const hourActivities = allActivities.filter(activity => 
          parseInt(activity.timestamp.split(':')[0]) === hour
        );
        
        const pottyEvents = hourActivities.filter(a => a.type);
        const otherActivities = hourActivities.filter(a => a.activity);
        
        return {
          hour: `${hourStr}:00`,
          potty: pottyEvents.length,
          feeding: otherActivities.filter(a => a.activity?.includes('Fed')).length,
          play: otherActivities.filter(a => a.activity?.includes('Play')).length,
          training: otherActivities.filter(a => a.activity?.includes('Training')).length,
          crate: otherActivities.filter(a => a.activity?.includes('Crate')).length,
          total: hourActivities.length,
          activities: hourActivities
        };
      }).filter(data => data.total > 0);
    }
  
    getPottyTypeDistribution(days = 7) {
      const dateRange = this._getDateRange(days);
      console.log("potty distribution ate range = ", dateRange);
      console.log("potty distribution potty logs = ", this.dataService.pottyLogs);
      const recentLogs = (this.dataService.pottyLogs || []).filter(log =>
        dateRange.includes(log.date)
      );
      console.log("potty distribution recentLogs = ", recentLogs);

      
      return [
        { 
          name: 'Successful Pee', 
          value: recentLogs.filter(l => l.type === 'pee' && l.isSuccessful).length,
          color: '#3B82F6'
        },
        { 
          name: 'Successful Poop', 
          value: recentLogs.filter(l => l.type === 'poop' && l.isSuccessful).length,
          color: '#10B981'
        },
        { 
          name: 'Pee Accidents', 
          value: recentLogs.filter(l => l.type === 'pee' && l.isAccident).length,
          color: '#F87171'
        },
        { 
          name: 'Poop Accidents', 
          value: recentLogs.filter(l => l.type === 'poop' && l.isAccident).length,
          color: '#EF4444'
        }
      ].filter(item => item.value > 0);
    }
  
    _getDateRange(days) {
      const dateRange = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dateRange.push(date.toISOString().split('T')[0]);
      }
      return dateRange;
    }
  }