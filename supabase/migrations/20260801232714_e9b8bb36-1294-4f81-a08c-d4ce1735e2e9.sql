
CREATE POLICY "appdocs_own_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'application-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')));
CREATE POLICY "appdocs_own_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "appdocs_own_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'application-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));
