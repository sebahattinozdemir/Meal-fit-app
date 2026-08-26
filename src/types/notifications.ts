export interface ReminderSettings {
  enabled: boolean;
  workoutMorning: boolean;
  workoutEvening: boolean;
  weightWeekly: boolean;
  morningHour: number;
  eveningHour: number;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  workoutMorning: true,
  workoutEvening: true,
  weightWeekly: true,
  morningHour: 8,
  eveningHour: 20,
};
