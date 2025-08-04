/**
 * Pattern Analysis Utilities
 * 
 * This module contains functions for analyzing patterns in hourly activity data,
 * including correlations between different types of activities and identifying
 * peak usage times and quiet periods.
 */

/**
 * Helper function to check if an hour falls within nighttime range
 * @param {number} hour - Hour to check (0-23)
 * @param {boolean} excludeNighttime - Whether nighttime exclusion is enabled
 * @param {number} nighttimeStart - Start hour of nighttime (e.g., 21)
 * @param {number} nighttimeEnd - End hour of nighttime (e.g., 6)
 * @returns {boolean} - True if hour is in nighttime range and exclusion is enabled
 */
export const isNighttime = (hour, excludeNighttime, nighttimeStart, nighttimeEnd) => {
  if (!excludeNighttime) return false;
  
  if (nighttimeStart > nighttimeEnd) {
    // Wraps around midnight: e.g., 21-6 means 21:00-05:59
    return hour >= nighttimeStart || hour < nighttimeEnd;
  } else {
    // Same day: e.g., 6-21 means 06:00-20:59
    return hour >= nighttimeStart && hour < nighttimeEnd;
  }
};

/**
 * Find peak hours for a specific activity type
 * @param {Array} data - Hourly data array
 * @param {string} key - Data key to analyze (e.g., 'pees', 'feeding')
 * @param {Object} nighttimeConfig - Configuration for nighttime exclusion
 * @returns {Array} - Array of peak hours (up to 2)
 */
export const getPeakHours = (data, key, nighttimeConfig) => {
  const { excludeNighttime, nighttimeStart, nighttimeEnd } = nighttimeConfig;
  
  return data
    .map((item, index) => ({ hour: index, value: item[key] }))
    .filter(item => 
      item.value > 0 && 
      !isNighttime(item.hour, excludeNighttime, nighttimeStart, nighttimeEnd)
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map(item => item.hour);
};

/**
 * Analyze correlations between feeding times and bathroom activities
 * @param {Array} feedingPeaks - Peak feeding hours
 * @param {Array} peePeaks - Peak pee hours
 * @returns {string|null} - Correlation insight or null if no pattern found
 */
export const analyzeFeedingCorrelation = (feedingPeaks, peePeaks) => {
  if (feedingPeaks.length === 0 || peePeaks.length === 0) return null;
  
  const feedingAvg = feedingPeaks.reduce((sum, h) => sum + h, 0) / feedingPeaks.length;
  const peeAvg = peePeaks.reduce((sum, h) => sum + h, 0) / peePeaks.length;
  const timeDiff = Math.abs(peeAvg - feedingAvg);

  if (timeDiff <= 2) {
    return `Pee activity peaks around feeding times (${Math.round(timeDiff)} hour difference)`;
  } else if (peeAvg > feedingAvg) {
    return `Pee activity typically occurs ${Math.round(timeDiff)} hours after feeding`;
  }
  
  return null;
};

/**
 * Analyze correlations between training sessions and bathroom activities
 * @param {Array} trainingPeaks - Peak training hours
 * @param {Array} poopPeaks - Peak poop hours
 * @returns {string|null} - Correlation insight or null if no pattern found
 */
export const analyzeTrainingCorrelation = (trainingPeaks, poopPeaks) => {
  if (trainingPeaks.length === 0 || poopPeaks.length === 0) return null;
  
  const trainingAvg = trainingPeaks.reduce((sum, h) => sum + h, 0) / trainingPeaks.length;
  const poopAvg = poopPeaks.reduce((sum, h) => sum + h, 0) / poopPeaks.length;
  const timeDiff = Math.abs(poopAvg - trainingAvg);

  if (timeDiff <= 1) {
    return 'Training sessions and poop times are closely aligned';
  }
  
  return null;
};

/**
 * Find quiet periods with minimal activity
 * @param {Array} data - Hourly data array
 * @returns {string|null} - Quiet periods description or null if none found
 */
export const findQuietPeriods = (data) => {
  const quietHours = data
    .map((item, index) => ({
      hour: index,
      total: item.pees + item.poops + item.feeding + item.play + item.training + item.crate
    }))
    .filter(item => item.total === 0)
    .map(item => item.hour);

  if (quietHours.length <= 3) return null;

  const quietRanges = [];
  let start = quietHours[0];
  let end = start;

  for (let i = 1; i < quietHours.length; i++) {
    if (quietHours[i] === end + 1) {
      end = quietHours[i];
    } else {
      if (end - start >= 2) {
        quietRanges.push(
          `${start.toString().padStart(2, "0")}:00-${end.toString().padStart(2, "0")}:00`
        );
      }
      start = quietHours[i];
      end = start;
    }
  }

  if (end - start >= 2) {
    quietRanges.push(
      `${start.toString().padStart(2, "0")}:00-${end.toString().padStart(2, "0")}:00`
    );
  }

  return quietRanges.length > 0 
    ? `Quiet periods with minimal activity: ${quietRanges.join(", ")}`
    : null;
};

/**
 * Find the most active hour for bathroom activities
 * @param {Array} data - Hourly data array
 * @param {Object} nighttimeConfig - Configuration for nighttime exclusion
 * @returns {string|null} - Peak activity insight or null if no activity found
 */
export const findMostActiveHour = (data, nighttimeConfig) => {
  const { excludeNighttime, nighttimeStart, nighttimeEnd } = nighttimeConfig;
  
  const mostActiveHour = data
    .map((item, index) => ({
      hour: index,
      total: item.pees + item.poops
    }))
    .filter(item => 
      !isNighttime(item.hour, excludeNighttime, nighttimeStart, nighttimeEnd)
    )
    .sort((a, b) => b.total - a.total)[0];

  if (!mostActiveHour || mostActiveHour.total === 0) return null;
  
  return `Peak bathroom activity occurs around ${mostActiveHour.hour
    .toString()
    .padStart(2, "0")}:00`;
};

/**
 * Generate comprehensive pattern analysis
 * @param {Array} data - Hourly data array
 * @param {Object} nighttimeConfig - Configuration for nighttime exclusion
 * @returns {Array} - Array of pattern insights
 */
export const generatePatternAnalysis = (data, nighttimeConfig) => {
  const patterns = [];

  // Get peak hours for each activity
  const peePeaks = getPeakHours(data, 'pees', nighttimeConfig);
  const poopPeaks = getPeakHours(data, 'poops', nighttimeConfig);
  const feedingPeaks = getPeakHours(data, 'feeding', nighttimeConfig);
  const trainingPeaks = getPeakHours(data, 'training', nighttimeConfig);

  // Analyze correlations
  const feedingCorrelation = analyzeFeedingCorrelation(feedingPeaks, peePeaks);
  if (feedingCorrelation) patterns.push(feedingCorrelation);

  const trainingCorrelation = analyzeTrainingCorrelation(trainingPeaks, poopPeaks);
  if (trainingCorrelation) patterns.push(trainingCorrelation);

  // Find quiet periods and peak activity
  const quietPeriods = findQuietPeriods(data);
  if (quietPeriods) patterns.push(quietPeriods);

  const mostActiveHour = findMostActiveHour(data, nighttimeConfig);
  if (mostActiveHour) patterns.push(mostActiveHour);

  return patterns;
};