import React from 'react';
import { TrendingUp } from 'lucide-react';
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
  Cell 
} from 'recharts';

const TrendChart = ({ data, title, dataKey, color = "#10B981", height = 120, domain = [0, 100] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis domain={domain} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
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

const HourlyChart = ({ data, title, height = 120 }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="successful" stackId="a" fill="#10B981" name="Successful" />
          <Bar dataKey="accidents" stackId="a" fill="#EF4444" name="Accidents" />
        </BarChart>
      </ResponsiveContainer>
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
            labelFormatter={(label) => `Hour: ${label}`}
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
              <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
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
      <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Data Insights</h4>
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

const TrendAnalysis = ({ insightsService, selectedDate }) => {
  // Get all the analytics data
  const successRateTrend = insightsService.getSuccessRateTrend(14);
  const hourlyTrends = insightsService.getHourlyTrends(7);
  const dailyHourlyActivity = insightsService.getDailyHourlyActivity(selectedDate);
  const pottyDistribution = insightsService.getPottyTypeDistribution(7);

  // Generate insights based on the data
  const generateInsights = () => {
    const insights = [];

    // Success rate insights
    if (successRateTrend.length >= 3) {
      const recent = successRateTrend.slice(-3);
      const trend = recent[2].successRate - recent[0].successRate;
      
      if (trend > 10) {
        insights.push("Success rate is improving significantly over the past few days!");
      } else if (trend < -10) {
        insights.push("Success rate has declined recently - consider reviewing routine.");
      } else {
        insights.push("Success rate is stable - maintain current training approach.");
      }
    }

    // Hourly pattern insights
    if (hourlyTrends.length > 0) {
      const peakHours = hourlyTrends
        .sort((a, b) => b.total - a.total)
        .slice(0, 2)
        .map(h => h.hour.split(':')[0]);
      
      insights.push(
        `Most active potty hours are ${peakHours.join(' and ')} - consider extra attention during these times.`
      );

      const accidentProne = hourlyTrends
        .filter(h => h.accidents > h.successful)
        .map(h => h.hour.split(':')[0]);
      
      if (accidentProne.length > 0) {
        insights.push(
          `Higher accident rates at ${accidentProne.join(', ')} hours - increase outdoor breaks during these times.`
        );
      }
    }

    // Activity pattern insights
    if (dailyHourlyActivity.length > 0) {
      const busyHours = dailyHourlyActivity
        .filter(h => h.total >= 3)
        .map(h => h.hour.split(':')[0]);
      
      if (busyHours.length > 0) {
        insights.push(`Most active periods today: ${busyHours.join(', ')} hours.`);
      }

      const feedingHours = dailyHourlyActivity
        .filter(h => h.feeding > 0)
        .map(h => h.hour.split(':')[0]);
      
      if (feedingHours.length >= 2) {
        insights.push(`Regular feeding schedule maintained at ${feedingHours.join(', ')} hours.`);
      }
    }

    // Distribution insights
    if (pottyDistribution.length > 0) {
      const totalSuccessful = pottyDistribution
        .filter(d => d.name.includes('Successful'))
        .reduce((sum, d) => sum + d.value, 0);
      
      const totalAccidents = pottyDistribution
        .filter(d => d.name.includes('Accidents'))
        .reduce((sum, d) => sum + d.value, 0);
      
      const weeklySuccessRate = Math.round((totalSuccessful / (totalSuccessful + totalAccidents)) * 100);
      
      insights.push(`Weekly success rate: ${weeklySuccessRate}% across all potty events.`);
    }

    return insights;
  };

  const insights = generateInsights();

  const hasData = successRateTrend.length > 0 || 
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
          {/* Success Rate Trend */}
          <TrendChart
            data={successRateTrend}
            title="Success Rate Over Time (Last 14 Days)"
            dataKey="successRate"
            color="#10B981"
          />

          {/* Hourly Potty Patterns */}
          <HourlyChart
            data={hourlyTrends}
            title="Hourly Potty Patterns (Last 7 Days)"
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
                <div className="text-lg font-semibold text-gray-800">Current Trend</div>
                <div className={`text-2xl font-bold ${
                  successRateTrend[successRateTrend.length - 1]?.successRate >= 70 
                    ? 'text-green-600' 
                    : successRateTrend[successRateTrend.length - 1]?.successRate >= 50 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {successRateTrend[successRateTrend.length - 1]?.successRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Latest Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">Active Days</div>
                <div className="text-2xl font-bold text-blue-600">
                  {successRateTrend.length}
                </div>
                <div className="text-sm text-gray-600">Days with Activity</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">Peak Hours</div>
                <div className="text-2xl font-bold text-purple-600">
                  {hourlyTrends.length > 0 
                    ? hourlyTrends.reduce((max, h) => h.total > max.total ? h : max, hourlyTrends[0]).hour
                    : 'N/A'
                  }
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
          <div className="text-sm">Start logging activities to see trend analysis and insights</div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Log at least a few days of potty events and activities to see meaningful trends and patterns.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;