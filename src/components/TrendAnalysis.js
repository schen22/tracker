import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const TrendChart = ({
  data,
  title,
  dataKey,
  color = "#10B981",
  height = 120,
  domain = [0, 100]
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis domain={domain} tick={{ fontSize: 10 }} />
          <Tooltip formatter={value => [`${value}%`, "Success Rate"]} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const HourlyChart = ({ data, title, height = 200, activities = [] }) => {
  const [hiddenLines, setHiddenLines] = useState(new Set());
  const [excludeNighttime, setExcludeNighttime] = useState(true);
  const [nighttimeStart, setNighttimeStart] = useState(21);
  const [nighttimeEnd, setNighttimeEnd] = useState(6);

  if (!data || data.length === 0) return null;

  // Create a complete 24-hour dataset, filling in missing hours with zeros
  const completeHourlyData = Array.from({ length: 24 }, (_, hour) => {
    // Find existing data for this hour
    const existingData = data.find(item => {
      // Extract hour from time string (e.g., "06:00 AM" -> 6)
      const hourMatch = item.hour.match(/(\d{1,2}):00\s*(AM|PM)/);
      if (!hourMatch) return false;

      let itemHour = parseInt(hourMatch[1]);
      const isPM = hourMatch[2] === "PM";

      // Convert to 24-hour format
      if (isPM && itemHour !== 12) itemHour += 12;
      if (!isPM && itemHour === 12) itemHour = 0;

      return itemHour === hour;
    });

    const totalEvents = existingData
      ? existingData.successful + existingData.accidents
      : 0;
    const estimatedPees = Math.round(totalEvents * 0.7);
    const estimatedPoops = totalEvents - estimatedPees;

    return {
      hour: hour, // Use numeric hour (0-23) for proper sorting
      hourLabel: `${hour.toString().padStart(2, "0")}:00`, // Display label
      pees: estimatedPees,
      poops: estimatedPoops,
      successful: existingData ? existingData.successful : 0,
      accidents: existingData ? existingData.accidents : 0
    };
  });

  const transformedData = completeHourlyData; // Already in correct order (0-23)

  // Filter activities to the same 7-day period as potty data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivities = activities.filter(
    activity => new Date(activity.timestamp) >= sevenDaysAgo
  );

  // Calculate hourly activity frequencies for the last 7 days
  const calculateHourlyActivityFrequency = (activities, activityType) => {
    const relevantActivities = activities.filter(activity =>
      activity.activity?.toLowerCase().includes(activityType.toLowerCase())
    );

    // Group by hour and count occurrences
    const hourlyData = Array.from({ length: 24 }, () => 0);
    relevantActivities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourlyData[hour]++;
    });

    return hourlyData;
  };

  const feedingFrequency = calculateHourlyActivityFrequency(
    recentActivities,
    "fed"
  );
  const crateFrequency = calculateHourlyActivityFrequency(
    recentActivities,
    "crate"
  );
  const playFrequency = calculateHourlyActivityFrequency(
    recentActivities,
    "play"
  );
  const trainingFrequency = calculateHourlyActivityFrequency(
    recentActivities,
    "training"
  );

  // Add activity frequency data to each hour
  const finalData = transformedData.map((item, index) => ({
    ...item,
    feeding: feedingFrequency[index],
    crate: crateFrequency[index],
    play: playFrequency[index],
    training: trainingFrequency[index]
  }));

  // Handle legend click to hide/show lines
  const handleLegendClick = dataKey => {
    const newHiddenLines = new Set(hiddenLines);
    if (newHiddenLines.has(dataKey)) {
      newHiddenLines.delete(dataKey);
    } else {
      newHiddenLines.add(dataKey);
    }
    setHiddenLines(newHiddenLines);
  };

  // Helper function to check if hour is in nighttime range
  const isNighttime = hour => {
    if (!excludeNighttime) return false;
    if (nighttimeStart > nighttimeEnd) {
      // Wraps around midnight: e.g., 21-6 means 21:00-05:59
      return hour >= nighttimeStart || hour < nighttimeEnd;
    } else {
      // Same day: e.g., 6-21 means 06:00-20:59
      return hour >= nighttimeStart && hour < nighttimeEnd;
    }
  };

  // Generate pattern analysis
  const generatePatternAnalysis = () => {
    const patterns = [];

    // Find peak hours for each activity (optionally excluding nighttime)
    const getPeakHours = (data, key) => {
      return data
        .map((item, index) => ({ hour: index, value: item[key] }))
        .filter(item => item.value > 0 && !isNighttime(item.hour))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
        .map(item => item.hour);
    };

    const peePeaks = getPeakHours(finalData, "pees");
    const poopPeaks = getPeakHours(finalData, "poops");
    const feedingPeaks = getPeakHours(finalData, "feeding");
    const trainingPeaks = getPeakHours(finalData, "training");

    // Analyze correlations
    if (feedingPeaks.length > 0 && peePeaks.length > 0) {
      const feedingAvg =
        feedingPeaks.reduce((sum, h) => sum + h, 0) / feedingPeaks.length;
      const peeAvg = peePeaks.reduce((sum, h) => sum + h, 0) / peePeaks.length;
      const timeDiff = Math.abs(peeAvg - feedingAvg);

      if (timeDiff <= 2) {
        patterns.push(
          `Pee activity peaks around feeding times (${Math.round(
            timeDiff
          )} hour difference)`
        );
      } else if (peeAvg > feedingAvg) {
        patterns.push(
          `Pee activity typically occurs ${Math.round(
            timeDiff
          )} hours after feeding`
        );
      }
    }

    if (trainingPeaks.length > 0 && poopPeaks.length > 0) {
      const trainingAvg =
        trainingPeaks.reduce((sum, h) => sum + h, 0) / trainingPeaks.length;
      const poopAvg =
        poopPeaks.reduce((sum, h) => sum + h, 0) / poopPeaks.length;
      const timeDiff = Math.abs(poopAvg - trainingAvg);

      if (timeDiff <= 1) {
        patterns.push(`Training sessions and poop times are closely aligned`);
      }
    }

    // Find quiet periods
    const quietHours = finalData
      .map((item, index) => ({
        hour: index,
        total:
          item.pees +
          item.poops +
          item.feeding +
          item.play +
          item.training +
          item.crate
      }))
      .filter(item => item.total === 0)
      .map(item => item.hour);

    if (quietHours.length > 3) {
      const quietRanges = [];
      let start = quietHours[0];
      let end = start;

      for (let i = 1; i < quietHours.length; i++) {
        if (quietHours[i] === end + 1) {
          end = quietHours[i];
        } else {
          if (end - start >= 2) {
            quietRanges.push(
              `${start
                .toString()
                .padStart(2, "0")}:00-${end.toString().padStart(2, "0")}:00`
            );
          }
          start = quietHours[i];
          end = start;
        }
      }

      if (end - start >= 2) {
        quietRanges.push(
          `${start.toString().padStart(2, "0")}:00-${end
            .toString()
            .padStart(2, "0")}:00`
        );
      }

      if (quietRanges.length > 0) {
        patterns.push(
          `Quiet periods with minimal activity: ${quietRanges.join(", ")}`
        );
      }
    }

    // Most active hours (optionally excluding nighttime)
    const mostActiveHour = finalData
      .map((item, index) => ({
        hour: index,
        total: item.pees + item.poops
      }))
      .filter(item => !isNighttime(item.hour))
      .sort((a, b) => b.total - a.total)[0];

    if (mostActiveHour && mostActiveHour.total > 0) {
      patterns.push(
        `Peak bathroom activity occurs around ${mostActiveHour.hour
          .toString()
          .padStart(2, "0")}:00`
      );
    }

    return patterns;
  };

  const patterns = generatePatternAnalysis();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={excludeNighttime}
              onChange={e => setExcludeNighttime(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-600">Exclude nighttime</span>
          </label>
          {excludeNighttime && (
            <div className="flex items-center gap-1">
              <select
                value={nighttimeStart}
                onChange={e => setNighttimeStart(parseInt(e.target.value))}
                className="border rounded px-1 py-0.5 text-xs"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="text-gray-500">to</span>
              <select
                value={nighttimeEnd}
                onChange={e => setNighttimeEnd(parseInt(e.target.value))}
                className="border rounded px-1 py-0.5 text-xs"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={finalData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 10 }}
            interval={1} // Show every other hour to avoid crowding
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [
              Math.round(value * 10) / 10,
              name === "pees"
                ? "Pees"
                : name === "poops"
                ? "Poops"
                : name === "feeding"
                ? "Feeding Sessions"
                : name === "crate"
                ? "Crate Sessions"
                : name === "play"
                ? "Play Sessions"
                : name === "training"
                ? "Training Sessions"
                : name
            ]}
            labelFormatter={label => `Hour: ${label}`}
          />
          <Legend
            onClick={e => handleLegendClick(e.dataKey)}
            wrapperStyle={{ cursor: "pointer" }}
            formatter={(value, entry) => (
              <span
                style={{
                  color: hiddenLines.has(entry.dataKey)
                    ? "#9CA3AF"
                    : entry.color,
                  opacity: hiddenLines.has(entry.dataKey) ? 0.5 : 1
                }}
              >
                {value}
              </span>
            )}
          />

          {/* Main lines for pees and poops */}
          <Line
            type="monotone"
            dataKey="pees"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: "#3B82F6", r: 4 }}
            name="Pees"
            strokeOpacity={hiddenLines.has("pees") ? 0 : 1}
            fillOpacity={hiddenLines.has("pees") ? 0 : 1}
          />
          <Line
            type="monotone"
            dataKey="poops"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: "#10B981", r: 4 }}
            name="Poops"
            strokeOpacity={hiddenLines.has("poops") ? 0 : 1}
            fillOpacity={hiddenLines.has("poops") ? 0 : 1}
          />

          {/* Activity frequency lines */}
          <Line
            type="monotone"
            dataKey="feeding"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: "#F59E0B", r: 3 }}
            strokeDasharray="5 5"
            name="Feeding Sessions"
            strokeOpacity={hiddenLines.has("feeding") ? 0 : 1}
            fillOpacity={hiddenLines.has("feeding") ? 0 : 1}
          />
          <Line
            type="monotone"
            dataKey="crate"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: "#8B5CF6", r: 3 }}
            strokeDasharray="5 5"
            name="Crate Sessions"
            strokeOpacity={hiddenLines.has("crate") ? 0 : 1}
            fillOpacity={hiddenLines.has("crate") ? 0 : 1}
          />
          <Line
            type="monotone"
            dataKey="play"
            stroke="#FBBF24"
            strokeWidth={2}
            dot={{ fill: "#FBBF24", r: 3 }}
            strokeDasharray="5 5"
            name="Play Sessions"
            strokeOpacity={hiddenLines.has("play") ? 0 : 1}
            fillOpacity={hiddenLines.has("play") ? 0 : 1}
          />
          <Line
            type="monotone"
            dataKey="training"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ fill: "#6366F1", r: 3 }}
            strokeDasharray="5 5"
            name="Training Sessions"
            strokeOpacity={hiddenLines.has("training") ? 0 : 1}
            fillOpacity={hiddenLines.has("training") ? 0 : 1}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Pattern Analysis Summary */}
      {patterns.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            🔍 Pattern Analysis
            <span className="text-xs font-normal text-blue-600">
              (Last 7 Days)
            </span>
          </h4>
          <div className="space-y-1">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="text-sm text-blue-700 flex items-start gap-2"
              >
                <span className="text-blue-400 mt-1">•</span>
                <span>{pattern}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-blue-600">
            💡 <strong>Tip:</strong> Click legend items to hide/show lines for
            better pattern visibility
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityChart = ({ data, title, height = 140 }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={label => `Hour: ${label}`}
          />
          <Bar dataKey="potty" stackId="a" fill="#3B82F6" name="Potty" />
          <Bar dataKey="feeding" stackId="a" fill="#F59E0B" name="Feeding" />
          <Bar dataKey="play" stackId="a" fill="#FBBF24" name="Play" />
          <Bar dataKey="training" stackId="a" fill="#6366F1" name="Training" />
          <Bar dataKey="crate" stackId="a" fill="#8B5CF6" name="Crate" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DistributionChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={100}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">
        📊 Data Insights
      </h4>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className="text-sm text-blue-700">
            • {insight}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrendAnalysis = ({
  insightsService,
  selectedDate,
  pottyLogs,
  activities
}) => {
  // Get all the analytics data
  const successRateTrend = insightsService.getSuccessRateTrend(14);
  const hourlyTrends = insightsService.getHourlyTrends(7);
  const dailyHourlyActivity = insightsService.getDailyHourlyActivity(
    selectedDate
  );
  const pottyDistribution = insightsService.getPottyTypeDistribution(7);

  // Generate insights based on the data
  const generateInsights = () => {
    const insights = [];

    // Success rate insights
    if (successRateTrend.length >= 3) {
      const recent = successRateTrend.slice(-3);
      const trend = recent[2].successRate - recent[0].successRate;

      if (trend > 10) {
        insights.push(
          "Success rate is improving significantly over the past few days!"
        );
      } else if (trend < -10) {
        insights.push(
          "Success rate has declined recently - consider reviewing routine."
        );
      } else {
        insights.push(
          "Success rate is stable - maintain current training approach."
        );
      }
    }

    // Hourly pattern insights
    if (hourlyTrends.length > 0) {
      const peakHours = hourlyTrends
        .sort((a, b) => b.total - a.total)
        .slice(0, 2)
        .map(h => h.hour.split(":")[0]);

      insights.push(
        `Most active potty hours are ${peakHours.join(
          " and "
        )} - consider extra attention during these times.`
      );

      const accidentProne = hourlyTrends
        .filter(h => h.accidents > h.successful)
        .map(h => h.hour.split(":")[0]);

      if (accidentProne.length > 0) {
        insights.push(
          `Higher accident rates at ${accidentProne.join(
            ", "
          )} hours - increase outdoor breaks during these times.`
        );
      }
    }

    // Activity pattern insights
    if (dailyHourlyActivity.length > 0) {
      const busyHours = dailyHourlyActivity
        .filter(h => h.total >= 3)
        .map(h => h.hour.split(":")[0]);

      if (busyHours.length > 0) {
        insights.push(
          `Most active periods today: ${busyHours.join(", ")} hours.`
        );
      }

      const feedingHours = dailyHourlyActivity
        .filter(h => h.feeding > 0)
        .map(h => h.hour.split(":")[0]);

      if (feedingHours.length >= 2) {
        insights.push(
          `Regular feeding schedule maintained at ${feedingHours.join(
            ", "
          )} hours.`
        );
      }
    }

    // Distribution insights
    if (pottyDistribution.length > 0) {
      const totalSuccessful = pottyDistribution
        .filter(d => d.name.includes("Successful"))
        .reduce((sum, d) => sum + d.value, 0);

      const totalAccidents = pottyDistribution
        .filter(d => d.name.includes("Accidents"))
        .reduce((sum, d) => sum + d.value, 0);

      const weeklySuccessRate = Math.round(
        (totalSuccessful / (totalSuccessful + totalAccidents)) * 100
      );

      insights.push(
        `Weekly success rate: ${weeklySuccessRate}% across all potty events.`
      );
    }

    return insights;
  };

  const insights = generateInsights();

  const hasData =
    successRateTrend.length > 0 ||
    hourlyTrends.length > 0 ||
    dailyHourlyActivity.length > 0 ||
    pottyDistribution.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Trend Analysis
      </h2>

      {hasData ? (
        <div className="space-y-6">
          {/* Hourly Potty Patterns */}
          <HourlyChart
            data={hourlyTrends}
            title="Hourly Potty & Activity Patterns (Last 7 Days)"
            activities={activities}
          />

          {/* Success Rate Trend */}
          <TrendChart
            data={successRateTrend}
            title="Success Rate Over Time (Last 14 Days)"
            dataKey="successRate"
            color="#10B981"
          />

          {/* Daily Hourly Activity */}
          <ActivityChart
            data={dailyHourlyActivity}
            title="Today's Hourly Activity Breakdown"
          />

          {/* Weekly Distribution */}
          <DistributionChart
            data={pottyDistribution}
            title="Weekly Potty Distribution"
          />

          {/* Insights */}
          <InsightCard insights={insights} />

          {/* Performance Summary */}
          {successRateTrend.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  Current Trend
                </div>
                <div
                  className={`text-2xl font-bold ${
                    successRateTrend[successRateTrend.length - 1]
                      ?.successRate >= 70
                      ? "text-green-600"
                      : successRateTrend[successRateTrend.length - 1]
                          ?.successRate >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {successRateTrend[successRateTrend.length - 1]?.successRate ||
                    0}
                  %
                </div>
                <div className="text-sm text-gray-600">Latest Success Rate</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  Active Days
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {successRateTrend.length}
                </div>
                <div className="text-sm text-gray-600">Days with Activity</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  Peak Hours
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {hourlyTrends.length > 0
                    ? hourlyTrends.reduce(
                        (max, h) => (h.total > max.total ? h : max),
                        hourlyTrends[0]
                      ).hour
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Most Active Time</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">No Data Available</div>
          <div className="text-sm">
            Start logging activities to see trend analysis and insights
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Log at least a few days of potty events and
              activities to see meaningful trends and patterns.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;
