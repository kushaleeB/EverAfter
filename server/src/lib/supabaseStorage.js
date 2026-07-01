import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';
import { AppError } from '../errors/AppError.js';

let client = null;

function getClient() {
  if (!env.supabaseProjectUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError('Supabase Storage is not configured', 500);
  }

  if (!client) {
    client = createClient(env.supabaseProjectUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

export function isStorageConfigured() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || !env.supabaseProjectUrl) return false;
  if (key.includes('your-supabase-service-role-key') || key.startsWith('REPLACE_')) {
    return false;
  }
  return true;
}

/** `local` = disk; `supabase` = bucket; `auto` = local in dev, supabase in production. */
export function shouldUseSupabaseStorage() {
  if (env.UPLOAD_STORAGE === 'local') return false;

  if (!isStorageConfigured()) {
    if (env.UPLOAD_STORAGE === 'supabase' || env.isProduction) {
      throw new AppError(
        'Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET.',
        500,
      );
    }
    return false;
  }

  if (env.UPLOAD_STORAGE === 'supabase' || env.isProduction) return true;
  return false;
}

export function getPublicUrl(storageKey) {
  const { data } = getClient()
    .storage.from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(storageKey);
  return data.publicUrl;
}

export async function uploadObject(storageKey, buffer, contentType) {
  const supabase = getClient();
  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(storageKey, buffer, { contentType, upsert: false });

  if (error) {
    throw new AppError(`Storage upload failed: ${error.message}`, 500);
  }

  return getPublicUrl(storageKey);
}

export async function deleteObject(storageKey) {
  const supabase = getClient();
  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .remove([storageKey]);

  if (error) {
    console.error(`Storage delete failed for ${storageKey}:`, error.message);
  }
}
