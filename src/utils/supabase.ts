import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try loading .env from several likely locations to be robust across run contexts
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),                    // current working directory
  path.resolve(__dirname, '../../.env'),                 // when running from src/** with tsx
  path.resolve(__dirname, '../.env'),                    // alternative relative
  path.resolve(process.cwd(), 'backend/.env'),           // root-started scripts
];

let envLoaded = false;
let loadedEnvPath: string | null = null;
for (const p of candidateEnvPaths) {
  if (!envLoaded && fs.existsSync(p)) {
    const result = dotenv.config({ path: p });
    if (!result.error) {
      envLoaded = true;
      loadedEnvPath = p;
    }
  }
}
// Fallback to default if nothing matched
if (!envLoaded) {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Backend can operate with just SUPABASE_URL and SUPABASE_SERVICE_KEY.
// ANON key is optional for backend-only usage.
if (!supabaseUrl || !supabaseServiceKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_KEY');
  const searched = candidateEnvPaths.join(', ');
  const observed = `observed lengths -> SUPABASE_URL: ${supabaseUrl ? String(supabaseUrl.length) : '0'}, SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? String(supabaseServiceKey.length) : '0'}`;
  const loadedFrom = loadedEnvPath ? `loaded .env from: ${loadedEnvPath}` : 'no explicit .env path matched; used default dotenv.config()';
  console.error(`[supabase-env] ${loadedFrom}`);
  console.error(`[supabase-env] ${observed}`);
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}. Checked .env at: ${searched}. ${loadedFrom}. ${observed}`);
}

// Client for general operations. If anon key is absent, fall back to service key (backend-only use).
export const supabase = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);

// Client for read-only operations (if you want to use supabase_read_only_user)
// You would need to get the read-only user's JWT token or use a different approach
// export const supabaseReadOnly = createClient(supabaseUrl, supabaseReadOnlyKey);

// Admin client for operations requiring service key (like seeding)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Upload an image to Supabase Storage
 * @param file - File buffer or base64 string
 * @param fileName - Name for the file
 * @param bucket - Storage bucket name (default: 'experiences')
 * @returns URL of the uploaded file
 */
export async function uploadImage(
  file: Buffer | string,
  fileName: string,
  bucket: string = 'experiences'
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param fileName - Name of the file to delete
 * @param bucket - Storage bucket name (default: 'experiences')
 */
export async function deleteImage(
  fileName: string,
  bucket: string = 'experiences'
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
