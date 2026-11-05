
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','staff','applicant');
CREATE TYPE public.application_status AS ENUM ('draft','submitted','under_review','documents_requested','approved','rejected');
CREATE TYPE public.payment_status AS ENUM ('pending','success','failed');
CREATE TYPE public.payment_purpose AS ENUM ('application_fee','registration_fee','tuition');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'applicant')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  tuition_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  application_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "courses_admin_write" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_number TEXT NOT NULL UNIQUE DEFAULT ('PPA-' || to_char(now(),'YYYY') || '-' || lpad((floor(random()*900000)+100000)::text, 6, '0')),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  status public.application_status NOT NULL DEFAULT 'draft',
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  state_of_origin TEXT,
  address TEXT,
  highest_qualification TEXT,
  institution_attended TEXT,
  year_completed TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  personal_statement TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_own_select" ON public.applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "applications_own_insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "applications_own_update" ON public.applications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "applications_admin_delete" ON public.applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DOCUMENTS
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_documents TO authenticated;
GRANT ALL ON public.application_documents TO service_role;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_select" ON public.application_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "docs_insert" ON public.application_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "docs_delete" ON public.application_documents FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  purpose public.payment_purpose NOT NULL DEFAULT 'application_fee',
  gateway TEXT NOT NULL DEFAULT 'paystack',
  reference TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STUDENTS
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  student_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  session TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students_select" ON public.students FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "students_admin_write" ON public.students FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CERTIFICATES (public verification)
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  graduate_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  graduation_date DATE NOT NULL,
  grade TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates_public_read" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "certificates_admin_write" ON public.certificates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- NEWS
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  author TEXT DEFAULT 'Pathway Pro',
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news_posts FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "news_admin_write" ON public.news_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- GALLERY
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Campus',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "gallery_admin_write" ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- FAQS
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "faqs_admin_write" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BANNERS
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  cta_label TEXT,
  cta_href TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "banners_admin_write" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BROCHURES
CREATE TABLE public.brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brochures TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brochures TO authenticated;
GRANT ALL ON public.brochures TO service_role;
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brochures_public_read" ON public.brochures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "brochures_admin_write" ON public.brochures FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_admin_read" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "contact_admin_write" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SEED DATA
INSERT INTO public.courses (slug,title,summary,description,duration,tuition_fee,application_fee,requirements,sort_order) VALUES
('private-pilot-licence','Private Pilot Licence (PPL)','Your first step into the cockpit — fly single-engine aircraft as pilot in command.','The PPL programme covers air law, meteorology, navigation, principles of flight, human performance and a minimum of 45 flight hours with our certified instructors.','9 months',3500000,25000,ARRAY['Minimum of 5 O''Level credits including English and Mathematics','Class 2 Medical Certificate','Minimum age of 17 years','Valid means of identification'],1),
('commercial-pilot-licence','Commercial Pilot Licence (CPL)','Train to fly professionally and be paid for it.','Advanced flight training including night rating, instrument flying, complex aircraft handling and 200+ logged hours, preparing you for airline entry.','18 months',12500000,50000,ARRAY['Valid Private Pilot Licence','Class 1 Medical Certificate','Minimum age of 18 years','Passed NCAA written examinations'],2),
('aircraft-maintenance-engineering','Aircraft Maintenance Engineering','Become a licensed engineer keeping aircraft airworthy.','Airframe and powerplant training covering aircraft systems, avionics, inspection procedures, safety management and hands-on hangar practicals.','24 months',4200000,25000,ARRAY['5 O''Level credits including Physics, Mathematics and English','Medical fitness certificate','Minimum age of 17 years'],3),
('cabin-crew-training','Cabin Crew Training','Professional in-flight service, safety and emergency procedures.','IATA-aligned cabin crew programme covering safety and emergency procedures, first aid, customer service, grooming and aviation security.','6 months',950000,15000,ARRAY['Minimum of SSCE/WAEC certificate','Fluency in English','Minimum height of 1.60m','Minimum age of 18 years'],4),
('air-traffic-control','Air Traffic Control','Guide aircraft safely through the skies.','Aerodrome, approach and area control training with radar simulation, phraseology, airspace management and ICAO procedures.','12 months',3800000,25000,ARRAY['Minimum of OND in any science discipline','Class 3 Medical Certificate','Excellent spoken English'],5),
('aviation-management','Aviation Management','Business and operations leadership for the aviation industry.','Airport operations, airline economics, aviation law, safety management systems and logistics for future aviation managers.','12 months',1500000,20000,ARRAY['SSCE with 5 credits or equivalent','Minimum age of 18 years'],6);

INSERT INTO public.faqs (question,answer,category,sort_order) VALUES
('Is Pathway Pro approved by the NCAA?','Yes. Pathway Pro Aviation Training operates as an approved training organisation and all our programmes follow NCAA and ICAO standards.','General',1),
('How do I apply for admission?','Create an account on our admission portal, complete the online application form, upload your documents, pay the application fee and submit. You can track your status at any time.','Admissions',2),
('Can I pay tuition in instalments?','Yes. Tuition can be spread across the duration of your programme. Speak with the bursary after admission to agree a payment plan.','Payments',3),
('What documents do I need to upload?','A passport photograph, valid ID, O''Level result, birth certificate and where applicable a medical certificate and previous licence.','Admissions',4),
('Do you provide accommodation?','Hostel accommodation is available on a first-come, first-served basis at an additional fee.','Student Life',5),
('How long does admission processing take?','Applications are typically reviewed within 7 to 14 working days after submission.','Admissions',6),
('Do you help with job placement after graduation?','Yes. Our career services team supports graduates with placement into partner airlines, MROs and ground handling companies.','Careers',7),
('How do employers verify my certificate?','Anyone can verify a Pathway Pro certificate on our public certificate verification page using the certificate number.','General',8);

INSERT INTO public.news_posts (slug,title,excerpt,body,published_at) VALUES
('new-simulator-commissioned','Pathway Pro commissions new full-motion flight simulator','Our new full-motion simulator brings airline-grade training to Nigerian cadets.','The new full-motion flight simulator installed at our training centre allows cadets to practise emergency scenarios, instrument approaches and adverse weather operations in a fully immersive environment. The facility reduces the cost of flight hours while improving safety outcomes for trainees.', now() - interval '4 days'),
('2026-cadet-intake-open','2026 cadet intake now open','Applications for the 2026 pilot and engineering cadet intake are officially open.','Prospective students can now apply online through our admission portal. The intake covers the Private Pilot Licence, Commercial Pilot Licence and Aircraft Maintenance Engineering programmes. Early applicants receive priority scheduling for medical screening.', now() - interval '11 days'),
('partnership-with-regional-airline','Pathway Pro signs placement partnership with regional airline','Graduates gain a direct pathway into first officer and engineering roles.','The agreement guarantees interview slots for qualifying graduates of our CPL and AME programmes, strengthening the pipeline of locally trained aviation professionals.', now() - interval '26 days'),
('safety-week-2026','Highlights from Safety Week 2026','A week of drills, workshops and guest lectures on aviation safety culture.','Safety Week brought together instructors, cadets and industry regulators for emergency evacuation drills, human factors workshops and a keynote on just culture in aviation operations.', now() - interval '40 days');

INSERT INTO public.gallery_images (title,image_url,category,sort_order) VALUES
('Training aircraft on the apron','https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80','Fleet',1),
('Cadets in pre-flight briefing','https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80','Campus',2),
('Cockpit instrument training','https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=1200&q=80','Simulator',3),
('Engineering hangar practicals','https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=80','Engineering',4),
('Cabin crew service training','https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80','Cabin Crew',5),
('Control tower operations','https://images.unsplash.com/photo-1521727857535-28d2047619b5?auto=format&fit=crop&w=1200&q=80','ATC',6),
('Graduation ceremony','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80','Events',7),
('Aircraft at sunset','https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=80','Fleet',8);

INSERT INTO public.banners (title,subtitle,cta_label,cta_href,sort_order) VALUES
('Your career in aviation starts here','World-class pilot, engineering and cabin crew training in Nigeria.','Apply for admission','/admissions',1);

INSERT INTO public.brochures (title,description,file_url) VALUES
('General Prospectus 2026','Full overview of programmes, fees, facilities and admission requirements.','/brochures/pathway-pro-prospectus-2026.pdf'),
('Pilot Training Brochure','Detailed breakdown of the PPL and CPL flight training pathways.','/brochures/pathway-pro-pilot-training.pdf'),
('Engineering & Cabin Crew Brochure','Programme structure for AME and cabin crew training.','/brochures/pathway-pro-engineering-cabin.pdf');

INSERT INTO public.site_settings (key,value) VALUES
('school_name','Pathway Pro Aviation Training'),
('phone','+234 800 000 0000'),
('whatsapp','2348000000000'),
('email','admissions@pathwaypro.aero'),
('address','Hangar 4, General Aviation Terminal, Murtala Muhammed Airport, Ikeja, Kano, Nigeria'),
('map_embed','https://www.google.com/maps?q=Murtala%20Muhammed%20International%20Airport%20Kano&output=embed'),
('office_hours','Monday – Friday, 8:00am – 5:00pm');

INSERT INTO public.certificates (certificate_number,graduate_name,course_title,graduation_date,grade) VALUES
('PPA/PPL/2025/0041','Chidinma Okafor','Private Pilot Licence (PPL)','2025-07-18','Distinction'),
('PPA/CPL/2024/0107','Musa Ibrahim','Commercial Pilot Licence (CPL)','2024-11-29','Credit'),
('PPA/AME/2025/0233','Tunde Adeyemi','Aircraft Maintenance Engineering','2025-03-14','Distinction'),
('PPA/CCT/2025/0388','Grace Eze','Cabin Crew Training','2025-09-05','Merit');
