import { supabase } from './supabaseClient';
import { AggregatedMetrics, DateRange, StaffInfo, Kudos, HistoryPoint, DailyPresence, ActivityHeatmapPoint, RawPresenceLog } from '../types';
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
    id: data.id || data.LARK_MAIL,
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
    id: d.id || d.LARK_MAIL,
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

  // Parallel fetch for all base data sources
  const [staffList, { data: reportData }, { data: assessmentData }, { data: presenceLogs }] = await Promise.all([
    fetchStaffList(),
    supabase.from('hr_full_report').select('*').gte('activity_date', startDateStr).lte('activity_date', endDateStr),
    supabase.from('hr_year_end_assessment').select('*').gte('date_voted', startDateStr).lte('date_voted', endDateStr),
    supabase.from('hr_presence_log').select('LARK_MAIL, "DATE TIME", activity').gte('"DATE TIME"', startDateStr).lte('"DATE TIME"', endDateStr + 'T23:59:59')
  ]);

  if (!reportData) throw new Error("Failed to fetch report data");

  // Pre-process: Group report data by email for O(1) lookup
  const reportByEmail = new Map<string, any[]>();
  reportData.forEach(r => {
    const email = normalize(r.lark_email);
    if (!reportByEmail.has(email)) reportByEmail.set(email, []);
    reportByEmail.get(email)!.push(r);
  });

  // Pre-process: Group assessment data by name for O(1) lookup
  const assessmentByName = new Map<string, any>();
  assessmentData?.forEach(a => {
    assessmentByName.set(normalize(a.name), a);
  });

  // Pre-process: Group presence logs by email for O(1) lookup
  const presenceByEmail = new Map<string, any[]>();
  presenceLogs?.forEach((log: any) => {
    const email = normalize(log.LARK_MAIL);
    if (!presenceByEmail.has(email)) presenceByEmail.set(email, []);
    presenceByEmail.get(email)!.push(log);
  });

  // 1. Calculate raw totals for each staff member
  const rawData = staffList.map(staff => {
    const staffEmail = normalize(staff.lark_email);
    const staffReport = reportByEmail.get(staffEmail) || [];
    const staffAssessment = assessmentByName.get(normalize(staff.name));

    const totals = {
      tasks: 0, meetings: 0, weeklyMeetings: 0, minutes: 0,
      learning: 0, creative: 0, training: 0, helloHub: 0,
      hallOfFame: 0, innovation: 0, teamChat: 0, privateChat: 0,
      replies: 0, mostFavorite: staffAssessment?.most_favorite || 0,
      mostInfluential: staffAssessment?.most_influential || 0,
      messages: 0
    };

    staffReport.forEach(r => {
      totals.tasks += (r.tasks_done || 0);
      totals.meetings += (r.meeting_count || 0);
      totals.weeklyMeetings += (r.weekly_meeting_count || 0);
      totals.minutes += (r.available_minutes || 0);
      totals.learning += (r.learning_points || 0);
      totals.creative += (r.creative_points || 0);
      totals.training += (r.training_points || 0);
      totals.helloHub += (r.hello_hub || 0);
      totals.hallOfFame += (r.hall_of_fame || 0);
      totals.innovation += (r.innovation_lab || 0);
      totals.teamChat += (r.team_chat || 0);
      totals.privateChat += (r.private_chat || 0);
      totals.replies += (r.reply_messages || 0);
    });

    totals.messages = totals.teamChat + totals.privateChat + totals.replies;

    return { staff, report: staffReport, totals };
  });

  // 2. Calculate Company-Wide Averages
  const n = rawData.length || 1;
  const companySums = rawData.reduce((acc, d) => ({
    minutes: acc.minutes + d.totals.minutes,
    weeklyMeetings: acc.weeklyMeetings + d.totals.weeklyMeetings,
    tasks: acc.tasks + d.totals.tasks,
    messages: acc.messages + d.totals.messages,
    meetings: acc.meetings + d.totals.meetings,
    growth: acc.growth + (d.totals.learning + d.totals.training),
    innovation: acc.innovation + (d.totals.innovation * 10 + d.totals.creative),
    culture: acc.culture + (d.totals.helloHub + d.totals.hallOfFame),
  }), { minutes: 0, weeklyMeetings: 0, tasks: 0, messages: 0, meetings: 0, growth: 0, innovation: 0, culture: 0 });

  const companyAvg = {
    minutes: companySums.minutes / n,
    weeklyMeetings: companySums.weeklyMeetings / n,
    tasks: companySums.tasks / n,
    messages: companySums.messages / n,
    meetings: companySums.meetings / n,
    growth: companySums.growth / n,
    innovation: companySums.innovation / n,
    culture: companySums.culture / n,
  };

  // --- NEW RANK SCORING SYSTEM (13 Metrics) ---
  const rankMetrics: (keyof typeof rawData[0]['totals'])[] = [
    'tasks',
    'meetings',       // Weekly Meeting Attendance (from Count)
    'weeklyMeetings', // Weekly Meeting Log (Count)
    'minutes',
    'learning',
    'creative',
    'training',
    'helloHub',
    'hallOfFame',
    'innovation',
    'teamChat',
    'privateChat',
    'replies',
    'mostFavorite',
    'mostInfluential'
  ];

  // Helper to store scores for each staff
  const staffRankScores: Record<string, Record<string, number>> = {};

  rawData.forEach(d => {
    staffRankScores[d.staff.id] = {};
  });

  rankMetrics.forEach(metric => {
    // Sort descending
    const sorted = [...rawData].sort((a, b) => b.totals[metric] - a.totals[metric]);

    // 1. Find Max Value for this metric
    const maxValue = sorted.length > 0 ? sorted[0].totals[metric] : 0;

    // 2. Assign Scores based on % of Max Value
    // Score = (Value / MaxValue) * Weight
    const weight = metric === 'tasks' ? 0.2 : 0.1;

    for (let i = 0; i < sorted.length; i++) {
      const value = sorted[i].totals[metric];
      let score = 0;
      if (maxValue > 0) {
        score = (value / maxValue) * weight;
      }
      staffRankScores[sorted[i].staff.id][metric] = score;
    }
  });
  // --------------------------------------------

  // Helper to calculate 1-5 score: (Value / Avg) * 3, capped at 5
  const calcRelativeScore = (val: number, avg: number) => {
    if (avg <= 0) return val > 0 ? 3.0 : 0.0;
    return Math.min(5.0, Number(((val / avg) * 3.0).toFixed(1)));
  };

  // Organize logs by email for O(1) lookup
  // (Previously here, now handled at top of function)

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

    // 4. Activity Heatmap (From hr_presence_log using Pre-fetched Map)
    const activityHeatmap: ActivityHeatmapPoint[] = Array.from({ length: 7 * 24 }, (_, i) => ({
      dayIndex: Math.floor(i / 24),
      hour: i % 24,
      value: 0
    }));

    // Populate from Presence Logs
    const staffEmail = normalize(staff.lark_email);
    const logs = presenceByEmail.get(staffEmail) || [];

    logs.forEach(log => {
      // Filter for active work only
      const activeStatuses = ['Available', 'InAMeeting']; // Strict filtering to fix "All Green"
      if (!activeStatuses.includes(log.activity)) return;

      const date = new Date(log['DATE TIME']);
      // Shift 0=Sun to 0=Mon
      const dayIndex = (date.getDay() + 6) % 7;
      const hour = date.getHours();
      const index = dayIndex * 24 + hour;
      if (activityHeatmap[index]) {
        activityHeatmap[index].value += 1;
      }
    });

    // New Total Rank Score
    const rankScores = staffRankScores[staff.id];
    const totalRankScore = Object.values(rankScores).reduce((a, b) => a + b, 0);

    return {
      staffId: staff.id,
      staffName: staff.name,
      department: staff.department,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=00d26a&color=fff&bold=true`,

      // New Rank Logic
      total_rank_score: Number(totalRankScore.toFixed(4)),
      rank_score_breakdown: {
        tasks: rankScores['tasks'] || 0,
        meetings: rankScores['meetings'] || 0,
        weeklyMeetings: rankScores['weeklyMeetings'] || 0,
        minutes: rankScores['minutes'] || 0,
        learning: rankScores['learning'] || 0,
        creative: rankScores['creative'] || 0,
        training: rankScores['training'] || 0,
        helloHub: rankScores['helloHub'] || 0,
        hallOfFame: rankScores['hallOfFame'] || 0,
        innovation: rankScores['innovation'] || 0,
        teamChat: rankScores['teamChat'] || 0,
        privateChat: rankScores['privateChat'] || 0,
        replies: rankScores['replies'] || 0,
        mostFavorite: rankScores['mostFavorite'] || 0,
        mostInfluential: rankScores['mostInfluential'] || 0
      },

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
      mostFavorite: totals.mostFavorite || 0,
      mostInfluential: totals.mostInfluential || 0,
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