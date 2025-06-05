import React, { useState, useEffect } from 'react';
import { DataService } from './services/DataService';
import { InsightsService } from './services/InsightsService';
import { MilestoneService } from './services/MilestoneService';
import { PuppyProfile } from './models/PuppyData';
import QuickActions from './components/QuickActions';
import TodaySummary from './components/TodaySummary';
import TrendAnalysis from './components/TrendAnalysis';

const PuppyTracker = () => {
  const [dataService] = useState(() => new DataService());
  const [insightsService] = useState(() => new InsightsService(dataService));
  const [milestoneService] = useState(() => new MilestoneService());
  const [puppyProfile, setPuppyProfile] = useState(() => new PuppyProfile('Artoo', 8));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer and data refresh logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddPottyLog = (type, location, notes) => {
    dataService.addPottyLog(type, location, notes);
    // Trigger re-render
    setCurrentTime(new Date());
  };

  const handleAddActivity = (activity, time) => {
    dataService.addActivity(activity, time);
    setCurrentTime(new Date());
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🐕 {puppyProfile.name} Tracker
        </h1>
        {/* Date/time controls */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions 
          onAddPottyLog={handleAddPottyLog}
          onAddActivity={handleAddActivity}
        />
        
        <TodaySummary 
          pottyLogs={dataService.getPottyLogsByDate(selectedDate)}
          activities={dataService.getActivitiesByDate(selectedDate)}
          successRate={insightsService.getSuccessRateForDate(selectedDate)}
        />

        <TrendAnalysis 
          insightsService={insightsService}
          selectedDate={selectedDate}
        />
        
        {/* Other components */}
      </div>
    </div>
  );
};

export default PuppyTracker;