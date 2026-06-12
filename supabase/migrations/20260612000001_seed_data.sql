-- -------------------------------------------------------------
-- SEED ROLES
-- -------------------------------------------------------------
INSERT INTO public.roles (code, name, name_ta, description) VALUES
('super_admin', 'Super Administrator', 'முதன்மை நிர்வாகி', 'System-wide access to all configurations and management modules.'),
('panchayat_secretary', 'Panchayat Secretary', 'பஞ்சாயத்து செயலாளர்', 'Administrative head of the Panchayat unit.'),
('kilai_secretary', 'Kilai Secretary', 'கிளை செயலாளர்', 'In charge of a Kilai (neighborhood unit) within the Panchayat.'),
('ward_secretary', 'Ward Secretary', 'வார்டு செயலாளர்', 'In charge of a specific Ward administrative unit.'),
('treasurer', 'Treasurer', 'பொருளாளர்', 'Responsible for handling Santhaa collections, local donations, and expenses.'),
('volunteer', 'Volunteer', 'களப்பணியாளர் / தொண்டர்', 'Standard member who can be assigned operational tasks.');

-- -------------------------------------------------------------
-- SEED PERMISSIONS
-- -------------------------------------------------------------
INSERT INTO public.permissions (code, name, description) VALUES
('members.view', 'View Members', 'Allow viewing member profile and lists.'),
('members.create', 'Create Members', 'Allow adding new party members.'),
('members.edit', 'Edit Members', 'Allow editing existing member profiles.'),
('members.delete', 'Delete Members', 'Allow deactivating/soft deleting members.'),
('members.transfer', 'Transfer Members', 'Allow transferring members between Kilai/Ward.'),

('complaints.view', 'View Complaints', 'Allow viewing grievances list.'),
('complaints.create', 'Create Complaints', 'Allow adding citizen complaints.'),
('complaints.assign', 'Assign Complaints', 'Allow assigning complaints to volunteers or officers.'),
('complaints.resolve', 'Resolve Complaints', 'Allow marking complaints as Resolved with notes.'),
('complaints.close', 'Close Complaints', 'Allow closing resolved or rejected complaints.'),

('events.view', 'View Events', 'Allow viewing organization calendar and events.'),
('events.create', 'Create Events', 'Allow scheduling new meetings and public programs.'),
('events.manage', 'Manage Events', 'Allow editing, canceling, or uploading photos to events.'),
('events.attendance', 'Record Attendance', 'Allow marking attendance of members at events.'),

('accounts.view', 'View Accounts', 'Allow viewing financial dashboards and statement reports.'),
('accounts.collect', 'Collect Santhaa', 'Allow recording subscription payments and issuing receipts.'),
('accounts.audit', 'Audit Accounts', 'Allow adding manual transactions, income, and expenses.'),

('tasks.view', 'View Tasks', 'Allow viewing delegated tasks.'),
('tasks.create', 'Create Tasks', 'Allow assigning tasks to Kilai/Ward/Volunteer levels.'),
('tasks.manage', 'Manage Tasks', 'Allow editing, deferring, or auditing tasks.'),
('tasks.update', 'Update Task Status', 'Allow updating status of self-assigned tasks.'),

('roles.manage', 'Manage Roles', 'Allow configuring role permissions and reporting hierarchy.');

-- -------------------------------------------------------------
-- ROLE PERMISSIONS MAPPING
-- -------------------------------------------------------------
-- 1. Super Admin: All permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'super_admin';

-- 2. Panchayat Secretary: Almost all permissions except roles.manage
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'panchayat_secretary' AND p.code <> 'roles.manage';

-- 3. Kilai Secretary: Members view/create/edit, complaints view/create/resolve, events view/create/attendance, tasks view/create/update, accounts view/collect
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'kilai_secretary' AND p.code IN (
    'members.view', 'members.create', 'members.edit', 'members.transfer',
    'complaints.view', 'complaints.create', 'complaints.resolve',
    'events.view', 'events.create', 'events.attendance',
    'accounts.view', 'accounts.collect',
    'tasks.view', 'tasks.create', 'tasks.update'
);

-- 4. Ward Secretary: Members view/create, complaints view/create/resolve, events view, tasks view/update, accounts collect
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'ward_secretary' AND p.code IN (
    'members.view', 'members.create',
    'complaints.view', 'complaints.create', 'complaints.resolve',
    'events.view',
    'accounts.collect',
    'tasks.view', 'tasks.update'
);

-- 5. Treasurer: Full accounts view, collect, and audit, plus viewing members and events
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'treasurer' AND p.code IN (
    'members.view', 'events.view',
    'accounts.view', 'accounts.collect', 'accounts.audit',
    'tasks.view', 'tasks.update'
);

