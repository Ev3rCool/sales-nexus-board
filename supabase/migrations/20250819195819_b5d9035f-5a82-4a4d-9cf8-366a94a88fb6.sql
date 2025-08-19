-- Add missing RLS policies for plan_upgrades table
-- Ensure only the owning agent can update or delete their records

-- UPDATE policy: agents can update their own plan upgrades
CREATE POLICY IF NOT EXISTS "upgrades_update_own"
ON public.plan_upgrades
FOR UPDATE
TO authenticated
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

-- DELETE policy: agents can delete their own plan upgrades
CREATE POLICY IF NOT EXISTS "upgrades_delete_own"
ON public.plan_upgrades
FOR DELETE
TO authenticated
USING (agent_id = auth.uid());