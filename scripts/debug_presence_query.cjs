const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spb.dpsmedia.vn/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NDcyNDAwLCJleHAiOjE5MjMyMzg4MDB9.1kb1jTNBsfdvArMbTZ5dVPG9V3qLQIlyOeoNtcWRq7o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugQuery() {
    console.log('1. Fetching one row to check ALL column names...');
    const { data: sample, error: sampleError } = await supabase
        .from('hr_presence_log')
        .select('*')
        .limit(1);

    if (sampleError) {
        console.error('Sample Fetch Error:', sampleError);
    } else if (sample && sample.length > 0) {
        console.log('Actual Column Names:', Object.keys(sample[0]));
        console.log('Sample Data:', sample[0]);
    } else {
        console.log('No data returned (Table might be empty or RLS still blocking, but user said 55k rows).');
    }

    console.log('\n2. Testing the specific Filter Query...');
    const startDate = new Date('2025-01-01').toISOString();
    const endDate = new Date('2025-02-13').toISOString();

    const { data, error } = await supabase
        .from('hr_presence_log')
        // Intentionally using the suspected problematic column name
        .select('LARK_MAIL, DATE_TIME, activity')
        .gte('DATE_TIME', startDate)
        .lte('DATE_TIME', endDate)
        .limit(5);

    if (error) {
        console.error('Filter Query Error (400 expected if column wrong):', error);
    } else {
        console.log('Filter Query Success! Rows:', data.length);
    }
}

debugQuery();
