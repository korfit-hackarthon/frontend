import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzmheuhyfitnctuyuxef.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bWhldWh5Zml0bmN0dXl1eGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzc5ODEsImV4cCI6MjA3Mjk1Mzk4MX0.uyAAFsSc7NsMrcrCSdc1dA3dy4OeRHmihJyx6CsbR_U';

export const supabase = createClient(supabaseUrl!, supabaseKey!);
