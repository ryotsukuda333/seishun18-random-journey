/**
 * Announcements API Routes
 * お知らせ取得エンドポイント
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { createSupabaseClient } from '../utils/supabase';

const app = new Hono<{ Bindings: Env }>();

// GET /api/announcements - 有効なお知らせを取得
app.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return c.json(
        {
          error: 'DATABASE_ERROR',
          message: 'お知らせの取得に失敗しました',
        },
        500
      );
    }

    return c.json({
      announcements: data || [],
    });
  } catch (error) {
    console.error('Announcements error:', error);
    return c.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'お知らせの取得に失敗しました',
      },
      500
    );
  }
});

export default app;
