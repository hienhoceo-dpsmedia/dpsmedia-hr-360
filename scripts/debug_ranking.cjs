const { createClient } = require('@supabase/supabase-js');
const { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } = require('date-fns');

const supabaseUrl = 'https://spb.dpsmedia.vn/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NDcyNDAwLCJleHAiOjE5MjMyMzg4MDB9.1kb1jTNBsfdvArMbTZ5dVPG9V3qLQIlyOeoNtcWRq7o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const normalize = (str) => (str ? str.trim().toLowerCase() : '');

async function fetchStaffList() {
    const { data, error } = await supabase
        .from('hr_staff_info')
        .select('*')
        .eq('ACTIVE', true)
        .order('NAME');

    if (error) throw error;
    return data.map((d) => ({
        id: d.id || d.ID || d.LARK_MAIL,
        name: d.NAME,
        lark_email: d.LARK_MAIL,
        department: d.DEPARTMENT,
    }));
}

async function debugRanking() {
    console.log('Fetching data...');
    const startDateStr = '2026-02-01'; // User's range
    const endDateStr = '2026-02-12';

    // Fetch consolidated data from our SQL View
    const { data: reportData, error: reportError } = await supabase
        .from('hr_full_report')
        .select('*')
        .gte('activity_date', startDateStr)
        .lte('activity_date', endDateStr);

    const { data: cumulativeQData, error: qError } = await supabase
        .from('hr_full_report')
        .select('lark_email, learning_points, creative_points, training_points, hello_hub, hall_of_fame, innovation_lab')
        .lte('activity_date', endDateStr);

    if (reportError) throw reportError;
    if (qError) throw qError;

    const staffList = await fetchStaffList();

    console.log(`Staff Count: ${staffList.length}`);
    console.log(`Report Rows (Range): ${reportData?.length}`);
    console.log(`Cumulative Q Rows: ${cumulativeQData?.length}`);

    if (reportData && reportData.length > 0) {
        console.log('Sample Report Row Keys:', Object.keys(reportData[0]));
        console.log('Sample Report Row:', reportData[0]);
    }

    // Check Hiển's email
    const hienStaff = staffList.find(s => s.name.includes('Quang Hiển'));
    if (hienStaff) {
        console.log(`Hiển Staff Email: '${hienStaff.lark_email}'`);
        const hienReports = reportData?.filter(r => normalize(r.lark_email) === normalize(hienStaff.lark_email));
        console.log(`Hiển Report Rows Found: ${hienReports?.length}`);
        if (hienReports?.length > 0) {
            console.log('First Hien Report:', hienReports[0]);
        }
    }

    // 1. Calculate raw totals for each staff member
    const rawData = staffList.map(staff => {
        const staffEmail = normalize(staff.lark_email);
        const staffReport = reportData?.filter(r => normalize(r.lark_email) === staffEmail) || [];
        const staffCumQ = cumulativeQData?.filter(r => normalize(r.lark_email) === staffEmail) || [];

        return {
            staff,
            totals: {
                tasks: staffReport.reduce((sum, r) => sum + (r.tasks_done || 0), 0),
                meetings: staffReport.reduce((sum, r) => sum + (r.meeting_count || 0), 0), // Meeting Attendance (Weekly Meeting Attendance)
                weeklyMeetings: staffReport.reduce((sum, r) => sum + (r.weekly_meeting_count || 0), 0), // Weekly Meetings (Count)
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
            }
        };
    });

    // --- RANK SCORING SYSTEM (13 Metrics) ---
    const rankMetrics = [
        'tasks',
        'meetings',
        'weeklyMeetings',
        'minutes',
        'learning',
        'creative',
        'training',
        'helloHub',
        'hallOfFame',
        'innovation',
        'teamChat',
        'privateChat',
        'replies'
    ];

    const staffRankScores = {};
    rawData.forEach(d => {
        staffRankScores[d.staff.id] = {};
    });

    // Also collect Rank Info for debugging
    const staffRankPositions = {};
    rawData.forEach(d => {
        staffRankPositions[d.staff.id] = {};
    });

    rankMetrics.forEach(metric => {
        // Sort descending
        const sorted = [...rawData].sort((a, b) => b.totals[metric] - a.totals[metric]);

        // 1. Find Max Value for this metric
        const maxValue = sorted.length > 0 ? sorted[0].totals[metric] : 0;

        // 2. Assign Scores based on % of Max Value
        const weight = metric === 'tasks' ? 0.2 : 0.1;

        for (let i = 0; i < sorted.length; i++) {
            const value = sorted[i].totals[metric];
            let score = 0;
            if (maxValue > 0) {
                score = (value / maxValue) * weight;
            }

            // Rank is just for display
            let rank = i + 1;
            if (i > 0 && sorted[i].totals[metric] < sorted[i - 1].totals[metric]) {
                if (i > 0 && sorted[i].totals[metric] < sorted[i - 1].totals[metric]) {
                    rank = i + 1;
                } else if (i > 0) {
                    rank = staffRankPositions[sorted[i - 1].staff.id][metric];
                }
            }
            // Fix rank logic simplified:
            // strong assumption: strictly sorted descending. 
            // if equal to previous, same rank.
            if (i > 0 && sorted[i].totals[metric] === sorted[i - 1].totals[metric]) {
                rank = staffRankPositions[sorted[i - 1].staff.id][metric];
            } else {
                rank = i + 1;
            }

            staffRankScores[sorted[i].staff.id][metric] = score;
            staffRankPositions[sorted[i].staff.id][metric] = rank;
        }
    });

    // Final Score
    const finalResults = rawData.map(({ staff }) => {
        const rankScores = staffRankScores[staff.id];
        const totalRankScore = Object.values(rankScores).reduce((a, b) => a + b, 0);
        return {
            name: staff.name,
            total: Number(totalRankScore.toFixed(4)),
            ranks: staffRankPositions[staff.id],
            values: rawData.find(r => r.staff.id === staff.id).totals
        };
    });

    // Sort by Total
    finalResults.sort((a, b) => b.total - a.total);

    console.log('=== ALL STAFF TASKS & EMAILS ===');
    rawData.sort((a, b) => b.totals.tasks - a.totals.tasks).forEach(r => {
        console.log(`[${r.staff.lark_email}] ${r.staff.name}: Tasks=${r.totals.tasks}`);
    });

    console.log('\n=== TOP 5 LEADERBOARD ===');
    finalResults.slice(0, 5).forEach((r, i) => {
        console.log(`#${i + 1} ${r.name}: ${r.total} (Tasks Rank: #${r.ranks.tasks})`);
    });

    console.log('\n=== HỒ QUANG HIỂN DETAILS ===');
    const hien = finalResults.find(r => r.name.includes('Hiển') || r.name.includes('Quang Hiển'));
    if (hien) {
        console.log(`Name: ${hien.name}`);
        console.log(`Total Score: ${hien.total}`);
        console.log('Metrics Breakdown:');
        rankMetrics.forEach(m => {
            // We need to access the score from staffRankScores which is not directly in finalResults item
            // access staffRankScores[hienStaffId][m]
            // We need ref to staffRankScores. It is available in scope.
            // But strict ID matching needed.
            const hienId = rawData.find(r => r.staff.name === hien.name).staff.id;
            const score = staffRankScores[hienId][m];
            const val = hien.values[m];
            const rank = hien.ranks[m];

            console.log(`- ${m.padEnd(15)}: Val=${val}, Rank=#${rank}, Score=${score.toFixed(4)}`);
        });
        // Find who is Rank 1 for metrics where Hiển is low?
    } else {
        console.log('Hồ Quang Hiển not found in active staff list.');
    }

}

debugRanking().catch(console.error);
