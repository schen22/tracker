import React from 'react';

const QuickActions = ({ onAddPottyLog, onAddActivity, disabled }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Log</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* Potty buttons */}
        <button 
          onClick={() => onAddPottyLog('pee', 'outside')}
          disabled={disabled}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💧 Peed Outside
        </button>
        <button 
          onClick={() => onAddPottyLog('poop', 'outside')}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💩 Pooped Outside
        </button>
        <button 
          onClick={() => onAddPottyLog('pee', 'inside')}
          disabled={disabled}
          className="bg-red-400 hover:bg-red-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💧 Accident (Pee)
        </button>
        <button 
          onClick={() => onAddPottyLog('poop', 'inside')}
          disabled={disabled}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💩 Accident (Poop)
        </button>
        <button 
          onClick={() => onAddActivity('Fed meal')}
          disabled={disabled}
          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🍽️ Fed
        </button>
        <button 
          onClick={() => onAddActivity('Crate time')}
          disabled={disabled}
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🏠 Crated
        </button>
        <button 
          onClick={() => onAddActivity('Play session')}
          disabled={disabled}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎾 Played
        </button>
        <button 
          onClick={() => onAddActivity('Training session')}
          disabled={disabled}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎯 Training
        </button>
      </div>
    </div>
  );
};

export default QuickActions;