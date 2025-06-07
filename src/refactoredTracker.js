import React, { useState, useEffect } from 'react';
import { DataService } from './services/DataService';
import { InsightsService } from './services/InsightsService';
import { MilestoneService } from './services/MilestoneService';
import { PuppyProfile } from './models/PuppyData';
import QuickActions from './components/QuickActions';
import TodaySummary from './components/TodaySummary';
import TrendAnalysis from './components/TrendAnalysis';
import MilestoneCard from './components/MilestoneCard';
import { Clock, Calendar, Cake, Target } from 'lucide-react';

const PuppyTracker = () => {
  const [dataService] = useState(() => new DataService());
  const [insightsService] = useState(() => new InsightsService(dataService));
  const [milestoneService] = useState(() => new MilestoneService());
  // annoyingly js Date object uses zero-based indexing
  // anyways: hack hard-coded birthdate for now
  const [puppyProfile, setPuppyProfile] = useState(() => new PuppyProfile('Artoo', dataService.calculateAgeWeeks(new Date(2025, 3, 14).toISOString())));
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
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Cake className="w-4 h-4" />
            <span className="text-md font-small">04/14/2025, </span>
            <span className="text-md font-small">{dataService.calculateAgeWeeks(new Date(2025, 3, 14).toISOString())}</span>
            <span className="text-md font-small"> weeks old</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" title="selectedDate"/>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <select
              value={puppyProfile.ageWeeks}
              onChange={(e) => 
                // hacking; override previously created profile to save state
                setPuppyProfile(new PuppyProfile('Artoo', parseInt(e.target.value)))
              }
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 17 }, (_, i) => i + 8).map(week => (
                <option key={week} value={week}>{week} weeks old</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <MilestoneCard
          title={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).title}
          goals={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).goals}
          tips={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).tips}
        />

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

      </div>
    </div>
  );
};

export default PuppyTracker;