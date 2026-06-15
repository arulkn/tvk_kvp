-- 1. Insert the 'manager' role
INSERT INTO public.roles (code, name, name_ta, description, is_active)
VALUES (
    'manager',
    'Manager',
    'மேலாளர்',
    'Can view/register members and record monthly Santhaa contributions.',
    TRUE
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    name_ta = EXCLUDED.name_ta,
    description = EXCLUDED.description;

-- 2. Associate permissions to the 'manager' role
-- Manager can view/create members and view/collect accounts
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'manager'
  AND p.code IN (
      'members.view', 
      'members.create', 
      'accounts.view', 
      'accounts.collect', 
      'events.view'
  )
ON CONFLICT DO NOTHING;

-- 3. Add manager to hierarchy (Super Admin can manage Manager, Manager can manage Volunteers)
INSERT INTO public.role_hierarchy (parent_role_id, child_role_id)
SELECT parent.id, child.id
FROM public.roles parent
JOIN public.roles child ON (
    (parent.code = 'super_admin' AND child.code = 'manager') OR
    (parent.code = 'manager' AND child.code = 'volunteer')
)
ON CONFLICT DO NOTHING;
