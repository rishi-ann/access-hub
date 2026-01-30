-- Create creator profiles table with extended fields
CREATE TABLE public.creator_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_picture_url TEXT,
    bio TEXT,
    state TEXT,
    city TEXT,
    location TEXT,
    languages TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specialization categories enum
CREATE TYPE public.specialization_category AS ENUM (
    'brand_strategy',
    'content_creation',
    'reel_direction',
    'story_telling',
    'creative_direction',
    'photography',
    'video_editing',
    'social_media_management',
    'influencer_marketing',
    'copywriting'
);

-- Create skill level enum
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'expert');

-- Create creator specializations table
CREATE TABLE public.creator_specializations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    category specialization_category NOT NULL,
    skill_level skill_level NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(creator_id, category)
);

-- Create creator portfolio table
CREATE TABLE public.creator_portfolio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image' or 'video'
    title TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator pricing packages table
CREATE TABLE public.creator_pricing (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    package_name TEXT NOT NULL,
    hours_range TEXT NOT NULL, -- e.g., "2-3 hours"
    price NUMERIC NOT NULL,
    description TEXT,
    includes TEXT[] DEFAULT '{}', -- list of what's included
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator availability table
CREATE TABLE public.creator_availability (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(creator_id, day_of_week)
);

-- Create creator banking details table (sensitive data)
CREATE TABLE public.creator_banking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE UNIQUE,
    account_holder_name TEXT,
    bank_name TEXT,
    account_number TEXT, -- Should be encrypted in production
    ifsc_code TEXT,
    upi_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_banking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_profiles
CREATE POLICY "Creators can view their own profile"
ON public.creator_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Creators can insert their own profile"
ON public.creator_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their own profile"
ON public.creator_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all creator profiles"
ON public.creator_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for creator_specializations
CREATE POLICY "Creators can manage their specializations"
ON public.creator_specializations FOR ALL
USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all specializations"
ON public.creator_specializations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for creator_portfolio
CREATE POLICY "Creators can manage their portfolio"
ON public.creator_portfolio FOR ALL
USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all portfolios"
ON public.creator_portfolio FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for creator_pricing
CREATE POLICY "Creators can manage their pricing"
ON public.creator_pricing FOR ALL
USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all pricing"
ON public.creator_pricing FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for creator_availability
CREATE POLICY "Creators can manage their availability"
ON public.creator_availability FOR ALL
USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all availability"
ON public.creator_availability FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for creator_banking (most sensitive)
CREATE POLICY "Creators can manage their banking details"
ON public.creator_banking FOR ALL
USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view banking details"
ON public.creator_banking FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for creator portfolio
INSERT INTO storage.buckets (id, name, public) VALUES ('creator-portfolio', 'creator-portfolio', true);

-- Storage policies for portfolio uploads
CREATE POLICY "Creators can upload their portfolio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'creator-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can update their portfolio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'creator-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete their portfolio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'creator-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Portfolio files are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'creator-portfolio');

-- Updated at trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_creator_profiles_updated_at
BEFORE UPDATE ON public.creator_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_pricing_updated_at
BEFORE UPDATE ON public.creator_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_banking_updated_at
BEFORE UPDATE ON public.creator_banking
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();