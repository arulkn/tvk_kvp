-- Add default_santhaa_amount to panchayats table
ALTER TABLE public.panchayats ADD COLUMN default_santhaa_amount NUMERIC(10,2) NOT NULL DEFAULT 100.00;
