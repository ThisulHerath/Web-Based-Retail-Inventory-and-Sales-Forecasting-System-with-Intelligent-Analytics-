import fs from 'fs';
import { supabase } from './config/db.js';

async function check() {
  const { data: logs } = await supabase.from('audit_logs').select('user_id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(10);
  
  fs.writeFileSync('audit_debug3.json', JSON.stringify(logs, null, 2));
  process.exit(0);
}
check();
