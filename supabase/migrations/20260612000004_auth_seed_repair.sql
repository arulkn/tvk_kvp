-- -------------------------------------------------------------
-- AUTH, SEED DATA, AND ROLE REPAIR
-- Run this after initial_schema.sql and rls_policies.sql if login/users
-- were created before seed_data.sql was applied.
-- -------------------------------------------------------------

-- 1. Required roles
INSERT INTO public.roles (code, name, name_ta, description, is_active) VALUES
('super_admin', 'Super Administrator', 'Super Administrator', 'System-wide access to all configurations and management modules.', TRUE),
('panchayat_secretary', 'Panchayat Secretary', 'Panchayat Secretary', 'Administrative head of the Panchayat unit.', TRUE),
('kilai_secretary', 'Kilai Secretary', 'Kilai Secretary', 'In charge of a Kilai unit within the Panchayat.', TRUE),
('ward_secretary', 'Ward Secretary', 'Ward Secretary', 'In charge of a specific Ward administrative unit.', TRUE),
('treasurer', 'Treasurer', 'Treasurer', 'Responsible for Santhaa collections, donations, and expenses.', TRUE),
('volunteer', 'Volunteer', 'Volunteer', 'Standard member who can be assigned operational tasks.', TRUE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = TRUE,
    updated_at = NOW();

-- 2. Required permissions
INSERT INTO public.permissions (code, name, description) VALUES
('members.view', 'View Members', 'Allow viewing member profile and lists.'),
('members.create', 'Create Members', 'Allow adding new party members.'),
('members.edit', 'Edit Members', 'Allow editing existing member profiles.'),
('members.delete', 'Delete Members', 'Allow deactivating or soft deleting members.'),
('members.transfer', 'Transfer Members', 'Allow transferring members between Kilai/Ward.'),
('complaints.view', 'View Complaints', 'Allow viewing grievances list.'),
('complaints.create', 'Create Complaints', 'Allow adding citizen complaints.'),
('complaints.assign', 'Assign Complaints', 'Allow assigning complaints.'),
('complaints.resolve', 'Resolve Complaints', 'Allow marking complaints as resolved.'),
('complaints.close', 'Close Complaints', 'Allow closing complaints.'),
('events.view', 'View Events', 'Allow viewing calendar and events.'),
('events.create', 'Create Events', 'Allow scheduling meetings and programs.'),
('events.manage', 'Manage Events', 'Allow editing, cancelling, and documenting events.'),
('events.attendance', 'Record Attendance', 'Allow marking event attendance.'),
('accounts.view', 'View Accounts', 'Allow viewing finance dashboards and reports.'),
('accounts.collect', 'Collect Santhaa', 'Allow recording subscription payments and receipts.'),
('accounts.audit', 'Audit Accounts', 'Allow adding manual finance records.'),
('tasks.view', 'View Tasks', 'Allow viewing delegated tasks.'),
('tasks.create', 'Create Tasks', 'Allow assigning tasks.'),
('tasks.manage', 'Manage Tasks', 'Allow editing or auditing tasks.'),
('tasks.update', 'Update Task Status', 'Allow updating assigned task status.'),
('roles.manage', 'Manage Roles', 'Allow configuring roles, permissions, and hierarchy.')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Permission mappings
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'panchayat_secretary'
  AND p.code <> 'roles.manage'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view', 'members.create', 'members.edit', 'members.transfer',
    'complaints.view', 'complaints.create', 'complaints.resolve',
    'events.view', 'events.create', 'events.attendance',
    'accounts.view', 'accounts.collect',
    'tasks.view', 'tasks.create', 'tasks.update'
)
WHERE r.code = 'kilai_secretary'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view', 'members.create',
    'complaints.view', 'complaints.create', 'complaints.resolve',
    'events.view',
    'accounts.collect',
    'tasks.view', 'tasks.update'
)
WHERE r.code = 'ward_secretary'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view', 'events.view',
    'accounts.view', 'accounts.collect', 'accounts.audit',
    'tasks.view', 'tasks.update'
)
WHERE r.code = 'treasurer'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view',
    'complaints.view', 'complaints.create',
    'events.view',
    'tasks.view', 'tasks.update'
)
WHERE r.code = 'volunteer'
ON CONFLICT DO NOTHING;

