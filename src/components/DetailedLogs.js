import React, { useState } from "react";
import { Trash2, Clock, MapPin, MessageSquare } from "lucide-react";

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

const DetailedLogs = ({
  pottyLogs,
  activities,
  onDeletePottyLog,
  onDeleteActivity,
  canDelete = false
}) => {
  // Sort logs and activities by timestamp (newest first)
  const sortedPottyLogs = [...pottyLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Don't render anything if there are no logs
  if (pottyLogs.length === 0 && activities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Potty Logs Card */}
      {pottyLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
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

      {/* Activities Card */}
      {activities.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
  );
};

export default DetailedLogs;