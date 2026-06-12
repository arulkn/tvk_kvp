-- -------------------------------------------------------------
-- RESET ROLE MASTER DATA AND INSERT TAMIL ORGANIZATION ROLES
-- -------------------------------------------------------------
-- Run this in Supabase SQL Editor after the base schema and permissions exist.
--
-- IMPORTANT:
-- Do not use TRUNCATE public.roles CASCADE here. Because roles are referenced
-- by members, user_roles, role_permissions, and role_hierarchy, TRUNCATE CASCADE
-- can remove related operational records. This script safely clears role master
-- relationships, sets member role references to NULL, deletes old role rows,
-- and inserts the new role master list.
-- -------------------------------------------------------------

BEGIN;

-- 1. Clear dependent role relationship data.
DELETE FROM public.role_hierarchy;
DELETE FROM public.role_permissions;
DELETE FROM public.user_roles;

-- 2. Preserve member records while clearing old role references.
UPDATE public.members
SET role_id = NULL
WHERE role_id IS NOT NULL;

-- 3. Delete existing role master rows.
DELETE FROM public.roles;

-- 4. Insert required application admin role.
-- Keep this role so admin login and permission checks continue to work.
INSERT INTO public.roles (code, name, name_ta, description, is_active)
VALUES
(
    'super_admin',
    'Super Administrator',
    'முதன்மை நிர்வாகி',
    'System-wide administrator with full access to all modules and settings.',
    TRUE
);

-- 5. Insert Tamil Nadu Panchayat/Kilai organization roles.
-- Duplicate Tamil titles are intentionally separated with numbered codes/names
-- because role code must be unique.
INSERT INTO public.roles (code, name, name_ta, description, is_active)
VALUES
(
    'ooratchi_seyalalar',
    'Ooratchi Secretary',
    'ஊராட்சி செயலாளர்',
    'Leads and coordinates the Panchayat-level organization.',
    TRUE
),
(
    'ooratchi_inai_seyalalar',
    'Ooratchi Joint Secretary',
    'ஊராட்சி இணை செயலாளர்',
    'Assists the Panchayat Secretary and coordinates assigned administration work.',
    TRUE
),
(
    'ooratchi_porulalar',
    'Ooratchi Treasurer',
    'ஊராட்சி பொருளாளர்',
    'Manages Panchayat-level collections, accounts, receipts, and expense tracking.',
    TRUE
),
(
    'ooratchi_thunai_seyalalar_1',
    'Ooratchi Deputy Secretary 1',
    'ஊராட்சி துணை செயலாளர்',
    'Supports Panchayat-level coordination and assigned organizational duties.',
    TRUE
),
(
    'ooratchi_thunai_seyalalar_2',
    'Ooratchi Deputy Secretary 2',
    'ஊராட்சி துணை செயலாளர்',
    'Supports Panchayat-level coordination and assigned organizational duties.',
    TRUE
),
(
    'ooratchi_seyarkuzhu_uruppinar',
    'Ooratchi Executive Committee Member',
    'ஊராட்சி செயற்குழு உறுப்பினர்',
    'Participates in Panchayat-level executive committee decisions and activities.',
    TRUE
),
(
    'kilai_seyalalar',
    'Kilai Secretary',
    'கிளை செயலாளர்',
    'Leads and coordinates Kilai-level organization work.',
    TRUE
),
(
    'kilai_inai_seyalalar',
    'Kilai Joint Secretary',
    'கிளை இணை செயலாளர்',
    'Assists the Kilai Secretary and coordinates assigned Kilai administration work.',
    TRUE
),
(
    'kilai_porulalar',
    'Kilai Treasurer',
    'கிளை பொருளாளர்',
    'Manages Kilai-level collections and finance coordination.',
    TRUE
),
(
    'kilai_thunai_seyalalar_1',
    'Kilai Deputy Secretary 1',
    'கிளை துணை செயலாளர்',
    'Supports Kilai-level coordination and assigned organizational duties.',
    TRUE
),
(
    'kilai_thunai_seyalalar_2',
    'Kilai Deputy Secretary 2',
    'கிளை துணை செயலாளர்',
    'Supports Kilai-level coordination and assigned organizational duties.',
    TRUE
),
(
    'kilai_seyarkuzhu_uruppinar',
    'Kilai Executive Committee Member',
    'கிளை செயற்குழு உறுப்பினர்',
    'Participates in Kilai-level executive committee decisions and activities.',
    TRUE
);

-- 6. Reattach permissions.
-- Super admin gets every permission.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'super_admin';

-- Ooratchi Secretary gets all operational permissions except role master management.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'ooratchi_seyalalar'
  AND p.code <> 'roles.manage';

-- Ooratchi Joint/Deputy/Executive roles get broad operational access.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view', 'members.create', 'members.edit', 'members.transfer',
    'complaints.view', 'complaints.create', 'complaints.assign', 'complaints.resolve',
    'events.view', 'events.create', 'events.manage', 'events.attendance',
    'accounts.view',
    'tasks.view', 'tasks.create', 'tasks.manage', 'tasks.update'
)
WHERE r.code IN (
    'ooratchi_inai_seyalalar',
    'ooratchi_thunai_seyalalar_1',
    'ooratchi_thunai_seyalalar_2',
    'ooratchi_seyarkuzhu_uruppinar'
);

-- Treasurer roles get finance permissions plus basic operational visibility.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view',
    'events.view',
    'accounts.view', 'accounts.collect', 'accounts.audit',
    'tasks.view', 'tasks.update'
)
WHERE r.code IN ('ooratchi_porulalar', 'kilai_porulalar');

-- Kilai Secretary gets Kilai-level operational permissions.
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
WHERE r.code = 'kilai_seyalalar';

-- Other Kilai roles get focused operational permissions.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
    'members.view', 'members.create',
    'complaints.view', 'complaints.create', 'complaints.resolve',
    'events.view', 'events.attendance',
    'accounts.collect',
    'tasks.view', 'tasks.update'
)
WHERE r.code IN (
    'kilai_inai_seyalalar',
    'kilai_thunai_seyalalar_1',
    'kilai_thunai_seyalalar_2',
    'kilai_seyarkuzhu_uruppinar'
);

-- 7. Rebuild role hierarchy.
INSERT INTO public.role_hierarchy (parent_role_id, child_role_id)
SELECT parent.id, child.id
FROM public.roles parent
JOIN public.roles child ON (
    (parent.code = 'super_admin' AND child.code = 'ooratchi_seyalalar') OR
    (parent.code = 'ooratchi_seyalalar' AND child.code IN (
        'ooratchi_inai_seyalalar',
        'ooratchi_porulalar',
        'ooratchi_thunai_seyalalar_1',
        'ooratchi_thunai_seyalalar_2',
        'ooratchi_seyarkuzhu_uruppinar',
        'kilai_seyalalar'
    )) OR
    (parent.code = 'kilai_seyalalar' AND child.code IN (
        'kilai_inai_seyalalar',
        'kilai_porulalar',
        'kilai_thunai_seyalalar_1',
        'kilai_thunai_seyalalar_2',
        'kilai_seyarkuzhu_uruppinar'
    ))
);

-- 8. Restore admin role assignment for the known admin user.
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
JOIN public.roles r ON r.code = 'super_admin'
WHERE LOWER(u.email) = 'admin@tvkpanchayat.org'
ON CONFLICT DO NOTHING;

COMMIT;
