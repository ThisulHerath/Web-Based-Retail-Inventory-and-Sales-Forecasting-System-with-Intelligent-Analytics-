import fs from 'fs';
import { supabase } from './config/db.js';

async function check() {
  const { data: logs } = await supabase.from('audit_logs').select('user_id').limit(10);
  const { data: users } = await supabase.from('users').select('id, name, email');
  
  const out = {
      sample_log_user_ids: logs.map(l => l.user_id),
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
  };
  fs.writeFileSync('audit_debug.json', JSON.stringify(out, null, 2));
  process.exit(0);
}
check();
