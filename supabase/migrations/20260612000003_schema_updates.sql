-- -------------------------------------------------------------
-- SCHEMA UPDATES FOR FULL PROJECT COVERAGE AND CURRENT APP FLOWS
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- 1. LOCATION TABLE RLS
-- -------------------------------------------------------------
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchayats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kilais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view districts"
    ON public.districts FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow authenticated users to view unions"
    ON public.unions FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow authenticated users to view panchayats"
    ON public.panchayats FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow authenticated users to view villages"
    ON public.villages FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow authenticated users to view kilais"
    ON public.kilais FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow authenticated users to view wards"
    ON public.wards FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Allow role managers to manage districts"
    ON public.districts FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow role managers to manage unions"
    ON public.unions FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow role managers to manage panchayats"
    ON public.panchayats FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow role managers to manage villages"
    ON public.villages FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow role managers to manage kilais"
    ON public.kilais FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Allow role managers to manage wards"
    ON public.wards FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'roles.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

-- -------------------------------------------------------------
-- 2. MEMBER SUPPORTING DOCUMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_member_documents_member_id
    ON public.member_documents(member_id);

ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing member documents"
    ON public.member_documents FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'members.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing member documents"
    ON public.member_documents FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'members.edit'))
    WITH CHECK (public.has_permission(auth.uid(), 'members.edit'));

-- -------------------------------------------------------------
-- 3. COMPLAINT ATTACHMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id
    ON public.complaint_attachments(complaint_id);

ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing complaint attachments"
    ON public.complaint_attachments FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'complaints.view') AND deleted_at IS NULL);

CREATE POLICY "Allow creating complaint attachments"
    ON public.complaint_attachments FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'complaints.create'));

CREATE POLICY "Allow managing complaint attachments"
    ON public.complaint_attachments FOR UPDATE TO authenticated
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

-- -------------------------------------------------------------
-- 4. EVENT REGISTRATION, PHOTOS AND REPORTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    citizen_name VARCHAR(255),
    mobile_number VARCHAR(15),
    registered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT event_registration_person_required CHECK (
        member_id IS NOT NULL OR citizen_name IS NOT NULL
    ),
    UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.event_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.event_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    attendance_count INTEGER NOT NULL DEFAULT 0 CHECK (attendance_count >= 0),
    outcomes TEXT,
    prepared_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_event_reports_updated_at
    BEFORE UPDATE ON public.event_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
    ON public.event_registrations(event_id);

CREATE INDEX IF NOT EXISTS idx_event_photos_event_id
    ON public.event_photos(event_id);

CREATE INDEX IF NOT EXISTS idx_event_reports_event_id
    ON public.event_reports(event_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing event registrations"
    ON public.event_registrations FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'events.view'));

CREATE POLICY "Allow managing event registrations"
    ON public.event_registrations FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'events.manage') OR public.has_permission(auth.uid(), 'events.attendance'))
    WITH CHECK (public.has_permission(auth.uid(), 'events.manage') OR public.has_permission(auth.uid(), 'events.attendance'));

CREATE POLICY "Allow viewing event photos"
    ON public.event_photos FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'events.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing event photos"
    ON public.event_photos FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'events.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'events.manage'));

CREATE POLICY "Allow viewing event reports"
    ON public.event_reports FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'events.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing event reports"
    ON public.event_reports FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'events.manage'))
    WITH CHECK (public.has_permission(auth.uid(), 'events.manage'));

-- Make event attendance upserts explicit for the current attendance UI.
DROP POLICY IF EXISTS "Allow updating attendance" ON public.event_attendance;

CREATE POLICY "Allow inserting attendance"
    ON public.event_attendance FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'events.attendance'));

CREATE POLICY "Allow updating attendance"
    ON public.event_attendance FOR UPDATE TO authenticated
    USING (public.has_permission(auth.uid(), 'events.attendance'))
    WITH CHECK (public.has_permission(auth.uid(), 'events.attendance'));

CREATE POLICY "Allow deleting attendance"
    ON public.event_attendance FOR DELETE TO authenticated
    USING (public.has_permission(auth.uid(), 'events.attendance'));

