-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- AUTOMATIC UPDATED_AT TRIGGER HELPER
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------
-- 1. LOCATION AND GEOGRAPHY TABLES
-- -------------------------------------------------------------
CREATE TABLE public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.unions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(district_id, name)
);

CREATE TABLE public.panchayats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    union_id UUID NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(union_id, name)
);

CREATE TABLE public.villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    panchayat_id UUID NOT NULL REFERENCES public.panchayats(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(panchayat_id, name)
);

CREATE TABLE public.kilais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(village_id, name)
);

CREATE TABLE public.wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kilai_id UUID NOT NULL REFERENCES public.kilais(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    name VARCHAR(100),
    name_ta VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(kilai_id, number)
);

-- -------------------------------------------------------------
-- 2. IDENTITY, ROLES AND ACCESS CONTROL
-- -------------------------------------------------------------
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.role_hierarchy (
    parent_role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    child_role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_role_id, child_role_id),
    CONSTRAINT no_self_loop CHECK (parent_role_id <> child_role_id)
);

-- -------------------------------------------------------------
-- 3. USERS (PROFILE SYSTEM SYNCED WITH AUTH.USERS)
-- -------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    mobile_number VARCHAR(15),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
    union_id UUID REFERENCES public.unions(id) ON DELETE SET NULL,
    panchayat_id UUID REFERENCES public.panchayats(id) ON DELETE SET NULL,
    village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    kilai_id UUID REFERENCES public.kilais(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.user_roles (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- -------------------------------------------------------------
-- 4. CADRE AND MEMBER SYSTEM
-- -------------------------------------------------------------
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    membership_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    mobile_number VARCHAR(15) NOT NULL,
    alternate_number VARCHAR(15),
    address TEXT,
    district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
    union_id UUID REFERENCES public.unions(id) ON DELETE SET NULL,
    panchayat_id UUID REFERENCES public.panchayats(id) ON DELETE SET NULL,
    village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    kilai_id UUID REFERENCES public.kilais(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    date_of_birth DATE,
    occupation VARCHAR(100),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    blood_group VARCHAR(5),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.member_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    from_kilai_id UUID REFERENCES public.kilais(id) ON DELETE SET NULL,
    to_kilai_id UUID REFERENCES public.kilais(id) ON DELETE SET NULL,
    from_ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    to_ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    transferred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. GRIEVANCE AND COMPLAINT MANAGEMENT
-- -------------------------------------------------------------
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    address TEXT,
    panchayat_id UUID REFERENCES public.panchayats(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Water Supply', 'Street Lights', 'Roads', 'Drainage',
        'Garbage', 'Welfare Scheme', 'Electricity', 'Public Infrastructure', 'Other'
    )),
    description TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN (
        'New', 'Assigned', 'In Progress', 'Escalated', 'Resolved', 'Closed'
    )),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.complaint_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 6. EVENTS AND ATTENDANCE
-- -------------------------------------------------------------
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'Public Meetings', 'Booth Meetings', 'Village Meetings', 'Awareness Programs',
        'Membership Drives', 'Welfare Activities', 'Blood Donation Camps',
        'Annadhanam', 'Protests', 'Campaign Events'
    )),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(255) NOT NULL,
    panchayat_id UUID REFERENCES public.panchayats(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    photo_urls TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT check_event_times CHECK (start_time <= end_time)
);

CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.event_attendance (
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Registered' CHECK (status IN ('Registered', 'Present', 'Absent')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    marked_at TIMESTAMPTZ,
    PRIMARY KEY (event_id, member_id)
);

-- -------------------------------------------------------------
-- 7. OPERATIONS, TASKS & NOTIFICATIONS
-- -------------------------------------------------------------
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    priority VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Deferred')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'New Complaint', 'Event Reminder', 'Task Assignment', 'Pending Collection', 'Member Approval'
    )),
    read_at TIMESTAMPTZ,
    link_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', etc.
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 8. MONTHLY SANTHAA COLLECTIONS & ACCOUNTS
-- -------------------------------------------------------------
CREATE TABLE public.contributions_santhaa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    month DATE NOT NULL, -- Stored as YYYY-MM-01
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    collector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(member_id, month)
);

CREATE TRIGGER trigger_update_contributions_santhaa_updated_at
    BEFORE UPDATE ON public.contributions_santhaa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'Cash' CHECK (type IN ('Cash', 'Bank', 'Digital Wallet')),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Income', 'Expense')),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Santhaa Collection', 'Donation', 'Event Expenses', 'Welfare Activities',
        'Office Expenses', 'Printing', 'Campaign Materials', 'Miscellaneous'
    )),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    link_id UUID, -- References contribution_id or event_id etc. if applicable
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------
-- 9. SCHEMA INDEXES FOR PERFORMANCE
-- -------------------------------------------------------------
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_location ON public.users(district_id, union_id, panchayat_id);
CREATE INDEX idx_members_mobile ON public.members(mobile_number);
CREATE INDEX idx_members_location ON public.members(district_id, union_id, panchayat_id, village_id, kilai_id, ward_id);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_contributions_member_month ON public.contributions_santhaa(member_id, month);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);

-- -------------------------------------------------------------
-- 10. AUTH PROFILE CREATION TRIGGER
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    is_super_admin BOOLEAN := FALSE;
BEGIN
    -- If the new user has a specific email or is the first user, let's auto-assign super_admin role
    IF new.email = 'admin@tvkpanchayat.org' THEN
        is_super_admin := TRUE;
    END IF;

    -- Sync user profile into public.users
    INSERT INTO public.users (id, email, full_name, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
        'active'
    );

    -- Assign role if seeded
    IF is_super_admin THEN
        SELECT id INTO default_role_id FROM public.roles WHERE code = 'super_admin' LIMIT 1;
    ELSE
        SELECT id INTO default_role_id FROM public.roles WHERE code = 'volunteer' LIMIT 1;
    END IF;

    IF default_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (new.id, default_role_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
