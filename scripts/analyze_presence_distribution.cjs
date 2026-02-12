const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spb.dpsmedia.vn/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NDcyNDAwLCJleHAiOjE5MjMyMzg4MDB9.1kb1jTNBsfdvArMbTZ5dVPG9V3qLQIlyOeoNtcWRq7o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeDistribution() {
    // 1. Fetch logs for a specific user (or all if easier) for Feb 2025
    const startDate = '2025-01-01T00:00:00';
    const endDate = '2025-02-13T23:59:59';

    console.log('Fetching logs (no filter)...');
    const { data: logs, error } = await supabase
        .from('hr_presence_log')
        .select('*')
        .limit(10); // Just check if ANY data exists for anon

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Fetched ${logs.length} rows.`);

    // 2. Aggregate by Hour
    const hourlyCounts = {};
    let maxCount = 0;

    logs.forEach(log => {
        const date = new Date(log['DATE TIME']);
        const key = `${date.toISOString().split('T')[0]} H${date.getHours()}`;
        hourlyCounts[key] = (hourlyCounts[key] || 0) + 1;
        if (hourlyCounts[key] > maxCount) maxCount = hourlyCounts[key];
    });

    console.log('Max logs per hour:', maxCount);
    console.log('Sample Hourly Counts:', Object.entries(hourlyCounts).slice(0, 10));

    // Distribution
    const buckets = { '0-5': 0, '6-20': 0, '21-60': 0, '60+': 0 };
    Object.values(hourlyCounts).forEach(c => {
        if (c <= 5) buckets['0-5']++;
        else if (c <= 20) buckets['6-20']++;
        else if (c <= 60) buckets['21-60']++;
        else buckets['60+']++;
    });
    console.log('Distribution:', buckets);
}

analyzeDistribution();
