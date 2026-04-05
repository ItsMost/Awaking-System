import { createClient } from '@supabase/supabase-js';

// الـ URL اللي أنا استخرجته من التوكن بتاعك
const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';

// الـ Public Anon Key اللي إنت بعته
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
