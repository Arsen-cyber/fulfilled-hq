// Connection to your live Fulfilled HQ backend (Supabase edge functions).
// The anon key is public-safe (it only lets the dashboard call hq-data, which
// reads through the locked service-role tables). Real login is added when we
// put this on a permanent web link.
window.HQ_CONFIG = {
  url: 'https://liseiljtlahzjejyqglx.supabase.co/functions/v1',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc2VpbGp0bGFoemplanlxZ2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzc3NzYsImV4cCI6MjA5Mzg1Mzc3Nn0.pC1wlNUJpSWBLh74ablWMinbkQcMUOrd6vdJwtfSxCE',
};
