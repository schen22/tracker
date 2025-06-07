import React from 'react';
import ReactDOM from 'react-dom/client';
import PuppyTracker from './refactoredTracker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PuppyTracker />
  </React.StrictMode>
);
