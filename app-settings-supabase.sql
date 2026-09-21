-- ══════════════════════════════════════════════════════
-- جدول إعدادات التطبيق العامة (app_settings)
-- يستخدم لتخزين إعدادات مثل Pixel ID ديناميكيًا
-- نفّذ هذا الـ SQL في: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: الجدول يُقرأ من الجميع (للـ pixel)، لكن الكتابة فقط من الـ service role
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة (الـ Pixel ID يحتاجه الـ client-side)
CREATE POLICY "public_read_app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- الكتابة فقط من الـ service role (عبر الـ API route المحمي بالأدمن)
-- لا نحتاج policy للـ INSERT/UPDATE لأننا نستخدم service_role key في الـ API

-- أدخل قيمة افتراضية فارغة (اختياري)
-- INSERT INTO app_settings (key, value) VALUES ('meta_pixel_id', '') ON CONFLICT DO NOTHING;
