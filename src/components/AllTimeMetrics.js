import React from "react";

const MetricCard = ({ title, value, subtitle, icon, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-2 rounded-lg text-center`}>
      <div className="text-l mb-1">{icon}</div>
      <div className={`text-m font-bold ${textColor}`}>{value}</div>
      <div className="text-sm text-gray-700 font-medium">{title}</div>
      {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
    </div>
  );
};

const HeroMetric = ({ title, value, icon, textColor = "text-gray-800" }) => {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
    </div>
  );
};

const AllTimeMetrics = ({ pottyLogs, activities }) => {
  const calculateMetrics = () => {
    // All-time totals
    const totalPees = pottyLogs.filter(log => log.type === "pee").length;
    const totalPoops = pottyLogs.filter(log => log.type === "poop").length;
    const totalAccidents = pottyLogs.filter(log => log.location === "inside")
      .length;
    const totalPottyEvents = pottyLogs.length;

    const totalFeeding = activities.filter(activity =>
      activity.activity?.includes("Fed")
    ).length;
    const totalPlay = activities.filter(activity =>
      activity.activity?.includes("Play")
    ).length;
    const totalTraining = activities.filter(activity =>
      activity.activity?.includes("Training")
    ).length;
    const totalCrate = activities.filter(activity =>
      activity.activity?.includes("Crate")
    ).length;
    const totalActivities = activities.length;

    // Helper function to calculate median
    const calculateMedian = numbers => {
      if (numbers.length === 0) return 0;
      const sorted = numbers.slice().sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);

      if (sorted.length % 2 === 0) {
        return ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1);
      } else {
        return sorted[middle].toFixed(1);
      }
    };

    // Group data by day and count occurrences
    const dailyCounts = {};

    // Count potty events by day
    pottyLogs.forEach(log => {
      const date = new Date(log.timestamp).toDateString();
      if (!dailyCounts[date]) {
        dailyCounts[date] = {
          pees: 0,
          poops: 0,
          accidents: 0,
          feeding: 0,
          play: 0,
          training: 0,
          crate: 0,
          activities: 0
        };
      }

      if (log.type === "pee") dailyCounts[date].pees++;
      if (log.type === "poop") dailyCounts[date].poops++;
      if (log.location === "inside") dailyCounts[date].accidents++;
    });

    // Count activities by day
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!dailyCounts[date]) {
        dailyCounts[date] = {
          pees: 0,
          poops: 0,
          accidents: 0,
          feeding: 0,
          play: 0,
          training: 0,
          crate: 0,
          activities: 0
        };
      }

      dailyCounts[date].activities++;
      if (activity.activity?.includes("Fed")) dailyCounts[date].feeding++;
      if (activity.activity?.includes("Play")) dailyCounts[date].play++;
      if (activity.activity?.includes("Training")) dailyCounts[date].training++;
      if (activity.activity?.includes("Crate")) dailyCounts[date].crate++;
    });

    const dailyCountsArray = Object.values(dailyCounts);
    const totalDays = dailyCountsArray.length || 1;

    // Calculate medians
    const medianPeesPerDay = calculateMedian(dailyCountsArray.map(d => d.pees));
    const medianPoopsPerDay = calculateMedian(
      dailyCountsArray.map(d => d.poops)
    );
    const medianAccidentsPerDay = calculateMedian(
      dailyCountsArray.map(d => d.accidents)
    );
    const medianFeedingPerDay = calculateMedian(
      dailyCountsArray.map(d => d.feeding)
    );
    const medianPlayPerDay = calculateMedian(dailyCountsArray.map(d => d.play));
    const medianTrainingPerDay = calculateMedian(
      dailyCountsArray.map(d => d.training)
    );
    const medianActivitiesPerDay = calculateMedian(
      dailyCountsArray.map(d => d.activities)
    );

    // Success rate
    const successfulEvents = pottyLogs.filter(log => log.location === "outside")
      .length;
    const overallSuccessRate =
      totalPottyEvents > 0
        ? Math.round((successfulEvents / totalPottyEvents) * 100)
        : 0;

    // Days since last accident calculation
    const daysSinceLastAccident = () => {
      const accidents = pottyLogs
        .filter(log => log.location === "inside")
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (accidents.length === 0) return "Never";

      const lastAccident = new Date(accidents[0].timestamp);
      const today = new Date();
      const diffTime = Math.abs(today - lastAccident);
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return daysDiff;
    };

    const daysSinceAccident = daysSinceLastAccident();

    // Grand total of all events (accidents are already included in pees/poops)
    const grandTotal =
      totalPottyEvents + // This already includes all pees and poops (successful + accidents)
      totalFeeding +
      totalPlay +
      totalTraining +
      totalCrate;

    return {
      totals: {
        totalPees,
        totalPoops,
        totalAccidents,
        totalPottyEvents,
        totalFeeding,
        totalPlay,
        totalTraining,
        totalCrate,
        totalActivities,
        overallSuccessRate,
        grandTotal,
        daysSinceAccident
      },
      medians: {
        medianPeesPerDay,
        medianPoopsPerDay,
        medianAccidentsPerDay,
        medianFeedingPerDay,
        medianPlayPerDay,
        medianTrainingPerDay,
        medianActivitiesPerDay
      },
      totalDays
    };
  };

  const metrics = calculateMetrics();

  if (
    metrics.totals.totalPottyEvents === 0 &&
    metrics.totals.totalActivities === 0
  ) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          All-Time Metrics
        </h2>
        <div className="text-center text-gray-500 py-8">
          <div className="text-lg mb-2">📊</div>
          <div>No data available yet</div>
          <div className="text-sm mt-1">
            Start logging to see your all-time metrics!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        All-Time Metrics
      </h2>

      {/* Hero Metrics */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-8">
            <HeroMetric
              title="Total Events Logged"
              value={metrics.totals.grandTotal}
              icon="🏆"
              textColor="text-blue-600"
            />
            <HeroMetric
              title="Overall Success Rate"
              value={`${metrics.totals.overallSuccessRate}%`}
              icon="🎯"
              textColor="text-purple-600"
            />
            <HeroMetric
              title="Days Since Last Accident"
              value={
                metrics.totals.daysSinceAccident === "Never"
                  ? "∞"
                  : metrics.totals.daysSinceAccident
              }
              icon="🛡️"
              textColor="text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Total Counts */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Total Counts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Pees"
            value={metrics.totals.totalPees}
            icon="💧"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <MetricCard
            title="Total Poops"
            value={metrics.totals.totalPoops}
            icon="💩"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <MetricCard
            title="Total Accidents"
            value={metrics.totals.totalAccidents}
            icon="⚠️"
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
          <MetricCard
            title="Feeding Sessions"
            value={metrics.totals.totalFeeding}
            icon="🍽️"
            bgColor="bg-orange-50"
            textColor="text-orange-600"
          />
          <MetricCard
            title="Play Sessions"
            value={metrics.totals.totalPlay}
            icon="🎾"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <MetricCard
            title="Training Sessions"
            value={metrics.totals.totalTraining}
            icon="🎯"
            bgColor="bg-indigo-50"
            textColor="text-indigo-600"
          />
          <MetricCard
            title="Crate Sessions"
            value={metrics.totals.totalCrate}
            icon="🏠"
            bgColor="bg-gray-50"
            textColor="text-gray-600"
          />
        </div>
      </div>

      {/* Daily Medians */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Daily Medians{" "}
          <span className="text-sm font-normal text-gray-500">
            ({metrics.totalDays} days tracked)
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Median Pees/Day"
            value={metrics.medians.medianPeesPerDay}
            icon="💧"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <MetricCard
            title="Median Poops/Day"
            value={metrics.medians.medianPoopsPerDay}
            icon="💩"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <MetricCard
            title="Median Accidents/Day"
            value={metrics.medians.medianAccidentsPerDay}
            icon="⚠️"
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
          <MetricCard
            title="Median Activities/Day"
            value={metrics.medians.medianActivitiesPerDay}
            icon="📋"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AllTimeMetrics;
