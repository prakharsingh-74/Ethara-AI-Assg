import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const testSupabaseConnection = async () => {
    try {
        const { error } = await supabase.from('users').select('name').limit(1);
        if (error && error.code !== '42P01') {
            // Ignore "relation does not exist" as that just means tables aren't created yet
            throw error;
        }
        console.log("Supabase connected successfully");
    } catch (error) {
        console.error("Failed to connect to Supabase:", error.message);
    }
}
