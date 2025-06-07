import React, { useState, useEffect } from 'react';
import { TrackerService } from './services/TrackerService';
import { InsightsService } from './services/InsightsService';
import { MilestoneService } from './services/MilestoneService';
import { PuppyProfile } from './models/PuppyData';
import QuickActions from './components/QuickActions';
import TodaySummary from './components/TodaySummary';
import TrendAnalysis from './components/TrendAnalysis';
import MilestoneCard from './components/MilestoneCard';
import { Clock, Calendar, Cake, Target } from 'lucide-react';

const PuppyTracker = () => {
  const [trackerService] = useState(() => new TrackerService());
  const [insightsService] = useState(() => new InsightsService(trackerService));
  const [milestoneService] = useState(() => new MilestoneService());
  // annoyingly js Date object uses zero-based indexing
  // anyways: hack hard-coded birthdate for now
  const [puppyProfile, setPuppyProfile] = useState(() => new PuppyProfile('Artoo', trackerService.calculateAgeWeeks(new Date(2025, 3, 14).toISOString())));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // GitHub connection status
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, checking: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state
  const [pottyLogs, setPottyLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Timer for current time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check GitHub connection on mount
  useEffect(() => {
    checkGitHubConnection();
    loadData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshTimer);
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const status = await trackerService.checkConnection();
      setConnectionStatus({ ...status, checking: false });
    } catch (error) {
      setConnectionStatus({ connected: false, checking: false, error: error.message });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await trackerService.getCachedData();
      setPottyLogs(data.pottyLogs || []);
      setActivities(data.activities || []);
      setLastRefresh(new Date());
    } catch (error) {
      setError('Failed to load data from GitHub');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPottyLog = async (type, location, notes) => {
    setIsLoading(true);
    try {
      const success = await trackerService.addPottyLog(type, location, notes);
      if (success) {
        await loadData(); // Refresh data after successful save
        setCurrentTime(new Date()); // Trigger re-render
      } else {
        setError('Failed to save potty log');
      }
    } catch (error) {
      setError('Error saving potty log');
      console.error('Error adding potty log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async (activity, time) => {
    setIsLoading(true);
    try {
      const success = await trackerService.addActivity(activity, time);
      if (success) {
        await loadData(); // Refresh data after successful save
        setCurrentTime(new Date()); // Trigger re-render
      } else {
        setError('Failed to save activity');
      }
    } catch (error) {
      setError('Error saving activity');
      console.error('Error adding activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredPottyLogs = () => {
    return pottyLogs.filter(log => 
      log.timestamp.startsWith(selectedDate)
    );
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => 
      activity.timestamp.startsWith(selectedDate)
    );
  };

  const calculateSuccessRate = () => {
    const todayLogs = getFilteredPottyLogs();
    if (todayLogs.length === 0) return 0;
    
    const successfulLogs = todayLogs.filter(log => 
      log.location === 'outside' && (log.type === 'pee' || log.type === 'poop')
    );
    
    return Math.round((successfulLogs.length / todayLogs.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🐕 {puppyProfile.name} Tracker
          </h1>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus.checking ? (
              <div className="flex items-center gap-1 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                <span className="text-sm">Checking...</span>
              </div>
            ) : connectionStatus.connected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
                {connectionStatus.remaining && (
                  <span className="text-xs text-gray-500">
                    ({connectionStatus.remaining} API calls left)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
            <span className="text-blue-700">Syncing with GitHub...</span>
          </div>
        )}

        {/* Date/time controls */}
        <div className="flex items-center gap-4 text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <Cake className="w-4 h-4" />
            <span className="text-md font-small">04/14/2025, </span>
            <span className="text-md font-small">{trackerService.calculateAgeWeeks(new Date(2025, 3, 14).toISOString())}</span>
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
                // hacking - recreate puppy profile to save state
                setPuppyProfile(new PuppyProfile('Artoo', parseInt(e.target.value)))
              }
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 17 }, (_, i) => i + 8).map(week => (
                <option key={week} value={week}>{week} weeks old</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            Last sync: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <button 
              onClick={loadData}
              className="ml-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
              disabled={isLoading}
            >
              Refresh
            </button>
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
          disabled={isLoading || !connectionStatus.connected}
        />
        
        <TodaySummary 
          pottyLogs={getFilteredPottyLogs()}
          activities={getFilteredActivities()}
          successRate={calculateSuccessRate()}
        />

        <TrendAnalysis 
          insightsService={insightsService}
          selectedDate={selectedDate}
          pottyLogs={pottyLogs}
          activities={activities}
        />
      </div>
    </div>
  );
};

export default PuppyTracker;