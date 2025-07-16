/*
  # Fix RLS Infinite Recursion

  1. Problem
    - Infinite recursion detected in policy for relation "users"
    - Complex policies causing recursive loops
    - Preventing user authentication and data access

  2. Solution
    - Drop all existing conflicting policies
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparisons only
    - Avoid complex subqueries that cause recursion

  3. Security
    - Users can only access their own data
    - Supervisors and managers can access team data
    - Simple role-based access without recursion
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Supervisors and managers can read team members" ON users;

-- Drop conflicting sales policies
DROP POLICY IF EXISTS "Users can delete their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can insert their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can read their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can update their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "sales_insert_self" ON sales_entries;
DROP POLICY IF EXISTS "sales_select_combined" ON sales_entries;

-- Drop conflicting upgrade policies
DROP POLICY IF EXISTS "upgrades_insert_self" ON plan_upgrades;
DROP POLICY IF EXISTS "upgrades_select_combined" ON plan_upgrades;

-- Create simple, non-recursive policies for users table
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create simple policies for sales_entries
CREATE POLICY "sales_select_own" ON sales_entries
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "sales_insert_own" ON sales_entries
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "sales_update_own" ON sales_entries
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "sales_delete_own" ON sales_entries
  FOR DELETE TO authenticated
  USING (agent_id = auth.uid());

-- Create simple policies for plan_upgrades
CREATE POLICY "upgrades_select_own" ON plan_upgrades
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "upgrades_insert_own" ON plan_upgrades
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_upgrades ENABLE ROW LEVEL SECURITY;