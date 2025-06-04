import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, Plus, Check, X, Home, Coffee, Trash2, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const PuppyTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [pottyLogs, setPottyLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [puppyAgeWeeks, setPuppyAgeWeeks] = useState(8);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addPottyLog = (type, location = 'outside', notes = '') => {
    const newLog = {
      id: Date.now(),
      type,
      location,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      notes
    };
    setPottyLogs(prev => [newLog, ...prev]);
  };

  const addActivity = (activity, time = null) => {
    const newActivity = {
      id: Date.now(),
      activity,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      completed: true
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const deletePottyLog = (id) => {
    setPottyLogs(prev => prev.filter(log => log.id !== id));
  };

  const deleteActivity = (id) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const getTodaysPottyLogs = () => {
    return pottyLogs.filter(log => log.date === selectedDate);
  };

  const getTodaysActivities = () => {
    return activities.filter(activity => activity.date === selectedDate);
  };

  const getWeeklyMilestones = () => {
    const milestones = {
      8: {
        title: "Week 8-9: Foundation Building",
        goals: [
          "Successfully go potty outside 50% of the time",
          "Comfortable in crate for 1-2 hours during day",
          "Basic socialization with household sounds",
          "Eating solid food 3x daily",
          "Sleep through most of the night (5-6 hours)"
        ],
        tips: "Focus on routine and positive reinforcement. Accidents are normal!"
      },
      10: {
        title: "Week 10-11: Building Confidence",
        goals: [
          "Potty success rate 60-70%",
          "Walk on leash for short distances indoors",
          "Respond to name consistently",
          "Comfortable being alone in crate for 2-3 hours",
          "Basic 'sit' command with treats"
        ],
        tips: "Start basic commands and extend crate time gradually."
      },
      12: {
        title: "Week 12-13: Expanding Skills",
        goals: [
          "Potty success rate 70-80%",
          "Walk outdoors on leash (after vaccinations)",
          "Come when called in secure area",
          "Sleep in crate all night without whining",
          "Basic 'stay' for 5-10 seconds"
        ],
        tips: "Begin controlled outdoor exposure and socialization."
      },
      14: {
        title: "Week 14-15: Socialization Focus",
        goals: [
          "Potty success rate 80-85%",
          "Meet new people calmly",
          "Basic leash walking without excessive pulling",
          "Comfortable with grooming (brushing, nail touching)",
          "Down command with treats"
        ],
        tips: "Critical socialization period - expose to new experiences positively."
      },
      16: {
        title: "Week 16+: Advanced Training",
        goals: [
          "Potty success rate 85-95%",
          "Reliable recall in fenced areas",
          "Wait politely for food",
          "Basic impulse control exercises",
          "Comfortable with car rides"
        ],
        tips: "Focus on consistency and building advanced skills."
      }
    };

    const currentWeek = Math.floor(puppyAgeWeeks / 2) * 2;
    const weekKey = currentWeek >= 16 ? 16 : Math.max(8, currentWeek);
    return milestones[weekKey] || milestones[8];
  };

  const getHourlyTrends = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, '0');
      const pottyEvents = pottyLogs.filter(log => 
        last7Days.includes(log.date) && 
        parseInt(log.time.split(':')[0]) === hour
      );
      
      return {
        hour: `${hourStr}:00`,
        successful: pottyEvents.filter(e => e.location === 'outside').length,
        accidents: pottyEvents.filter(e => e.location === 'inside').length,
        total: pottyEvents.length
      };
    });

    return hourlyData.filter(data => data.total > 0);
  };

  const getSuccessRateTrend = () => {
    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = pottyLogs.filter(log => log.date === dateStr);
      const successfulLogs = dayLogs.filter(log => log.location === 'outside');
      const successRate = dayLogs.length > 0 ? Math.round((successfulLogs.length / dayLogs.length) * 100) : 0;
      
      last14Days.push({
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        successRate,
        total: dayLogs.length
      });
    }
    
    return last14Days.filter(day => day.total > 0);
  };

  const getPottyTypeDistribution = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const recentLogs = pottyLogs.filter(log => last7Days.includes(log.date));
    
    const distribution = [
      { 
        name: 'Successful Pee', 
        value: recentLogs.filter(l => l.type === 'pee' && l.location === 'outside').length,
        color: '#3B82F6'
      },
      { 
        name: 'Successful Poop', 
        value: recentLogs.filter(l => l.type === 'poop' && l.location === 'outside').length,
        color: '#10B981'
      },
      { 
        name: 'Pee Accidents', 
        value: recentLogs.filter(l => l.type === 'pee' && l.location === 'inside').length,
        color: '#F87171'
      },
      { 
        name: 'Poop Accidents', 
        value: recentLogs.filter(l => l.type === 'poop' && l.location === 'inside').length,
        color: '#EF4444'
      }
    ].filter(item => item.value > 0);

    return distribution;
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'potty': return '🚽';
      case 'meal': return '🍽️';
      case 'play': return '🎾';
      case 'crate': return '🏠';
      case 'training': return '🎯';
      case 'social': return '👨‍👩‍👧‍👦';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🐕 Artoo Tracker
        </h1>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
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
              value={puppyAgeWeeks} 
              onChange={(e) => setPuppyAgeWeeks(parseInt(e.target.value))}
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
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Log</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => addPottyLog('pee', 'outside')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              💧 Peed Outside
            </button>
            <button 
              onClick={() => addPottyLog('poop', 'outside')}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              💩 Pooped Outside
            </button>
            <button 
              onClick={() => addPottyLog('pee', 'inside')}
              className="bg-red-400 hover:bg-red-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              💧 Accident (Pee)
            </button>
            <button 
              onClick={() => addPottyLog('poop', 'inside')}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              💩 Accident (Poop)
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
              onClick={() => addActivity('Fed meal')}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              🍽️ Fed
            </button>
            <button 
              onClick={() => addActivity('Crate time')}
              className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              🏠 Crated
            </button>
            <button 
              onClick={() => addActivity('Play session')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              🎾 Played
            </button>
            <button 
              onClick={() => addActivity('Training session')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              🎯 Training
            </button>
          </div>
        </div>

        {/* Today's Potty Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Potty Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getTodaysPottyLogs().filter(log => log.type === 'pee' && log.location === 'outside').length}
              </div>
              <div className="text-sm text-blue-800">Successful Pees</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {getTodaysPottyLogs().filter(log => log.type === 'poop' && log.location === 'outside').length}
              </div>
              <div className="text-sm text-green-800">Successful Poops</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {getTodaysPottyLogs().filter(log => log.location === 'inside').length}
              </div>
              <div className="text-sm text-red-800">Accidents</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">
                {getTodaysPottyLogs().length}
              </div>
              <div className="text-sm text-gray-800">Total Events</div>
            </div>
          </div>
          
          {/* Success Rate */}
          {getTodaysPottyLogs().length > 0 && (
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((getTodaysPottyLogs().filter(log => log.location === 'outside').length / getTodaysPottyLogs().length) * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Milestones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5" />
            {getWeeklyMilestones().title}
          </h2>
          <div className="space-y-3">
            {getWeeklyMilestones().goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="text-sm text-gray-800 flex-1">{goal}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
            💡 {getWeeklyMilestones().tips}
          </div>
        </div>

        {/* Graph Insights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trend Analysis
          </h2>
          
          {/* Success Rate Trend */}
          {getSuccessRateTrend().length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Success Rate Over Time</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={getSuccessRateTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hourly Patterns */}
          {getHourlyTrends().length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Hourly Potty Patterns (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={getHourlyTrends()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="successful" stackId="a" fill="#10B981" name="Successful" />
                  <Bar dataKey="accidents" stackId="a" fill="#EF4444" name="Accidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly Distribution */}
          {getPottyTypeDistribution().length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Weekly Distribution</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={100}>
                  <PieChart>
                    <Pie
                      data={getPottyTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {getPottyTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {getPottyTypeDistribution().map((item, index) => (
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
          )}
          
          {getSuccessRateTrend().length === 0 && getHourlyTrends().length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Start logging activities to see trend analysis
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...getTodaysPottyLogs(), ...getTodaysActivities()]
              .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
              .reverse()
              .slice(0, 10)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded border-l-4 border-l-blue-200 bg-gray-50 hover:bg-gray-100 group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-600">{item.time}</span>
                    <span className="text-sm text-gray-800">
                      {item.type ? 
                        `${item.type === 'pee' ? '💧' : '💩'} ${item.type.toUpperCase()} ${item.location === 'inside' ? '(accident)' : '(success)'}` :
                        `📝 ${item.activity}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.location === 'outside' && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                    {item.location === 'inside' && (
                      <span className="text-red-600 text-sm">⚠</span>
                    )}
                    <button
                      onClick={() => item.type ? deletePottyLog(item.id) : deleteActivity(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {[...getTodaysPottyLogs(), ...getTodaysActivities()].length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No activities logged for this day yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuppyTracker;