import { useState, useMemo } from 'react';
import { transformHourlyData } from '../utils/hourlyDataTransform';
import { generatePatternAnalysis } from '../utils/patternAnalysis';

/**
 * Custom hook for managing hourly chart state and data processing
 * 
 * This hook encapsulates all the state management and data processing
 * logic for the hourly chart component.
 */
export const useHourlyChart = (data, activities) => {
  // UI state
  const [hiddenLines, setHiddenLines] = useState(new Set());
  const [excludeNighttime, setExcludeNighttime] = useState(true);
  const [nighttimeStart, setNighttimeStart] = useState(21);
  const [nighttimeEnd, setNighttimeEnd] = useState(6);

  // Process and transform data
  const transformedData = useMemo(() => {
    console.log('useHourlyChart - Raw data:', data);
    console.log('useHourlyChart - Activities:', activities);
    if (!data || data.length === 0) {
      console.log('useHourlyChart - No data, returning empty array');
      return [];
    }
    const result = transformHourlyData(data, activities, 7);
    console.log('useHourlyChart - Transformed data:', result);
    return result;
  }, [data, activities]);

  // Generate nighttime configuration object
  const nighttimeConfig = useMemo(() => ({
    excludeNighttime,
    nighttimeStart,
    nighttimeEnd
  }), [excludeNighttime, nighttimeStart, nighttimeEnd]);

  // Generate pattern analysis
  const patterns = useMemo(() => {
    if (transformedData.length === 0) return [];
    return generatePatternAnalysis(transformedData, nighttimeConfig);
  }, [transformedData, nighttimeConfig]);

  // Event handlers
  const handleLegendClick = (dataKey) => {
    const newHiddenLines = new Set(hiddenLines);
    if (newHiddenLines.has(dataKey)) {
      newHiddenLines.delete(dataKey);
    } else {
      newHiddenLines.add(dataKey);
    }
    setHiddenLines(newHiddenLines);
  };

  const handleExcludeNighttimeChange = (value) => {
    setExcludeNighttime(value);
  };

  const handleNighttimeStartChange = (value) => {
    setNighttimeStart(value);
  };

  const handleNighttimeEndChange = (value) => {
    setNighttimeEnd(value);
  };

  return {
    // Data
    transformedData,
    patterns,
    
    // UI State
    hiddenLines,
    excludeNighttime,
    nighttimeStart,
    nighttimeEnd,
    
    // Event handlers
    handleLegendClick,
    handleExcludeNighttimeChange,
    handleNighttimeStartChange,
    handleNighttimeEndChange
  };
};