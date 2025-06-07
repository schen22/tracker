import React, { useState } from "react";
import { Trash2, Clock, MapPin, MessageSquare, X } from "lucide-react";

const SummaryCard = ({ title, value, subtitle, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-3 rounded-lg text-center`}>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      <div className={`text-sm ${textColor.replace("600", "800")}`}>
        {subtitle}
      </div>
    </div>
  );
};

const LogItem = ({ item, type, onDelete, canDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (type === "potty") {
      onDelete(item.id);
    } else {
      onDelete(item.id);
    }
    setShowConfirm(false);
  };

  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTypeColor = logType => {
    switch (logType) {
      case "pee":
        return "text-blue-600 bg-blue-50";
      case "poop":
        return "text-green-600 bg-green-50";
      case "accident":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getLocationColor = location => {
    switch (location) {
      case "outside":
        return "text-green-600";
      case "inside":
        return "text-red-600";
      case "crate":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getActivityIcon = activity => {
    if (activity?.includes("Fed")) return "🍽️";
    if (activity?.includes("Play")) return "🎾";
    if (activity?.includes("Training")) return "🎯";
    if (activity?.includes("Crate")) return "🏠";
    if (activity?.includes("Walk")) return "🚶";
    return "📝";
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        {type === "potty" ? (
          <div className="flex items-center gap-3">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                item.type
              )}`}
            >
              {item.type.toUpperCase()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-3 h-3" />
              <span className={getLocationColor(item.location)}>
                {item.location}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              {formatTime(item.timestamp)}
            </div>
            {item.notes && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MessageSquare className="w-3 h-3" />
                <span className="truncate max-w-24">{item.notes}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-lg">{getActivityIcon(item.activity)}</span>
            <div className="text-sm font-medium text-gray-700">
              {item.activity}
            </div>
            {item.duration && (
              <div className="text-sm text-gray-500">({item.duration} min)</div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              {formatTime(item.timestamp)}
            </div>
          </div>
        )}
      </div>

      {canDelete && (
        <div className="flex items-center gap-2">
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const TodaySummary = ({
  pottyLogs,
  activities,
  successRate,
  onDeletePottyLog,
  onDeleteActivity,
  canDelete = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTodaysStats = () => {
    const successfulPees = pottyLogs.filter(
      log => log.type === "pee" && log.location === "outside"
    ).length;
    const successfulPoops = pottyLogs.filter(
      log => log.type === "poop" && log.location === "outside"
    ).length;
    const accidents = pottyLogs.filter(log => log.location === "inside").length;
    const totalEvents = pottyLogs.length;

    const feedingSessions = activities.filter(activity =>
      activity.activity?.includes("Fed")
    ).length;
    const playSessions = activities.filter(activity =>
      activity.activity?.includes("Play")
    ).length;
    const trainingSessions = activities.filter(activity =>
      activity.activity?.includes("Training")
    ).length;
    const crateSessions = activities.filter(activity =>
      activity.activity?.includes("Crate")
    ).length;

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

  const getSuccessRateColor = rate => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessRateBg = rate => {
    if (rate >= 80) return "bg-gradient-to-r from-green-100 to-emerald-100";
    if (rate >= 60) return "bg-gradient-to-r from-yellow-100 to-amber-100";
    return "bg-gradient-to-r from-red-100 to-rose-100";
  };

  // Sort logs and activities by timestamp (newest first)
  const sortedPottyLogs = [...pottyLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Today's Summary</h2>
        {(pottyLogs.length > 0 || activities.length > 0) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        )}
      </div>

      {/* Potty Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SummaryCard
          value={stats.successfulPees}
          subtitle="Successful Pees"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          value={stats.successfulPoops}
          subtitle="Successful Poops"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          value={stats.accidents}
          subtitle="Accidents"
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <SummaryCard
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
            <div className="text-lg font-semibold text-gray-800">
              Potty Success Rate
            </div>
            <div
              className={`text-3xl font-bold ${getSuccessRateColor(
                successRate
              )}`}
            >
              {successRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.successfulPees + stats.successfulPoops} successful out of{" "}
              {stats.totalEvents} attempts
            </div>
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Daily Activities
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.feedingSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
              <span className="text-lg">🍽️</span>
              <div>
                <div className="font-semibold text-orange-700">
                  {stats.feedingSessions}
                </div>
                <div className="text-xs text-orange-600">Feeding Sessions</div>
              </div>
            </div>
          )}

          {stats.playSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
              <span className="text-lg">🎾</span>
              <div>
                <div className="font-semibold text-yellow-700">
                  {stats.playSessions}
                </div>
                <div className="text-xs text-yellow-600">Play Sessions</div>
              </div>
            </div>
          )}

          {stats.trainingSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded">
              <span className="text-lg">🎯</span>
              <div>
                <div className="font-semibold text-indigo-700">
                  {stats.trainingSessions}
                </div>
                <div className="text-xs text-indigo-600">Training Sessions</div>
              </div>
            </div>
          )}

          {stats.crateSessions > 0 && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <span className="text-lg">🏠</span>
              <div>
                <div className="font-semibold text-purple-700">
                  {stats.crateSessions}
                </div>
                <div className="text-xs text-purple-600">Crate Sessions</div>
              </div>
            </div>
          )}
        </div>

        {/* No activities message */}
        {stats.feedingSessions === 0 &&
          stats.playSessions === 0 &&
          stats.trainingSessions === 0 &&
          stats.crateSessions === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">
              No activities logged today
            </div>
          )}
      </div>

      {/* Detailed Logs - Expandable Section */}
      {showDetails && (pottyLogs.length > 0 || activities.length > 0) && (
        <div className="mt-6 border-t pt-4">
          <div className="space-y-4">
            {/* Potty Logs Details */}
            {pottyLogs.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🚽 Potty Logs ({pottyLogs.length})
                  {!canDelete && (
                    <span className="text-xs text-gray-500 font-normal">
                      (View only)
                    </span>
                  )}
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortedPottyLogs.map(log => (
                    <LogItem
                      key={log.id}
                      item={log}
                      type="potty"
                      onDelete={onDeletePottyLog}
                      canDelete={canDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activities Details */}
            {activities.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📋 Activities ({activities.length})
                  {!canDelete && (
                    <span className="text-xs text-gray-500 font-normal">
                      (View only)
                    </span>
                  )}
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortedActivities.map(activity => (
                    <LogItem
                      key={activity.id}
                      item={activity}
                      type="activity"
                      onDelete={onDeleteActivity}
                      canDelete={canDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick insights */}
      {stats.totalEvents > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Quick Insight: </span>
            {successRate >= 80 &&
              "Excellent progress! Your puppy is doing great with potty training."}
            {successRate >= 60 &&
              successRate < 80 &&
              "Good progress! Keep up the consistent routine."}
            {successRate < 60 &&
              "Keep working on the routine. Consistency is key for success."}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalEvents === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-lg mb-2">📝</div>
          <div>No potty events logged for today yet</div>
          <div className="text-sm mt-1">
            Start logging to see your puppy's progress!
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaySummary;
