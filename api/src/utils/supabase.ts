/**
 * Supabase Client Utility
 * Workers環境でのSupabaseクライアント初期化
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../index';

/**
 * Supabaseクライアントを作成
 * @param env 環境変数
 * @param sessionId セッションID (RLS用のx-session-idヘッダー)
 * @returns Supabaseクライアント
 */
export function createSupabaseClient(
  env: Env,
  sessionId?: string
): SupabaseClient {
  const headers: Record<string, string> = {};

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  });
}
