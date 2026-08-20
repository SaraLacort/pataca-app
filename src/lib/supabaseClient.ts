// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Substitua com as suas variáveis/chaves reais do Supabase
const supabaseUrl = 'https://wlsekzsdtidzeoehoiav.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc2VrenNkdGlkemVvZWhvaWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzgzMTksImV4cCI6MjEwMjM1NDMxOX0.pzeAti0xIGRzfdxuPoNMQ_hT-0yCkUVBNPHPEECLaCI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)