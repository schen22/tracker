import React, { useState, useEffect } from 'react';
import DataService from './services/DataService';
import { InsightsService } from './services/InsightsService';
import { MilestoneService } from './services/MilestoneService';
import { PuppyProfile } from './models/PuppyData';
import QuickActions from './components/QuickActions';
import TodaySummary from './components/TodaySummary';
import TrendAnalysis from './components/TrendAnalysis';
import MilestoneCard from './components/MilestoneCard';
import { Clock, Calendar, Cake, Target, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const PuppyTracker = () => {
  // Services - initialized once
  const [dataService] = useState(() => new DataService());
  const [insightsService, setInsightsService] = useState(() => new InsightsService(dataService));
  const [milestoneService] = useState(() => new MilestoneService());
  
  // Puppy profile state
  const [puppyProfile, setPuppyProfile] = useState(() => {
    const birthDate = new Date(2025, 3, 14).toISOString();
    const ageWeeks = DataService.prototype.calculateAgeWeeks.call({}, birthDate);
    return new PuppyProfile('Artoo', ageWeeks);
  });
  
  // UI state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data service state - synced with service
  const [connectionStatus, setConnectionStatus] = useState(dataService.getConnectionStatus());
  const [data, setData] = useState(dataService.getData());
  const [isLoading, setIsLoading] = useState(dataService.getLoadingState());
  const [error, setError] = useState(dataService.getError());
  const [lastRefresh, setLastRefresh] = useState(dataService.getLastRefresh());

  // Timer for current time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Set up data service listeners
  useEffect(() => {
    const handleConnectionChange = (status) => {
      console.log('Connection status changed:', status);
      setConnectionStatus(status);
    };
    
    const handleDataChange = (newData) => {
      console.log('Data changed: ', newData);
      setData(newData);
      setInsightsService(new InsightsService(dataService));
      // note: data doesn't update in offline mode>>>???
      console.log('Updated data: ', data);
      console.log('Updated potty logs: ', data.pottyLogs);
      console.log('Updated activities: ', data.activities);
    };
    
    const handleLoadingChange = (loading) => {
      console.log('Loading state changed:', loading);
      setIsLoading(loading);
    };
    
    const handleErrorChange = (err) => {
      console.log('Error state changed:', err);
      setError(err);
    };

    // Register event listeners
    dataService.on('connectionChange', handleConnectionChange);
    dataService.on('dataChange', handleDataChange);
    dataService.on('loadingChange', handleLoadingChange);
    dataService.on('errorChange', handleErrorChange);

    // Cleanup listeners on unmount
    return () => {
      dataService.off('connectionChange', handleConnectionChange);
      dataService.off('dataChange', handleDataChange);
      dataService.off('loadingChange', handleLoadingChange);
      dataService.off('errorChange', handleErrorChange);
      dataService.destroy();
    };
  }, [dataService]);

  // Event handlers
  const handleAddPottyLog = async (type, location, notes) => {
    const success = await dataService.addPottyLog(type, location, notes);
    if (success) {
      setCurrentTime(new Date()); // Trigger re-render for UI updates
    }
  };

  const handleAddActivity = async (activity, duration) => {
    const success = await dataService.addActivity(activity, duration);
    if (success) {
      setCurrentTime(new Date()); // Trigger re-render for UI updates
    }
  };

  const handleDeletePottyLog = async (logId) => {
    const success = await dataService.deletePottyLog(logId);
    if (success) {
      setCurrentTime(new Date());
    }
  };

  const handleDeleteActivity = async (activityId) => {
    const success = await dataService.deleteActivity(activityId);
    if (success) {
      setCurrentTime(new Date());
    }
  };

  const handleRefreshData = () => {
    dataService.loadData();
    setLastRefresh(new Date());
  };

  const handleClearError = () => {
    dataService.clearError();
  };

  const handleRetryConnection = () => {
    dataService.checkConnection();
  };

  // Computed values using the service methods
  const filteredPottyLogs = dataService.getPottyLogsByDate(selectedDate);
  const filteredActivities = dataService.getActivitiesByDate(selectedDate);
  const successRate = dataService.calculateSuccessRateForDate(selectedDate);

  // Update puppy age when profile changes
  const handleAgeChange = (newAge) => {
    setPuppyProfile(new PuppyProfile('Artoo', parseInt(newAge)));
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
                <button 
                  onClick={handleRetryConnection}
                  className="ml-2 px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs"
                  disabled={connectionStatus.checking}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 flex-1">{error}</span>
            <button 
              onClick={handleClearError}
              className="ml-auto text-red-600 hover:text-red-800 px-2 py-1"
              title="Clear error"
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

        {/* Offline Mode Notice */}
        {!connectionStatus.connected && !connectionStatus.checking && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700">
              Running in offline mode. Data will not be saved to GitHub.
            </span>
          </div>
        )}

        {/* Date/time controls */}
        <div className="flex items-center gap-4 text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <Cake className="w-4 h-4" />
            <span className="text-md">04/14/2025, </span>
            <span className="text-md">{puppyProfile.ageWeeks}</span>
            <span className="text-md"> weeks old</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" title="Selected Date"/>
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
              onChange={(e) => handleAgeChange(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 17 }, (_, i) => i + 8).map(week => (
                <option key={week} value={week}>{week} weeks old</option>
              ))}
            </select>
          </div>
          
          {lastRefresh && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Last sync: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <button 
                onClick={handleRefreshData}
                className="ml-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MilestoneCard
          title={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).title}
          goals={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).goals}
          tips={milestoneService.getMilestoneForWeek(puppyProfile.ageWeeks).tips}
        />

        <QuickActions 
          onAddPottyLog={handleAddPottyLog}
          onAddActivity={handleAddActivity}
          disabled={isLoading}
        />
        
        <TodaySummary 
          pottyLogs={filteredPottyLogs}
          activities={filteredActivities}
          successRate={successRate}
          onDeletePottyLog={handleDeletePottyLog}
          onDeleteActivity={handleDeleteActivity}
          canDelete={connectionStatus.connected || !connectionStatus.checking}
        />

        <TrendAnalysis 
          insightsService={insightsService}
          selectedDate={selectedDate}
          pottyLogs={data.pottyLogs}
          activities={data.activities}
        />
      </div>
    </div>
  );
};

export default PuppyTracker;