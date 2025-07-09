-- Fix RLS policies to allow all authenticated users to read hosting plans and discounts
-- The current policies seem to be too restrictive

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "plans_crud" ON hosting_plans;
DROP POLICY IF EXISTS "discounts_crud" ON plan_discounts;

-- Create simple read policies for all authenticated users
CREATE POLICY "Allow all authenticated users to read hosting plans" 
ON hosting_plans FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow all authenticated users to read plan discounts" 
ON plan_discounts FOR SELECT 
TO authenticated 
USING (true);

-- Keep the existing broader read policies as backup
-- These should work for any authenticated user