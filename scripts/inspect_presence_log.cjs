const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spb.dpsmedia.vn/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NDcyNDAwLCJleHAiOjE5MjMyMzg4MDB9.1kb1jTNBsfdvArMbTZ5dVPG9V3qLQIlyOeoNtcWRq7o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectPresence() {
    console.log('Fetching hr_presence_log...');

    // Check plural
    let { data, error } = await supabase.from('hr_presence_log').select('*').limit(1);

    if (error || !data || data.length === 0) {
        console.log('hr_presence_log empty or error. Trying hr_presence_logs...');
        const res = await supabase.from('hr_presence_logs').select('*').limit(1);
        data = res.data;
        error = res.error;
    }

    if (error) {
        console.error('Error fetching hr_presence_log:', error);
    } else if (data && data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
        console.log('Sample Row:', data[0]);
    } else {
        console.log('No data found in hr_presence_log');
    }

    console.log('\nFetching hr_weekly_meeting_log (Long Durations)...');
    const { data: meetingData, error: meetingError } = await supabase
        .from('hr_weekly_meeting_log')
        .select('*')
        .gt('durationInSeconds', 10800) // > 3 hours
        .limit(5);

    if (meetingError) {
        console.error('Error fetching weekly_meeting_log:', meetingError);
    } else if (meetingData && meetingData.length > 0) {
        console.log('Keys:', Object.keys(meetingData[0]));
        console.log('Sample Row:', meetingData[0]);
    } else {
        console.log('No data found in hr_weekly_meeting_log');
    }
}

inspectPresence();
