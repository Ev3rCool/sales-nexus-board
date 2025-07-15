-- Fix RLS policies to ensure supervisors and managers can access hosting plans and discounts
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated users to read hosting plans" ON public.hosting_plans;
DROP POLICY IF EXISTS "Allow all authenticated users to read hosting plans" ON public.hosting_plans;
DROP POLICY IF EXISTS "Allow authenticated users to read plan discounts" ON public.plan_discounts;
DROP POLICY IF EXISTS "Allow all authenticated users to read plan discounts" ON public.plan_discounts;

-- Create simplified policies for hosting plans
CREATE POLICY "Allow all authenticated users to read hosting plans" 
ON public.hosting_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Create simplified policies for plan discounts
CREATE POLICY "Allow all authenticated users to read plan discounts" 
ON public.plan_discounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure the user has the correct role and profile
UPDATE public.users 
SET role = 'supervisor', name = 'Ivo Nestorovski' 
WHERE email = 'ivonestorovski@gmail.com';