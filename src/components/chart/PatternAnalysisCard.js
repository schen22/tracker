import React from 'react';

/**
 * PatternAnalysisCard Component
 * 
 * Displays pattern analysis results in a styled card format
 */
const PatternAnalysisCard = ({ patterns }) => {
  if (!patterns || patterns.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
        🔍 Pattern Analysis
        <span className="text-xs font-normal text-blue-600">
          (Last 7 Days)
        </span>
      </h4>
      <div className="space-y-1">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className="text-sm text-blue-700 flex items-start gap-2"
          >
            <span className="text-blue-400 mt-1">•</span>
            <span>{pattern}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-blue-600">
        💡 <strong>Tip:</strong> Click legend items to hide/show lines for
        better pattern visibility
      </div>
    </div>
  );
};

export default PatternAnalysisCard;