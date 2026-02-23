// utils/supabase-config.js - Configuración central de Supabase para LAG.barberia

const SUPABASE_URL = 'https://nbbbqmipirnlautqfunr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmJxbWlwaXJubGF1dHFmdW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg4NTQsImV4cCI6MjA4NzQwNDg1NH0.bqA584gTDi8zZ9YGtlAGyASYC-GnN_mBbR7q4WEW2ds';

// Hacerlas globales para que otros scripts las usen
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

console.log('✅ Configuración central de Supabase cargada para LAG.barberia');
console.log('🔗 URL:', SUPABASE_URL);
console.log('🔑 API Key:', SUPABASE_ANON_KEY ? '✓ Presente' : '✗ Falta');