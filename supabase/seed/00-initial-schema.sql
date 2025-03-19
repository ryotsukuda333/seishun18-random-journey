-- 共有ルートテーブル (最低限必要なテーブル)
CREATE TABLE public.shared_routes (
  id TEXT PRIMARY KEY,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  route_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 0
);

-- 基本的なセキュリティ設定
ALTER TABLE public.shared_routes ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザー用のポリシー（読み取りと作成を許可）
CREATE POLICY "共有ルートは誰でも読み取り可能" ON public.shared_routes
  FOR SELECT USING (true);

CREATE POLICY "共有ルートは誰でも作成可能" ON public.shared_routes
  FOR INSERT WITH CHECK (true);