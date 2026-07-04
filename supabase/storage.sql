
-- ============================================================
-- STORAGE BUCKET: lms_assets (PDFs, Images)
-- ============================================================

-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('lms_assets', 'lms_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el bucket lms_assets
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'lms_assets' );

CREATE POLICY "Admin Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'lms_assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'lms_assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'lms_assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
