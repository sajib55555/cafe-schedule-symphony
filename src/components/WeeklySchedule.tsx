import React from 'react';
import { ScheduleProvider } from './schedule/ScheduleContext';
import { ScheduleContainer } from './schedule/ScheduleContainer';

export function WeeklySchedule() {
  return (
    <ScheduleProvider>
      <ScheduleContainer />
    </ScheduleProvider>
  );
}