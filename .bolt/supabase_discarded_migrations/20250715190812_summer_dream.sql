/*
  # Debug and Fix Hosting Plans Loading Issues

  1. Diagnostics
    - Check if hosting_plans table exists and has data
    - Verify RLS policies are correct
    - Ensure proper enum types exist

  2. Fixes
    - Clean up conflicting RLS policies
    - Ensure sample data exists
    - Fix any enum type mismatches
*/

-- First, let's check what we have
DO $$ 
DECLARE
    plan_count INTEGER;
    discount_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Check hosting_plans count
    SELECT COUNT(*) INTO plan_count FROM hosting_plans;
    RAISE NOTICE 'Current hosting_plans count: %', plan_count;
    
    -- Check plan_discounts count
    SELECT COUNT(*) INTO discount_count FROM plan_discounts;
    RAISE NOTICE 'Current plan_discounts count: %', discount_count;
    
    -- Check if RLS is enabled
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE tablename = 'hosting_plans' AND schemaname = 'public';
    RAISE NOTICE 'RLS enabled on hosting_plans: %', rls_enabled;
END $$;

-- Ensure we have the correct enum types
DO $$ BEGIN
    -- Create app_user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        CREATE TYPE app_user_role AS ENUM ('agent', 'supervisor', 'manager');
        RAISE NOTICE 'Created app_user_role enum';
    END IF;
    
    -- Create billing_cycle enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle') THEN
        CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'semi-annual', 'annual');
        RAISE NOTICE 'Created billing_cycle enum';
    END IF;
END $$;

-- Clean up any conflicting RLS policies on hosting_plans
DROP POLICY IF EXISTS "Allow authenticated users to read hosting plans" ON hosting_plans;
DROP POLICY IF EXISTS "Allow all authenticated users to read hosting plans" ON hosting_plans;
DROP POLICY IF EXISTS "Everyone can view hosting plans" ON hosting_plans;
DROP POLICY IF EXISTS "hosting_plans_read_policy" ON hosting_plans;

-- Create a single, clear RLS policy for hosting_plans
CREATE POLICY "hosting_plans_select_authenticated" 
ON hosting_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Clean up any conflicting RLS policies on plan_discounts
DROP POLICY IF EXISTS "Allow authenticated users to read plan discounts" ON plan_discounts;
DROP POLICY IF EXISTS "Allow all authenticated users to read plan discounts" ON plan_discounts;
DROP POLICY IF EXISTS "Everyone can view plan discounts" ON plan_discounts;
DROP POLICY IF EXISTS "plan_discounts_read_policy" ON plan_discounts;

-- Create a single, clear RLS policy for plan_discounts
CREATE POLICY "plan_discounts_select_authenticated" 
ON plan_discounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;

-- Add sample data if tables are empty
INSERT INTO hosting_plans (name, plan_type, regular_price, setup_fee)
SELECT * FROM (VALUES
  ('Shared Starter', 'shared', 9.99, 0),
  ('Shared Business', 'shared', 19.99, 0),
  ('Shared Premium', 'shared', 39.99, 0),
  ('VPS Basic', 'vps', 29.99, 25.00),
  ('VPS Professional', 'vps', 59.99, 25.00),
  ('VPS Enterprise', 'vps', 119.99, 50.00),
  ('Dedicated Standard', 'dedicated', 199.99, 100.00),
  ('Dedicated Pro', 'dedicated', 399.99, 100.00),
  ('Dedicated Enterprise', 'dedicated', 799.99, 200.00)
) AS v(name, plan_type, regular_price, setup_fee)
WHERE NOT EXISTS (SELECT 1 FROM hosting_plans LIMIT 1);

-- Add sample plan discounts if table is empty
INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, 'monthly'::billing_cycle, 0
FROM hosting_plans p
WHERE NOT EXISTS (SELECT 1 FROM plan_discounts LIMIT 1);

INSERT INTO plan_discounts (plan_id, billing_cycle, discount_pct)
SELECT p.id, 'annual'::billing_cycle, 20
FROM hosting_plans p
WHERE NOT EXISTS (SELECT 1 FROM plan_discounts WHERE billing_cycle = 'annual');

-- Final verification
DO $$ 
DECLARE
    final_plan_count INTEGER;
    final_discount_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_plan_count FROM hosting_plans;
    SELECT COUNT(*) INTO final_discount_count FROM plan_discounts;
    
    RAISE NOTICE 'Final hosting_plans count: %', final_plan_count;
    RAISE NOTICE 'Final plan_discounts count: %', final_discount_count;
    
    IF final_plan_count = 0 THEN
        RAISE WARNING 'hosting_plans table is still empty after migration!';
    END IF;
    
    IF final_discount_count = 0 THEN
        RAISE WARNING 'plan_discounts table is still empty after migration!';
    END IF;
END $$;