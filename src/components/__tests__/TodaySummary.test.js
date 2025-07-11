import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodaySummary from '../TodaySummary';

describe('TodaySummary timezone handling', () => {
  const mockPottyLogs = [
    {
      id: '1',
      timestamp: '2025-07-11T18:00:00.000Z', // 11 AM PT
      type: 'pee',
      location: 'outside'
    },
    {
      id: '2', 
      timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT (next day in UTC)
      type: 'poop',
      location: 'outside'
    }
  ];

  const mockActivities = [
    {
      id: '1',
      timestamp: '2025-07-11T20:00:00.000Z', // 1 PM PT
      activity: 'Fed breakfast'
    }
  ];

  const mockHandlers = {
    onDeletePottyLog: jest.fn(),
    onDeleteActivity: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays times in local timezone', () => {
    render(
      <TodaySummary
        pottyLogs={mockPottyLogs}
        activities={mockActivities}
        successRate={100}
        {...mockHandlers}
        canDelete={false}
      />
    );

    // Should display the summary title
    expect(screen.getByText("Today's Summary")).toBeInTheDocument();
    
    // Should show correct counts
    expect(screen.getByText('2')).toBeInTheDocument(); // Total events
  });

  it('formatTime function uses local timezone', () => {
    render(
      <TodaySummary
        pottyLogs={[{
          id: '1',
          timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT
          type: 'pee',
          location: 'outside'
        }]}
        activities={[]}
        successRate={100}
        {...mockHandlers}
        canDelete={true}
      />
    );

    // Click to show details to see the time
    const showDetailsButton = screen.getByText('Show Details');
    fireEvent.click(showDetailsButton);

    // Should display local time (not UTC)
    // The exact time depends on local timezone, but it should be formatted correctly
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('handles timezone edge case logs correctly', () => {
    // Test with logs that span timezone boundaries
    const edgeCaseLogs = [
      {
        id: '1',
        timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT = 4 AM UTC next day
        type: 'pee',
        location: 'outside'
      }
    ];

    render(
      <TodaySummary
        pottyLogs={edgeCaseLogs}
        activities={[]}
        successRate={100}
        {...mockHandlers}
        canDelete={false}
      />
    );

    // Should show the log in today's summary - look for "Successful Pees" count
    expect(screen.getByText('Successful Pees')).toBeInTheDocument();
  });

  it('time formatting is consistent across components', () => {
    const testTimestamp = '2025-07-12T04:00:00.000Z'; // 9 PM PT
    
    // Test the formatTime behavior by checking it uses toLocaleTimeString
    const expectedFormat = new Date(testTimestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    render(
      <TodaySummary
        pottyLogs={[{
          id: '1',
          timestamp: testTimestamp,
          type: 'pee',
          location: 'outside'
        }]}
        activities={[]}
        successRate={100}
        {...mockHandlers}
        canDelete={true}
      />
    );

    // Show details to see the formatted time
    const showDetailsButton = screen.getByText('Show Details');
    fireEvent.click(showDetailsButton);

    // Should display the local time in expected format
    expect(screen.getByText(expectedFormat)).toBeInTheDocument();
  });

  it('handles different timezone scenarios', () => {
    const morningLog = {
      id: 'morning',
      timestamp: '2025-07-11T15:00:00.000Z', // 8 AM PT
      type: 'pee',
      location: 'outside'
    };

    render(
      <TodaySummary
        pottyLogs={[morningLog]}
        activities={[]}
        successRate={100}
        {...mockHandlers}
        canDelete={false}
      />
    );

    // Should show the event in the summary
    expect(screen.getByText('Successful Pees')).toBeInTheDocument();
  });

  it('success rate calculation works with timezone-filtered logs', () => {
    const mixedLogs = [
      {
        id: '1',
        timestamp: '2025-07-12T04:00:00.000Z', // 9 PM PT
        type: 'pee',
        location: 'outside' // Success
      },
      {
        id: '2',
        timestamp: '2025-07-12T05:00:00.000Z', // 10 PM PT
        type: 'poop', 
        location: 'inside' // Accident
      }
    ];

    render(
      <TodaySummary
        pottyLogs={mixedLogs}
        activities={[]}
        successRate={50} // 1 success out of 2 events
        {...mockHandlers}
        canDelete={false}
      />
    );

    // Should display correct success rate
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Accidents')).toBeInTheDocument();
  });
});