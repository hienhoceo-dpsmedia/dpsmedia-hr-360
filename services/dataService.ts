import { supabase } from './supabaseClient';
import { AggregatedMetrics, DateRange, StaffInfo, Kudos, HistoryPoint, DailyPresence, ActivityHeatmapPoint } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

// HELPER: Identity Resolution (Case Insensitive)
const normalize = (str: string) => str.trim().toLowerCase();

export const fetchCurrentUser = async (): Promise<StaffInfo> => {
  // In production, this would use supabase.auth.getUser()
  const { data, error } = await supabase
    .from('hr_staff_info')
    .select('*')
    .eq('ACTIVE', true)
    .limit(1)
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.NAME,
    lark_email: data.LARK_MAIL,
    ms_id: data.MS_ID,
    department: data.DEPARTMENT,
    active: data.ACTIVE,
    role: 'admin'
  } as StaffInfo;
};

export const fetchStaffList = async (): Promise<StaffInfo[]> => {
  const { data, error } = await supabase
    .from('hr_staff_info')
    .select('*')
    .eq('ACTIVE', true)
    .order('NAME');

  if (error) throw error;
  return data.map((d: any) => ({
    id: d.id,
    name: d.NAME,
    lark_email: d.LARK_MAIL,
    ms_id: d.MS_ID,
    department: d.DEPARTMENT,
    active: d.ACTIVE,
    role: 'staff'
  })) as StaffInfo[];
};