-- -------------------------------------------------------------
-- 5. MONTHLY SANTHAA SUBSCRIPTIONS, PAYMENTS AND RECEIPTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    start_month DATE NOT NULL,
    end_month DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT check_subscription_months CHECK (end_month IS NULL OR start_month <= end_month)
);

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    contribution_id UUID REFERENCES public.contributions_santhaa(id) ON DELETE SET NULL,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    month DATE NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    collector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(member_id, month)
);

CREATE TRIGGER trigger_update_subscription_payments_updated_at
    BEFORE UPDATE ON public.subscription_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    payment_id UUID REFERENCES public.subscription_payments(id) ON DELETE SET NULL,
    contribution_id UUID REFERENCES public.contributions_santhaa(id) ON DELETE SET NULL,
    issued_to_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT receipt_payment_reference_required CHECK (
        payment_id IS NOT NULL OR contribution_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id
    ON public.subscriptions(member_id);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_member_month
    ON public.subscription_payments(member_id, month);

CREATE INDEX IF NOT EXISTS idx_receipts_payment_id
    ON public.receipts(payment_id);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing subscription plans"
    ON public.subscription_plans FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view'));

CREATE POLICY "Allow managing subscription plans"
    ON public.subscription_plans FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.audit'));

CREATE POLICY "Allow viewing subscriptions"
    ON public.subscriptions FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing subscriptions"
    ON public.subscriptions FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'));

CREATE POLICY "Allow viewing subscription payments"
    ON public.subscription_payments FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing subscription payments"
    ON public.subscription_payments FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'));

CREATE POLICY "Allow viewing receipts"
    ON public.receipts FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow issuing receipts"
    ON public.receipts FOR INSERT TO authenticated
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'));

-- -------------------------------------------------------------
-- 6. FINANCE COMPLETENESS AND CURRENT COLLECTION FLOW FIXES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_update_expense_categories_updated_at
    BEFORE UPDATE ON public.expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_donations_payment_date
    ON public.donations(payment_date);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing expense categories"
    ON public.expense_categories FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view'));

CREATE POLICY "Allow managing expense categories"
    ON public.expense_categories FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.audit'));

CREATE POLICY "Allow viewing donations"
    ON public.donations FOR SELECT TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.view') AND deleted_at IS NULL);

CREATE POLICY "Allow managing donations"
    ON public.donations FOR ALL TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.audit'));

-- The implemented Santhaa action records a contribution, updates the cash
-- account balance, and inserts an income transaction. Collectors need explicit
-- policies for those two follow-up writes.
CREATE POLICY "Allow collectors to update account balances"
    ON public.accounts FOR UPDATE TO authenticated
    USING (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'))
    WITH CHECK (public.has_permission(auth.uid(), 'accounts.collect') OR public.has_permission(auth.uid(), 'accounts.audit'));

CREATE POLICY "Allow collectors to insert Santhaa transactions"
    ON public.transactions FOR INSERT TO authenticated
    WITH CHECK (
        public.has_permission(auth.uid(), 'accounts.collect') AND
        type = 'Income' AND
        category = 'Santhaa Collection'
    );

-- -------------------------------------------------------------
-- 7. TASK COMMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_task_comments_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id
    ON public.task_comments(task_id);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing task comments"
    ON public.task_comments FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1
            FROM public.tasks t
            WHERE t.id = task_id
              AND (
                public.has_permission(auth.uid(), 'tasks.view') OR
                t.assigned_to = auth.uid() OR
                t.assigned_by = auth.uid()
              )
        )
    );

CREATE POLICY "Allow creating task comments"
    ON public.task_comments FOR INSERT TO authenticated
    WITH CHECK (
        public.has_permission(auth.uid(), 'tasks.update') OR
        public.has_permission(auth.uid(), 'tasks.manage')
    );

CREATE POLICY "Allow managing own task comments"
    ON public.task_comments FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'tasks.manage'))
    WITH CHECK (user_id = auth.uid() OR public.has_permission(auth.uid(), 'tasks.manage'));

-- -------------------------------------------------------------
-- 8. AUDIT INSERT SUPPORT
-- -------------------------------------------------------------
CREATE POLICY "Allow authenticated audit log inserts"
    ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
