import DateTimeUtils from "../utils/DateTimeUtils.js";

export class InsightsService {
  constructor(dataService) {
    this.dataService = dataService;
  }

  getSuccessRateForDate(date) {
    const logs = this.dataService.getPottyLogsByDate(date);
    if (logs.length === 0) return 0;

    const successful = logs.filter(log => {
      // Use isSuccessful field if available, otherwise compute it
      if (log.hasOwnProperty("isSuccessful")) {
        return log.isSuccessful;
      }
      return log.type !== "accident" && log.location === "outside";
    }).length;

    return Math.round((successful / logs.length) * 100);
  }

  getSuccessRateTrend(days = 14) {
    const trendData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = DateTimeUtils.toLocalDateString(date);

      const dayLogs = this.dataService.getPottyLogsByDate(dateStr);
      const successRate = this.getSuccessRateForDate(dateStr);
      trendData.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        successRate,
        total: dayLogs.length
      });
    }

    return trendData.filter(day => day.total > 0);
  }

  getHourlyTrends(days = 7) {
    const dateRange = this._getDateRange(days);
    const allData = this.dataService.getData();
    const allLogs = (allData.pottyLogs || []).filter(
      log =>
        log.timestamp &&
        dateRange.includes(DateTimeUtils.toLocalDateString(log.timestamp))
    );

    return Array.from({ length: 24 }, (_, hour) => {
      // const hourStr = hour.toString().padStart(2, "0");
      const hourLogs = allLogs.filter(log => {
        if (!log.timestamp) return false;
        return new Date(log.timestamp).getHours() === hour;
      });

      const successful = hourLogs.filter(log =>
        log.hasOwnProperty("isSuccessful")
          ? log.isSuccessful
          : log.type !== "accident" && log.location === "outside"
      ).length;

      const accidents = hourLogs.filter(log =>
        log.hasOwnProperty("isAccident")
          ? log.isAccident
          : log.type === "accident" ||
            log.location === "inside" ||
            log.location === "crate"
      ).length;

      const hourTime = new Date();
      hourTime.setHours(hour, 0, 0, 0);

      return {
        hour: hourTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        successful,
        accidents,
        total: hourLogs.length
      };
    })
      .filter(data => data.total > 0)
      .sort((a, b) => {
        // Extract hour number from locale time string for sorting
        const hourA = new Date(`1970-01-01 ${a.hour}`).getHours();
        const hourB = new Date(`1970-01-01 ${b.hour}`).getHours();
        return hourA - hourB;
      });
  }

  getDailyHourlyActivity(date) {
    const pottyLogs = this.dataService.getPottyLogsByDate(date);
    const activities = this.dataService.getActivitiesByDate(date);
    const allActivities = [...pottyLogs, ...activities];

    return Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, "0");
      const hourActivities = allActivities.filter(activity => {
        let activityHour;
        if (activity.time) {
          activityHour = parseInt(activity.time.split(":")[0]);
        } else if (activity.timestamp) {
          activityHour = new Date(activity.timestamp).getHours();
        } else {
          return false;
        }
        return activityHour === hour;
      });

      const pottyEvents = hourActivities.filter(a => a.type); // Has type field = potty log
      const otherActivities = hourActivities.filter(a => a.activity); // Has activity field = activity log

      return {
        hour: `${hourStr}:00`,
        potty: pottyEvents.length,
        feeding: otherActivities.filter(
          a =>
            a.activity?.toLowerCase().includes("fed") ||
            a.activity?.toLowerCase().includes("food") ||
            a.activity?.toLowerCase().includes("meal")
        ).length,
        play: otherActivities.filter(a =>
          a.activity?.toLowerCase().includes("play")
        ).length,
        training: otherActivities.filter(
          a =>
            a.activity?.toLowerCase().includes("training") ||
            a.activity?.toLowerCase().includes("train")
        ).length,
        crate: otherActivities.filter(a =>
          a.activity?.toLowerCase().includes("crate")
        ).length,
        total: hourActivities.length,
        activities: hourActivities
      };
    }).filter(data => data.total > 0);
  }

  getPottyTypeDistribution(days = 7) {
    const dateRange = this._getDateRange(days);
    const allData = this.dataService.getData();

    const recentLogs = (allData.pottyLogs || []).filter(log => {
      if (log.timestamp) {
        return dateRange.includes(
          DateTimeUtils.toLocalDateString(log.timestamp)
        );
      }
      return false;
    });

    const distribution = [
      {
        name: "Successful Pee",
        value: recentLogs.filter(l => {
          const isPee = l.type === "pee";
          const isSuccessful = l.hasOwnProperty("isSuccessful")
            ? l.isSuccessful
            : l.type !== "accident" && l.location === "outside";
          return isPee && isSuccessful;
        }).length,
        color: "#3B82F6"
      },
      {
        name: "Successful Poop",
        value: recentLogs.filter(l => {
          const isPoop = l.type === "poop";
          const isSuccessful = l.hasOwnProperty("isSuccessful")
            ? l.isSuccessful
            : l.type !== "accident" && l.location === "outside";
          return isPoop && isSuccessful;
        }).length,
        color: "#10B981"
      },
      {
        name: "Pee Accidents",
        value: recentLogs.filter(l => {
          const isPee = l.type === "pee";
          const isAccident = l.hasOwnProperty("isAccident")
            ? l.isAccident
            : l.type === "accident" ||
              l.location === "inside" ||
              l.location === "crate";
          return isPee && isAccident;
        }).length,
        color: "#F87171"
      },
      {
        name: "Poop Accidents",
        value: recentLogs.filter(l => {
          const isPoop = l.type === "poop";
          const isAccident = l.hasOwnProperty("isAccident")
            ? l.isAccident
            : l.type === "accident" ||
              l.location === "inside" ||
              l.location === "crate";
          return isPoop && isAccident;
        }).length,
        color: "#EF4444"
      }
    ].filter(item => item.value > 0);

    return distribution;
  }

  _getDateRange(days) {
    const dateRange = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateRange.push(DateTimeUtils.toLocalDateString(date));
    }
    return dateRange;
  }
}
