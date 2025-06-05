import React from 'react';

const SummaryCard = ({ title, value, subtitle, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-3 rounded-lg text-center`}>
      <div className={`text-2xl font-bold ${textColor}`}>
        {value}
      </div>
      <div className={`text-sm ${textColor.replace('600', '800')}`}>
        {subtitle}
      </div>
    </div>
  );
};

const TodaySummary = ({ pottyLogs, activities, successRate }) => {
  const getTodaysStats = () => {
    const successfulPees = pottyLogs.filter(log => log.type === 'pee' && log.location === 'outside').length;
    const successfulPoops = pottyLogs.filter(log => log.type === 'poop' && log.location === 'outside').length;
    const accidents = pottyLogs.filter(log => log.location === 'inside').length;
    const totalEvents = pottyLogs.length;
    
    const feedingSessions = activities.filter(activity => activity.activity?.includes('Fed')).length;
    const playSessions = activities.filter(activity => activity.activity?.includes('Play')).length;
    const trainingSessions = activities.filter(activity => activity.activity?.includes('Training')).length;
    const crateSessions = activities.filter(activity => activity.activity?.includes('Crate')).length;

    return {
      successfulPees,
      successfulPoops,
      accidents,
      totalEvents,
      feedingSessions,
      playSessions,
      trainingSessions,
      crateSessions
    };
  };

  const stats = getTodaysStats();

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBg = (rate) => {
    if (rate >= 80) return 'bg-gradient-to-r from-green-100 to-emerald-100';
    if (rate >= 60) return 'bg-gradient-to-r from-yellow-100 to-amber-100';
    return 'bg-gradient-to-r from-red-100 to-rose-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Summary</h2>
      
      {/* Potty Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SummaryCard
          title="Successful Pees"
          value={stats.successfulPees}
          subtitle="Successful Pees"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          title="Successful Poops"
          value={stats.successfulPoops}
          subtitle="Successful Poops"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          title="Accidents"
          value={stats.accidents}
          subtitle="Accidents"
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <SummaryCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="Total Events"
          bgColor="bg-gray-50"
          textColor="text-gray-600"
        />
      </div>
      
      {/* Success Rate */}
      {stats.totalEvents > 0 && (
        <div className={`${getSuccessRateBg(successRate)} p-4 rounded-lg mb-6`}>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Potty Success Rate</div>
            <div className={`text-3xl font-bold ${getSuccessRateColor(successRate)}`}>
              {successRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.successfulPees + stats.successfulPoops} successful out of {stats.totalEvents} attempts
            </div>
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Daily Activities</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.feedingSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
              <span className="text-lg">🍽️</span>
              <div>
                <div className="font-semibold text-orange-700">{stats.feedingSessions}</div>
                <div className="text-xs text-orange-600">Feeding Sessions</div>
              </div>
            </div>
          )}
          
          {stats.playSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
              <span className="text-lg">🎾</span>
              <div>
                <div className="font-semibold text-yellow-700">{stats.playSessions}</div>
                <div className="text-xs text-yellow-600">Play Sessions</div>
              </div>
            </div>
          )}
          
          {stats.trainingSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded">
              <span className="text-lg">🎯</span>
              <div>
                <div className="font-semibold text-indigo-700">{stats.trainingSessions}</div>
                <div className="text-xs text-indigo-600">Training Sessions</div>
              </div>
            </div>
          )}
          
          {stats.crateSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <span className="text-lg">🏠</span>
              <div>
                <div className="font-semibold text-purple-700">{stats.crateSessions}</div>
                <div className="text-xs text-purple-600">Crate Sessions</div>
              </div>
            </div>
          )}
        </div>
        
        {/* No activities message */}
        {stats.feedingSessions === 0 && stats.playSessions === 0 && 
         stats.trainingSessions === 0 && stats.crateSessions === 0 && (
          <div className="text-center text-gray-500 py-4 text-sm">
            No activities logged today
          </div>
        )}
      </div>

      {/* Quick insights */}
      {stats.totalEvents > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Quick Insight: </span>
            {successRate >= 80 && "Excellent progress! Your puppy is doing great with potty training."}
            {successRate >= 60 && successRate < 80 && "Good progress! Keep up the consistent routine."}
            {successRate < 60 && "Keep working on the routine. Consistency is key for success."}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalEvents === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-lg mb-2">📝</div>
          <div>No potty events logged for today yet</div>
          <div className="text-sm mt-1">Start logging to see your puppy's progress!</div>
        </div>
      )}
    </div>
  );
};

export default TodaySummary;