
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_upgrades ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS roles AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user team
CREATE OR REPLACE FUNCTION get_user_team(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT team_id FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is supervisor of a team
CREATE OR REPLACE FUNCTION is_team_supervisor(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = team_id AND t.supervisor_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Supervisors can view team members" ON users
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('supervisor', 'manager') 
    AND (
      get_user_team(auth.uid()) = team_id 
      OR is_team_supervisor(auth.uid(), team_id)
      OR get_user_role(auth.uid()) = 'manager'
    )
  );

CREATE POLICY "Managers can manage all users" ON users
  FOR ALL USING (get_user_role(auth.uid()) = 'manager');

CREATE POLICY "Supervisors can manage team members" ON users
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'supervisor' 
    AND is_team_supervisor(auth.uid(), team_id)
  );

-- Teams table policies
CREATE POLICY "Everyone can view teams" ON teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage teams" ON teams
  FOR ALL USING (get_user_role(auth.uid()) = 'manager');

CREATE POLICY "Supervisors can view their teams" ON teams
  FOR SELECT USING (supervisor_id = auth.uid());

-- Hosting plans policies
CREATE POLICY "Everyone can view hosting plans" ON hosting_plans FOR SELECT TO authenticated USING (true);

CREATE POLICY "Supervisors and managers can manage hosting plans" ON hosting_plans
  FOR ALL USING (get_user_role(auth.uid()) IN ('supervisor', 'manager'));

-- Plan discounts policies
CREATE POLICY "Everyone can view plan discounts" ON plan_discounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Supervisors and managers can manage plan discounts" ON plan_discounts
  FOR ALL USING (get_user_role(auth.uid()) IN ('supervisor', 'manager'));

-- Sales entries policies
CREATE POLICY "Agents can view their own sales entries" ON sales_entries
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can create their own sales entries" ON sales_entries
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own sales entries" ON sales_entries
  FOR UPDATE USING (agent_id = auth.uid());

CREATE POLICY "Supervisors can view team sales entries" ON sales_entries
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('supervisor', 'manager') 
    AND (
      get_user_team(agent_id) = get_user_team(auth.uid())
      OR is_team_supervisor(auth.uid(), get_user_team(agent_id))
      OR get_user_role(auth.uid()) = 'manager'
    )
  );

CREATE POLICY "Supervisors can manage team sales entries" ON sales_entries
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('supervisor', 'manager') 
    AND (
      get_user_team(agent_id) = get_user_team(auth.uid())
      OR is_team_supervisor(auth.uid(), get_user_team(agent_id))
      OR get_user_role(auth.uid()) = 'manager'
    )
  );

-- Plan upgrades policies
CREATE POLICY "Agents can view their own plan upgrades" ON plan_upgrades
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Agents can create their own plan upgrades" ON plan_upgrades
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own plan upgrades" ON plan_upgrades
  FOR UPDATE USING (agent_id = auth.uid());

CREATE POLICY "Supervisors can view team plan upgrades" ON plan_upgrades
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('supervisor', 'manager') 
    AND (
      get_user_team(agent_id) = get_user_team(auth.uid())
      OR is_team_supervisor(auth.uid(), get_user_team(agent_id))
      OR get_user_role(auth.uid()) = 'manager'
    )
  );

CREATE POLICY "Supervisors can manage team plan upgrades" ON plan_upgrades
  FOR ALL USING (
    get_user_role(auth.uid()) IN ('supervisor', 'manager') 
    AND (
      get_user_team(agent_id) = get_user_team(auth.uid())
      OR is_team_supervisor(auth.uid(), get_user_team(agent_id))
      OR get_user_role(auth.uid()) = 'manager'
    )
  );