export const fetchAggregatedMetrics = async (range: DateRange): Promise<AggregatedMetrics[]> => {
  const startDateStr = format(range.startDate, 'yyyy-MM-dd');
  const endDateStr = format(range.endDate, 'yyyy-MM-dd');

  // Fetch consolidated data from our SQL View
  const { data: reportData, error: reportError } = await supabase
    .from('hr_full_report')
    .select('*')
    .gte('activity_date', startDateStr)
    .lte('activity_date', endDateStr);

  if (reportError) throw reportError;

  const staffList = await fetchStaffList();

  return staffList.map(staff => {
    const staffEmail = normalize(staff.lark_email);
    const staffReport = reportData?.filter(r => normalize(r.lark_email) === staffEmail) || [];

    // Aggregates
    const totalTasks = staffReport.reduce((sum, r) => sum + (r.tasks_done || 0), 0);
    const totalMeetings = staffReport.reduce((sum, r) => sum + (r.meeting_count || 0), 0);
    const totalWeeklyMeetings = staffReport.reduce((sum, r) => sum + (r.weekly_meeting_count || 0), 0);
    const totalMinutes = staffReport.reduce((sum, r) => sum + (r.available_minutes || 0), 0);
    const totalLearning = staffReport.reduce((sum, r) => sum + (r.learning_points || 0), 0);
    const totalCreative = staffReport.reduce((sum, r) => sum + (r.creative_points || 0), 0);
    const totalTraining = staffReport.reduce((sum, r) => sum + (r.training_points || 0), 0);
    const totalHelloHub = staffReport.reduce((sum, r) => sum + (r.hello_hub || 0), 0);
    const totalHallOfFame = staffReport.reduce((sum, r) => sum + (r.hall_of_fame || 0), 0);
    const totalTeamChats = staffReport.reduce((sum, r) => sum + (r.team_chat || 0), 0);
    const totalPrivateChats = staffReport.reduce((sum, r) => sum + (r.private_chat || 0), 0);
    const totalReplies = staffReport.reduce((sum, r) => sum + (r.reply_messages || 0), 0);
    const totalInnovation = staffReport.reduce((sum, r) => sum + (r.innovation_lab || 0), 0);
    const totalSalary = staffReport.reduce((sum, r) => sum + (r.salary || 0), 0);
    const totalMessages = totalTeamChats + totalPrivateChats + totalReplies;

    // Calculate dynamic targets based on date range duration
    const diffTime = Math.abs(range.endDate.getTime() - range.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    // Assume a standard month has 22 work days
    const scale = Math.max(0.05, diffDays / 22);

    // Dynamic targets
    const targetMinutes = 8000 * scale;
    const targetWeeklyMeetings = 4 * scale;
    const targetTasks = 40 * scale;
    const targetMessages = 500 * scale;
    const targetMeetings = 10 * scale;
    const targetGrowth = 30 * scale; // For Q
    const targetCulture = 10 * scale; // For Q

    // Scoring Logic (Balanced Model)
    // Category A: Presence (70%) + Critical Meetings (30%)
    const scoreA = Math.min(100, Math.round(
      (totalMinutes / targetMinutes * 70) +
      (totalWeeklyMeetings / targetWeeklyMeetings * 30)
    ));

    // Category P: Tasks (50%) + Communication (30%) + Engagement (20%)
    const scoreP = Math.min(100, Math.round(
      (totalTasks / targetTasks * 50) +
      (totalMessages / targetMessages * 30) +
      (totalMeetings / targetMeetings * 20)
    ));

    // Category Q: Growth (40%) + Innovation (40%) + Culture (20%)
    const scoreQ = Math.min(100, Math.round(
      ((totalLearning + totalTraining) / targetGrowth * 40) +
      ((totalInnovation * 10 + totalCreative) / targetGrowth * 40) +
      ((totalHelloHub + totalHallOfFame) / targetCulture * 20)
    ));

    // Generate Daily Presence (Heatmap)
    const dailyPresence: DailyPresence[] = eachDayOfInterval({ start: range.startDate, end: range.endDate }).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayData = staffReport.find(r => r.activity_date === dayStr);
      const mins = dayData?.available_minutes || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (mins > 0) level = 1;
      if (mins > 120) level = 2;
      if (mins > 300) level = 3;
      if (mins > 480) level = 4;
      return { date: dayStr, minutes: mins, level };
    });

    // Generate Activity Heatmap (Hourly - Simulated distribution for now)
    const activityHeatmap: ActivityHeatmapPoint[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const d = new Date();
        d.setHours(hour);
        const dayMatch = ((d.getDay() + 6) % 7) === day;

        let value = 0;
        if (hour >= 9 && hour <= 18 && dayMatch) {
          // Give some base activity if they have tasks/chats
          value = (totalTasks + totalTeamChats) > 0 ? Math.floor(Math.random() * 5) : 0;
        }

        activityHeatmap.push({ dayIndex: day, hour: hour, value });
      }
    }

    return {
      staffId: staff.id,
      staffName: staff.name,
      department: staff.department,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=00d26a&color=fff&bold=true`,
      cat_a_score: scoreA,
      available_minutes: Math.round(totalMinutes),
      weekly_meeting_attendance: totalMeetings,
      weekly_meeting_count: totalWeeklyMeetings,
      daily_presence: dailyPresence,
      activity_heatmap: activityHeatmap,
      cat_p_score: scoreP,
      total_tasks_done: totalTasks,
      private_messages: totalPrivateChats,
      team_chat: totalTeamChats,
      private_chat: totalPrivateChats,
      reply_messages: totalReplies,
      total_messages: totalMessages,
      cat_q_score: scoreQ,
      learning_points: totalLearning,
      creative_points: totalCreative,
      training_points: totalTraining,
      hello_hub: totalHelloHub,
      hall_of_fame: totalHallOfFame,
      innovation_lab_ideas: totalInnovation,
      salary: totalSalary,
      mom_growth_a: 0,
      mom_growth_p: 0,
      mom_growth_q: 0,
      percentile_rank: 0,
      next_level_target: { metric: 'Tasks', current: totalTasks, target: 200, message: 'Keep pushing!' },
      history: [],
      period: format(range.startDate, 'MMM yyyy')
    };
  });
};

export const fetchKudos = async (email: string): Promise<Kudos[]> => {
  // Mock for now until kudos table exists
  return [];
};