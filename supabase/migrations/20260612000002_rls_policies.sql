-- -------------------------------------------------------------
-- SECURITY DEFINE FUNCTIONS FOR RLS POLICY EVALUATION
-- -------------------------------------------------------------

-- Helper to check if a user has a specific permission code
CREATE OR REPLACE FUNCTION public.has_permission(usr_id UUID, perm_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    -- Check if user is active first
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = usr_id AND status = 'active' AND deleted_at IS NULL) THEN
        RETURN FALSE;
    END IF;

    -- Check if user is super admin (bypass all checks)
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = usr_id AND r.code = 'super_admin' AND r.is_active = TRUE
    ) THEN
        RETURN TRUE;
    END IF;

    -- Regular permission check
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = usr_id AND p.code = perm_code AND r.is_active = TRUE
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to check if user has a specific role code
CREATE OR REPLACE FUNCTION public.has_role(usr_id UUID, role_code VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = usr_id AND r.code = role_code AND r.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES BY TABLE
-- -------------------------------------------------------------

-- 1. USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view profiles"
    ON public.users FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "Allow users to edit their own profile"
    ON public.users FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow super admin to manage profiles"
    ON public.users FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

-- 2. ROLES & PERMISSIONS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing roles" ON public.roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow managing roles" ON public.roles FOR ALL TO authenticated USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow viewing permissions" ON public.permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow managing permissions" ON public.permissions FOR ALL TO authenticated USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow viewing role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow managing role_permissions" ON public.role_permissions FOR ALL TO authenticated USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow viewing role_hierarchy" ON public.role_hierarchy FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow managing role_hierarchy" ON public.role_hierarchy FOR ALL TO authenticated USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow viewing user_roles" ON public.user_roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow managing user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_permission(auth.uid(), 'roles.manage'));

-- 3. MEMBERS & TRANSFERS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing members"
    ON public.members FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'members.view') AND deleted_at IS NULL);

CREATE POLICY "Allow inserting members"
    ON public.members FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'members.create'));

CREATE POLICY "Allow updating members"
    ON public.members FOR UPDATE TO authenticated
    USING (public.has_permission(auth.uid(), 'members.edit'))
    WITH CHECK (public.has_permission(auth.uid(), 'members.edit'));

CREATE POLICY "Allow deleting members"
    ON public.members FOR DELETE TO authenticated
    USING (public.has_permission(auth.uid(), 'members.delete'));

CREATE POLICY "Allow viewing transfers"
    ON public.member_transfers FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'members.view'));

CREATE POLICY "Allow recording transfers"
    ON public.member_transfers FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'members.transfer'));

-- 4. COMPLAINTS & HISTORY
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing complaints"
    ON public.complaints FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'complaints.view') AND deleted_at IS NULL);

CREATE POLICY "Allow creating complaints"
    ON public.complaints FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'complaints.create'));

CREATE POLICY "Allow updating complaints"
    ON public.complaints FOR UPDATE TO authenticated
    USING (
        public.has_permission(auth.uid(), 'complaints.assign') OR
        public.has_permission(auth.uid(), 'complaints.resolve') OR
        public.has_permission(auth.uid(), 'complaints.close')
    )
    WITH CHECK (
        public.has_permission(auth.uid(), 'complaints.assign') OR
        public.has_permission(auth.uid(), 'complaints.resolve') OR
        public.has_permission(auth.uid(), 'complaints.close')
    );

CREATE POLICY "Allow viewing complaint history"
    ON public.complaint_history FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'complaints.view'));

CREATE POLICY "Allow inserting complaint history"
    ON public.complaint_history FOR INSERT TO authenticated
    WITH CHECK (
        public.has_permission(auth.uid(), 'complaints.assign') OR
        public.has_permission(auth.uid(), 'complaints.resolve') OR
        public.has_permission(auth.uid(), 'complaints.close')
    );

-- 5. EVENTS & ATTENDANCE
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing events"
    ON public.events FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'events.view') AND deleted_at IS NULL);

CREATE POLICY "Allow creating events"
    ON public.events FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'events.create'));

CREATE POLICY "Allow updating events"
    ON public.events FOR UPDATE TO authenticated
    USING (public.has_permission(auth.uid(), 'events.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'events.manage'));

CREATE POLICY "Allow viewing attendance"
    ON public.event_attendance FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'events.view'));

CREATE POLICY "Allow updating attendance"
    ON public.event_attendance FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'events.attendance'));

-- 6. TASKS, NOTIFICATIONS & AUDIT LOGS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing tasks"
    ON public.tasks FOR SELECT TO authenticated
    USING (
        public.has_permission(auth.uid(), 'tasks.view') OR 
        assigned_to = auth.uid() OR 
        assigned_by = auth.uid()
    );

CREATE POLICY "Allow creating tasks"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'tasks.create'));

CREATE POLICY "Allow managing tasks"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        public.has_permission(auth.uid(), 'tasks.manage') OR 
        assigned_to = auth.uid() OR 
        assigned_by = auth.uid()
    );

CREATE POLICY "Allow viewing notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow updating notifications"
    ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow viewing audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'super_admin'));

-- 7. SANTHAA COLLECTIONS, ACCOUNTS & TRANSACTIONS
ALTER TABLE public.contributions_santhaa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing contributions"
    ON public.contributions_santhaa FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow inserting contributions"
    ON public.contributions_santhaa FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.collect'));

CREATE POLICY "Allow updating contributions"
    ON public.contributions_santhaa FOR UPDATE TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.collect'));

CREATE POLICY "Allow viewing accounts"
    ON public.accounts FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view'));

CREATE POLICY "Allow viewing transactions"
    ON public.transactions FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow auditing finance"
    ON public.transactions FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.audit'));
