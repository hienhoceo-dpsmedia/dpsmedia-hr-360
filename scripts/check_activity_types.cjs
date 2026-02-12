const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spb.dpsmedia.vn/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NDcyNDAwLCJleHAiOjE5MjMyMzg4MDB9.1kb1jTNBsfdvArMbTZ5dVPG9V3qLQIlyOeoNtcWRq7o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkActivityTypes() {
    console.log('Fetching unique activity types...');
    const { data: logs, error } = await supabase
        .from('hr_presence_log')
        .select('activity')
        .limit(10000);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const types = new Set();
    logs.forEach(l => types.add(l.activity));

    console.log('Unique Activity Types:', Array.from(types));
}

checkActivityTypes();
