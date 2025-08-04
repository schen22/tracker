import React from 'react';
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useHourlyChart } from '../../hooks/useHourlyChart';
import NighttimeControls from './NighttimeControls';
import PatternAnalysisCard from './PatternAnalysisCard';
import ChartLines from './ChartLines';

/**
 * Custom tooltip formatter for better data display
 */
const formatTooltip = (value, name) => {
  const nameMap = {
    pees: 'Pees',
    poops: 'Poops',
    feeding: 'Feeding Sessions',
    crate: 'Crate Sessions',
    play: 'Play Sessions',
    training: 'Training Sessions'
  };
  
  return [Math.round(value * 10) / 10, nameMap[name] || name];
};

/**
 * Custom legend formatter for interactive legend
 */
const formatLegend = (value, entry, hiddenLines) => (
  <span
    style={{
      color: hiddenLines.has(entry.dataKey) ? '#9CA3AF' : entry.color,
      opacity: hiddenLines.has(entry.dataKey) ? 0.5 : 1
    }}
  >
    {value}
  </span>
);

/**
 * Refactored HourlyChart Component
 * 
 * A modular chart component that displays hourly patterns for potty activities
 * and other behaviors with interactive features and pattern analysis.
 */
const HourlyChart = ({ data, title, height = 200, activities = [] }) => {
  const {
    transformedData,
    patterns,
    hiddenLines,
    excludeNighttime,
    nighttimeStart,
    nighttimeEnd,
    handleLegendClick,
    handleExcludeNighttimeChange,
    handleNighttimeStartChange,
    handleNighttimeEndChange
  } = useHourlyChart(data, activities);

  // Early return if no data
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header with title and controls */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <NighttimeControls
          excludeNighttime={excludeNighttime}
          nighttimeStart={nighttimeStart}
          nighttimeEnd={nighttimeEnd}
          onExcludeNighttimeChange={handleExcludeNighttimeChange}
          onNighttimeStartChange={handleNighttimeStartChange}
          onNighttimeEndChange={handleNighttimeEndChange}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 10 }}
            interval={1} // Show every other hour to avoid crowding
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={label => `Hour: ${label}`}
          />
          <Legend
            onClick={(e) => handleLegendClick(e.dataKey)}
            wrapperStyle={{ cursor: 'pointer' }}
            formatter={(value, entry) => formatLegend(value, entry, hiddenLines)}
          />
          
          <ChartLines hiddenLines={hiddenLines} />
        </LineChart>
      </ResponsiveContainer>

      {/* Pattern Analysis */}
      <PatternAnalysisCard patterns={patterns} />
    </div>
  );
};

export default HourlyChart;