-- 4. Role hierarchy
INSERT INTO public.role_hierarchy (parent_role_id, child_role_id)
SELECT parent.id, child.id
FROM public.roles parent
JOIN public.roles child ON (
    (parent.code = 'super_admin' AND child.code = 'panchayat_secretary') OR
    (parent.code = 'panchayat_secretary' AND child.code = 'kilai_secretary') OR
    (parent.code = 'panchayat_secretary' AND child.code = 'treasurer') OR
    (parent.code = 'kilai_secretary' AND child.code = 'ward_secretary') OR
    (parent.code = 'ward_secretary' AND child.code = 'volunteer')
)
ON CONFLICT DO NOTHING;

-- 5. Minimum location and finance seed data needed by current screens
DO $$
DECLARE
    district_id_value UUID;
    union_id_value UUID;
    panchayat_id_value UUID;
    village_id_value UUID;
    east_kilai_id_value UUID;
    west_kilai_id_value UUID;
BEGIN
    INSERT INTO public.districts (name, name_ta)
    VALUES ('Tiruvallur', 'Tiruvallur')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO district_id_value;

    INSERT INTO public.unions (district_id, name, name_ta)
    VALUES (district_id_value, 'Gummidipoondi', 'Gummidipoondi')
    ON CONFLICT (district_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO union_id_value;

    INSERT INTO public.panchayats (union_id, name, name_ta)
    VALUES (union_id_value, 'Kavaraipettai', 'Kavaraipettai')
    ON CONFLICT (union_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO panchayat_id_value;

    INSERT INTO public.villages (panchayat_id, name, name_ta)
    VALUES (panchayat_id_value, 'Kavaraipettai Village', 'Kavaraipettai Village')
    ON CONFLICT (panchayat_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO village_id_value;

    INSERT INTO public.kilais (village_id, name, name_ta)
    VALUES (village_id_value, 'Kavaraipettai East Kilai', 'Kavaraipettai East Kilai')
    ON CONFLICT (village_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO east_kilai_id_value;

    INSERT INTO public.kilais (village_id, name, name_ta)
    VALUES (village_id_value, 'Kavaraipettai West Kilai', 'Kavaraipettai West Kilai')
    ON CONFLICT (village_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO west_kilai_id_value;

    INSERT INTO public.wards (kilai_id, number, name, name_ta)
    VALUES
        (east_kilai_id_value, 1, 'Ward 1', 'Ward 1'),
        (west_kilai_id_value, 2, 'Ward 2', 'Ward 2')
    ON CONFLICT (kilai_id, number) DO UPDATE SET
        name = EXCLUDED.name,
        name_ta = EXCLUDED.name_ta;
END $$;

INSERT INTO public.accounts (name, type, balance, description) VALUES
('Panchayat Main Cash Chest', 'Cash', 0.00, 'Physical cash container held by the Treasurer.'),
('TVK Panchayat Union Bank Account', 'Bank', 0.00, 'Official local party bank account for electronic and UPI receipts.')
ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 6. Harden the auth trigger for future users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    is_super_admin BOOLEAN := FALSE;
BEGIN
    IF LOWER(new.email) = 'admin@tvkpanchayat.org' THEN
        is_super_admin := TRUE;
    END IF;

    INSERT INTO public.users (id, email, full_name, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
        status = 'active',
        updated_at = NOW(),
        deleted_at = NULL;

    IF is_super_admin THEN
        SELECT id INTO default_role_id FROM public.roles WHERE code = 'super_admin' LIMIT 1;
    ELSE
        SELECT id INTO default_role_id FROM public.roles WHERE code = 'volunteer' LIMIT 1;
    END IF;

    IF default_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (new.id, default_role_id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Repair public profiles for existing Supabase Auth users.
INSERT INTO public.users (id, email, full_name, status)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    'active'
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    status = 'active',
    updated_at = NOW(),
    deleted_at = NULL;

-- 8. Give admin@tvkpanchayat.org super admin access.
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
JOIN public.roles r ON r.code = 'super_admin'
WHERE LOWER(u.email) = 'admin@tvkpanchayat.org'
ON CONFLICT DO NOTHING;

-- 9. Give any existing user without a role the Volunteer role.
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
JOIN public.roles r ON r.code = 'volunteer'
WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = u.id
)
ON CONFLICT DO NOTHING;