-- 6. Volunteer: View members, complaints view/create, events view, tasks view/update
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.code = 'volunteer' AND p.code IN (
    'members.view',
    'complaints.view', 'complaints.create',
    'events.view',
    'tasks.view', 'tasks.update'
);

-- -------------------------------------------------------------
-- SEED ROLE HIERARCHY
-- -------------------------------------------------------------
-- Super Admin manages Panchayat Secretary
-- Panchayat Secretary manages Kilai Secretary, Treasurer
-- Kilai Secretary manages Ward Secretary
-- Ward Secretary manages Volunteer
DO $$
DECLARE
    super_admin_id UUID;
    panchayat_sec_id UUID;
    kilai_sec_id UUID;
    ward_sec_id UUID;
    treasurer_id UUID;
    volunteer_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM public.roles WHERE code = 'super_admin';
    SELECT id INTO panchayat_sec_id FROM public.roles WHERE code = 'panchayat_secretary';
    SELECT id INTO kilai_sec_id FROM public.roles WHERE code = 'kilai_secretary';
    SELECT id INTO ward_sec_id FROM public.roles WHERE code = 'ward_secretary';
    SELECT id INTO treasurer_id FROM public.roles WHERE code = 'treasurer';
    SELECT id INTO volunteer_id FROM public.roles WHERE code = 'volunteer';

    INSERT INTO public.role_hierarchy (parent_role_id, child_role_id) VALUES
    (super_admin_id, panchayat_sec_id),
    (panchayat_sec_id, kilai_sec_id),
    (panchayat_sec_id, treasurer_id),
    (kilai_sec_id, ward_sec_id),
    (ward_sec_id, volunteer_id);
END $$;

-- -------------------------------------------------------------
-- SEED LOCATION DATA (Tamil Nadu sample structure)
-- -------------------------------------------------------------
DO $$
DECLARE
    cuddalore_id UUID;
    panruti_union_id UUID;
    melpat_panc_id UUID;
    melpat_vill_id UUID;
    north_kilai_id UUID;
    south_kilai_id UUID;
    ward1_id UUID;
    ward2_id UUID;
BEGIN
    -- District
    INSERT INTO public.districts (name, name_ta) 
    VALUES ('Cuddalore', 'கடலூர்')
    RETURNING id INTO cuddalore_id;

    -- Union
    INSERT INTO public.unions (district_id, name, name_ta) 
    VALUES (cuddalore_id, 'Panruti', 'பண்ருட்டி')
    RETURNING id INTO panruti_union_id;

    -- Panchayat
    INSERT INTO public.panchayats (union_id, name, name_ta) 
    VALUES (panruti_union_id, 'Melpattampakkam', 'மேல்பட்டாம்பாக்கம்')
    RETURNING id INTO melpat_panc_id;

    -- Village
    INSERT INTO public.villages (panchayat_id, name, name_ta) 
    VALUES (melpat_panc_id, 'Melpattampakkam Village', 'மேல்பட்டாம்பாக்கம் கிராமம்')
    RETURNING id INTO melpat_vill_id;

    -- Kilais (Neighborhood Units)
    INSERT INTO public.kilais (village_id, name, name_ta) 
    VALUES 
    (melpat_vill_id, 'Melpattampakkam North Kilai', 'மேல்பட்டாம்பாக்கம் வடக்கு கிளை') RETURNING id INTO north_kilai_id;
    
    INSERT INTO public.kilais (village_id, name, name_ta) 
    VALUES 
    (melpat_vill_id, 'Melpattampakkam South Kilai', 'மேல்பட்டாம்பாக்கம் தெற்கு கிளை') RETURNING id INTO south_kilai_id;

    -- Wards
    INSERT INTO public.wards (kilai_id, number, name, name_ta) 
    VALUES 
    (north_kilai_id, 1, 'Ward 1', 'வார்டு 1') RETURNING id INTO ward1_id;
    
    INSERT INTO public.wards (kilai_id, number, name, name_ta) 
    VALUES 
    (south_kilai_id, 2, 'Ward 2', 'வார்டு 2') RETURNING id INTO ward2_id;
END $$;

-- -------------------------------------------------------------
-- SEED FINANCIAL ACCOUNTS
-- -------------------------------------------------------------
INSERT INTO public.accounts (name, type, balance, description) VALUES
('Panchayat Main Cash Chest', 'Cash', 0.00, 'Physical cash container held by the Treasurer.'),
('TVK Panchayat Union Bank Account', 'Bank', 0.00, 'Official local party bank account for electronic and UPI receipts.');
