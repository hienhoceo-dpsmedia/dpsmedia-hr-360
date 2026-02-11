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

  // FETCH CUMULATIVE Q: Get all Q-related metrics from start of time until range.endDate
  // This ensures "Life-long learning" and "Creative" points are cumulative.
  const { data: cumulativeQData, error: qError } = await supabase
    .from('hr_full_report')
    .select('lark_email, learning_points, creative_points, training_points, hello_hub, hall_of_fame, innovation_lab')
    .lte('activity_date', endDateStr);

  if (reportError) throw reportError;
  if (qError) throw qError;

  const staffList = await fetchStaffList();

  // 1. Calculate raw totals for each staff member
  const rawData = staffList.map(staff => {
    const staffEmail = normalize(staff.lark_email);
    const staffReport = reportData?.filter(r => normalize(r.lark_email) === staffEmail) || [];
    const staffCumQ = cumulativeQData?.filter(r => normalize(r.lark_email) === staffEmail) || [];

    return {
      staff,
      report: staffReport,
      totals: {
        tasks: staffReport.reduce((sum, r) => sum + (r.tasks_done || 0), 0),
        meetings: staffReport.reduce((sum, r) => sum + (r.meeting_count || 0), 0),
        weeklyMeetings: staffReport.reduce((sum, r) => sum + (r.weekly_meeting_count || 0), 0),
        minutes: staffReport.reduce((sum, r) => sum + (r.available_minutes || 0), 0),

        // Category Q is Cumulative
        learning: staffCumQ.reduce((sum, r) => sum + (r.learning_points || 0), 0),
        creative: staffCumQ.reduce((sum, r) => sum + (r.creative_points || 0), 0),
        training: staffCumQ.reduce((sum, r) => sum + (r.training_points || 0), 0),
        helloHub: staffCumQ.reduce((sum, r) => sum + (r.hello_hub || 0), 0),
        hallOfFame: staffCumQ.reduce((sum, r) => sum + (r.hall_of_fame || 0), 0),
        innovation: staffCumQ.reduce((sum, r) => sum + (r.innovation_lab || 0), 0),

        teamChat: staffReport.reduce((sum, r) => sum + (r.team_chat || 0), 0),
        privateChat: staffReport.reduce((sum, r) => sum + (r.private_chat || 0), 0),
        replies: staffReport.reduce((sum, r) => sum + (r.reply_messages || 0), 0),
        messages: 0 // placeholder
      }
    };
  });

  rawData.forEach(item => {
    item.totals.messages = item.totals.teamChat + item.totals.privateChat + item.totals.replies;
  });

  // 2. Calculate Company-Wide Averages
  const n = rawData.length || 1;
  const companyAvg = {
    minutes: rawData.reduce((sum, d) => sum + d.totals.minutes, 0) / n,
    weeklyMeetings: rawData.reduce((sum, d) => sum + d.totals.weeklyMeetings, 0) / n,
    tasks: rawData.reduce((sum, d) => sum + d.totals.tasks, 0) / n,
    messages: rawData.reduce((sum, d) => sum + d.totals.messages, 0) / n,
    meetings: rawData.reduce((sum, d) => sum + d.totals.meetings, 0) / n,
    growth: rawData.reduce((sum, d) => sum + (d.totals.learning + d.totals.training), 0) / n,
    innovation: rawData.reduce((sum, d) => sum + (d.totals.innovation * 10 + d.totals.creative), 0) / n,
    culture: rawData.reduce((sum, d) => sum + (d.totals.helloHub + d.totals.hallOfFame), 0) / n,
  };

  // Helper to calculate 1-5 score: (Value / Avg) * 3, capped at 5
  const calcRelativeScore = (val: number, avg: number) => {
    if (avg <= 0) return val > 0 ? 3.0 : 0.0;
    return Math.min(5.0, Number(((val / avg) * 3.0).toFixed(1)));
  };

  // 3. Generate final AggregatedMetrics
  return rawData.map(({ staff, totals, report }) => {
    // Score A: Presence (70%) + Critical Meetings (30%)
    const scoreAMins = (totals.minutes / (companyAvg.minutes || 1)) * 3.0;
    const scoreAWeekly = (totals.weeklyMeetings / (companyAvg.weeklyMeetings || 1)) * 3.0;
    const scoreA = Math.min(5.0, Number(((scoreAMins * 0.7) + (scoreAWeekly * 0.3)).toFixed(1)));

    // Score P: Tasks (50%) + Communication (30%) + Engagement (20%)
    const scorePTasks = (totals.tasks / (companyAvg.tasks || 1)) * 3.0;
    const scorePMessages = (totals.messages / (companyAvg.messages || 1)) * 3.0;
    const scorePEngagement = (totals.meetings / (companyAvg.meetings || 1)) * 3.0;
    const scoreP = Math.min(5.0, Number(((scorePTasks * 0.5) + (scorePMessages * 0.3) + (scorePEngagement * 0.2)).toFixed(1)));

    // Score Q: Growth (40%) + Innovation (40%) + Culture (20%)
    const scoreQGrowth = ((totals.learning + totals.training) / (companyAvg.growth || 1)) * 3.0;
    const scoreQInnovation = ((totals.innovation * 10 + totals.creative) / (companyAvg.innovation || 1)) * 3.0;
    const scoreQCulture = ((totals.helloHub + totals.hallOfFame) / (companyAvg.culture || 1)) * 3.0;
    const scoreQ = Math.min(5.0, Number(((scoreQGrowth * 0.4) + (scoreQInnovation * 0.4) + (scoreQCulture * 0.2)).toFixed(1)));

    const dailyPresence: DailyPresence[] = eachDayOfInterval({ start: range.startDate, end: range.endDate }).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayData = report.find(r => r.activity_date === dayStr);
      const mins = dayData?.available_minutes || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (mins > 0) level = 1;
      if (mins > 120) level = 2;
      if (mins > 300) level = 3;
      if (mins > 480) level = 4;
      return { date: dayStr, minutes: mins, level };
    });

    const activityHeatmap: ActivityHeatmapPoint[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const d = new Date(); d.setHours(hour);
        const dayMatch = ((d.getDay() + 6) % 7) === day;
        let value = 0;
        if (hour >= 9 && hour <= 18 && dayMatch) {
          value = (totals.tasks + totals.teamChat) > 0 ? Math.floor(Math.random() * 5) : 0;
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
      available_minutes: Math.round(totals.minutes),
      weekly_meeting_attendance: totals.meetings,
      weekly_meeting_count: totals.weeklyMeetings,
      daily_presence: dailyPresence,
      activity_heatmap: activityHeatmap,
      cat_p_score: scoreP,
      total_tasks_done: totals.tasks,
      private_messages: totals.privateChat,
      team_chat: totals.teamChat,
      private_chat: totals.privateChat,
      reply_messages: totals.replies,
      total_messages: totals.messages,
      cat_q_score: scoreQ,
      learning_points: totals.learning,
      creative_points: totals.creative,
      training_points: totals.training,
      hello_hub: totals.helloHub,
      hall_of_fame: totals.hallOfFame,
      innovation_lab_ideas: totals.innovation,
      salary: report.reduce((sum, r) => sum + (r.salary || 0), 0),
      mom_growth_a: 0,
      mom_growth_p: 0,
      mom_growth_q: 0,
      percentile_rank: 0,
      next_level_target: { metric: 'Tasks', current: totals.tasks, target: (companyAvg.tasks * 1.5), message: 'Try to beat the company average!' },
      history: [],
      period: format(range.startDate, 'MMM yyyy')
    };
  });
};

export const fetchKudos = async (email: string): Promise<Kudos[]> => {
  // Mock for now until kudos table exists
  return [];
};