/**
 * Hourly Data Transformation Utilities
 * 
 * This module contains functions for transforming and processing hourly data
 * for trend analysis and visualization.
 */

/**
 * Create a complete 24-hour dataset with zeros for missing hours
 * @param {Array} data - Raw hourly data from InsightsService
 * @returns {Array} - Complete 24-hour dataset (0-23)
 */
export const createComplete24HourData = (data) => {
  console.log('createComplete24HourData - Input data:', data);
  return Array.from({ length: 24 }, (_, hour) => {
    // Find existing data for this hour
    const existingData = data.find(item => {
      // Extract hour from time string (e.g., "06:00 AM" -> 6)
      const hourMatch = item.hour && item.hour.match(/(\d{1,2}):00\s*(AM|PM)/);
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
};

/**
 * Filter activities to the last N days
 * @param {Array} activities - All activity data
 * @param {number} days - Number of days to include (default: 7)
 * @returns {Array} - Filtered activities within the date range
 */
export const filterActivitiesByDays = (activities, days = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return activities.filter(activity => 
    new Date(activity.timestamp) >= cutoffDate
  );
};

/**
 * Calculate hourly frequency for a specific activity type
 * @param {Array} activities - Activity data
 * @param {string} activityType - Type of activity to count (e.g., 'fed', 'play')
 * @returns {Array} - Array of 24 numbers representing hourly counts
 */
export const calculateHourlyActivityFrequency = (activities, activityType) => {
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

/**
 * Combine potty data with activity frequencies
 * @param {Array} pottyData - Transformed 24-hour potty data
 * @param {Array} activities - Activity data for the same period
 * @returns {Array} - Combined dataset with all activity types
 */
export const combineDataWithActivities = (pottyData, activities) => {
  const feedingFrequency = calculateHourlyActivityFrequency(activities, "fed");
  const crateFrequency = calculateHourlyActivityFrequency(activities, "crate");
  const playFrequency = calculateHourlyActivityFrequency(activities, "play");
  const trainingFrequency = calculateHourlyActivityFrequency(activities, "training");

  return pottyData.map((item, index) => ({
    ...item,
    feeding: feedingFrequency[index],
    crate: crateFrequency[index],
    play: playFrequency[index],
    training: trainingFrequency[index]
  }));
};

/**
 * Transform raw data into visualization-ready format
 * @param {Array} rawData - Raw hourly data from API
 * @param {Array} activities - Activity data
 * @param {number} days - Number of days to include (default: 7)
 * @returns {Array} - Complete transformed dataset ready for visualization
 */
export const transformHourlyData = (rawData, activities, days = 7) => {
  // Step 1: Create complete 24-hour potty data
  const completeHourlyData = createComplete24HourData(rawData);
  
  // Step 2: Filter activities to the same time period
  const recentActivities = filterActivitiesByDays(activities, days);
  
  // Step 3: Combine with activity frequencies
  const finalData = combineDataWithActivities(completeHourlyData, recentActivities);
  
  return finalData;
};