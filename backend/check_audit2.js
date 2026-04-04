import fs from 'fs';
import { supabase } from './config/db.js';

async function check() {
  const { data: logs } = await supabase.from('audit_logs').select('user_id, action, created_at').order('created_at', { ascending: false }).limit(20);
  
  fs.writeFileSync('audit_debug2.json', JSON.stringify(logs, null, 2));
  process.exit(0);
}
check();
