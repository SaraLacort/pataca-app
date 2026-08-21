
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://wlsekzsdtidzeoehoiav.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc2VrenNkdGlkemVvZWhvaWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzgzMTksImV4cCI6MjEwMjM1NDMxOX0.pzeAti0xIGRzfdxuPoNMQ_hT-0yCkUVBNPHPEECLaCI'
const supabase = createClient(supabaseUrl, supabaseKey)