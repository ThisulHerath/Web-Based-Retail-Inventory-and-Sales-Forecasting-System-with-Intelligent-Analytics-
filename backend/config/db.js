import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const connectDB = async () => {
    try {
        // Test the connection by querying a simple table
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            // PGRST116 means no rows found, which is OK
            throw error;
        }
        console.log(`✅ Supabase Connected: ${supabaseUrl}`);
    } catch (error) {
        console.error(`❌ Supabase Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export { supabase };
export default connectDB;
