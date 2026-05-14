
-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'glam',
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'after' CHECK (image_type IN ('before', 'after')),
  pair_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery images
CREATE POLICY "Gallery images are publicly viewable"
  ON public.gallery_images FOR SELECT USING (true);

-- Only authenticated users can insert (admin)
CREATE POLICY "Authenticated users can insert gallery images"
  ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete gallery images"
  ON public.gallery_images FOR DELETE TO authenticated USING (true);

-- Create storage bucket for gallery uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
