import React from 'react';

/**
 * NighttimeControls Component
 * 
 * Provides UI controls for configuring nighttime exclusion in pattern analysis
 */
const NighttimeControls = ({
  excludeNighttime,
  nighttimeStart,
  nighttimeEnd,
  onExcludeNighttimeChange,
  onNighttimeStartChange,
  onNighttimeEndChange
}) => {
  return (
    <div className="flex items-center gap-3 text-xs">
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={excludeNighttime}
          onChange={(e) => onExcludeNighttimeChange(e.target.checked)}
          className="rounded"
        />
        <span className="text-gray-600">Exclude nighttime</span>
      </label>
      
      {excludeNighttime && (
        <div className="flex items-center gap-1">
          <select
            value={nighttimeStart}
            onChange={(e) => onNighttimeStartChange(parseInt(e.target.value))}
            className="border rounded px-1 py-0.5 text-xs"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <span className="text-gray-500">to</span>
          <select
            value={nighttimeEnd}
            onChange={(e) => onNighttimeEndChange(parseInt(e.target.value))}
            className="border rounded px-1 py-0.5 text-xs"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default NighttimeControls;