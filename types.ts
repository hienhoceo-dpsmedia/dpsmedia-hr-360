// Core Staff Entity
export type Role = 'admin' | 'staff';

export interface StaffInfo {
  id: string;
  name: string;
  lark_email: string; // Used for joining
  ms_id: string;
  department: 'Product' | 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Board';
  active: boolean;
  role: Role; // New: Permission level
  avatarUrl?: string;
}

// Data Sources (Matches Supabase Table Concepts)
export interface TotalTaskDone {
  email: string; // Join key
  task_name: string;
  completed_date: string;
  is_done: boolean;
}

export interface LifeLongLearning {
  email: string; // Join key
  learning_points: number;
  training_points: number;
  creative_points: number;
  date: string;
}

export interface TeamsChatActivity {
  email: string; // Join key
  chat_count: number;
  meeting_count: number;
  hello_hub_posts: number;
  lab_ideas: number;
  reply_messages: number;
  date: string;
}

export interface PresenceLog {
  name: string; // Join key (sometimes names are used instead of emails)
  available_minutes: number;
  date: string;
}

export interface RawPresenceLog {
  LARK_MAIL: string;
  "DATE TIME": string; // Space in column name
  activity: string;
  MS_id?: string;
  NAME?: string;
}

// Historical Data Point for Line Charts
export interface HistoryPoint {
  month: string;
  cat_a: number;
  cat_p: number;
  cat_q: number;
}

export interface DailyPresence {
  date: string;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4; // 0: None, 4: High
}

export interface ActivityHeatmapPoint {
  dayIndex: number; // 0-6 (Mon-Sun)
  hour: number; // 0-23
  value: number; // Activity count
}

export interface Kudos {
  id: string;
  fromName: string;
  fromAvatar: string;
  toEmail: string;
  message: string;
  date: string;
  category: 'Helpful' | 'Creative' | 'Teamwork';
}

// Rank Score Breakdown (13 Metrics)
export interface RankScoreBreakdown {
  tasks: number;
  meetings: number;
  weeklyMeetings: number;
  minutes: number;
  learning: number;
  creative: number;
  training: number;
  helloHub: number;
  hallOfFame: number;
  innovation: number;
  teamChat: number;
  privateChat: number;
  replies: number;
  mostFavorite: number;
  mostInfluential: number;
}

// Aggregated Metrics for Dashboard
export interface AggregatedMetrics {
  staffId: string;
  staffName: string;
  department: string;
  avatarUrl?: string;

  // New Rank-Based Scoring
  total_rank_score: number;
  rank_score_breakdown: RankScoreBreakdown;

  // Category A: Availability (DEPRECATED)
  cat_a_score: number;
  available_minutes: number;
  weekly_meeting_attendance: number; // Total meetings
  weekly_meeting_count: number; // Tuesday meetings >= 80%
  daily_presence: DailyPresence[];
  activity_heatmap: ActivityHeatmapPoint[]; // New 2D Heatmap Data

  // Category P: Performance (DEPRECATED)
  cat_p_score: number;
  total_tasks_done: number;
  private_messages: number;
  team_chat: number;
  private_chat: number;
  reply_messages: number;
  total_messages: number;

  // Category Q: Quality (DEPRECATED)
  cat_q_score: number;
  learning_points: number;
  creative_points: number; // Innovation Lab / Creative points
  training_points: number; // Disciplinary / Training points
  hello_hub: number;
  hall_of_fame: number;
  innovation_lab_ideas: number;
  salary: number; // For admin comparison/overview

  // Assessment Metrics
  mostFavorite: number;
  mostInfluential: number;

  // Growth Metrics (Month over Month)
  mom_growth_a: number;
  mom_growth_p: number;
  mom_growth_q: number;

  // Empowerment Context
  percentile_rank: number; // e.g., 90 means top 10%
  next_level_target: {
    metric: string;
    current: number;
    target: number;
    message: string;
  };

  // Historical Data
  history: HistoryPoint[];

  // Meta
  period: string;
}

export type ViewMode = 'my_dashboard' | 'individual' | 'comparison' | 'leaderboard' | 'global_ranking';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Vite Environment Types
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
