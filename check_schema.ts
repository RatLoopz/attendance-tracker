import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('attendance_records').select('*').limit(1);

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log(
      'Record structure:',
      data && data.length > 0 ? Object.keys(data[0]) : 'No records found'
    );
  }
}

checkSchema();
