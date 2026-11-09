export enum WorkingHoursDay {
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
}

export interface WorkingHoursEntry {
  day: WorkingHoursDay;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
