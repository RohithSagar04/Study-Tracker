export type Priority = "high" | "medium" | "low";

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  priority: Priority | null;
  total_days: number;
  daily_time_minutes: number;
  start_date: string;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  title: string;
  assigned_date: string;
  is_done: boolean;
  done_at: string | null;
  sort_order: number;
}

export interface Settings {
  id: string;
  user_id: string;
  reminder_time: string;
  daily_study_minutes: number;
  timezone: string;
  last_reminder_sent_at: string | null;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  created_at: string;
}

export interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

export interface DaySchedule {
  date: string;
  topics: string[];
}
