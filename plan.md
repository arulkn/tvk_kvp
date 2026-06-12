# TVK Panchayat Portal - Project Plan

## Purpose

Build a production-ready Panchayat-level political organization management system for Tamil Nadu local party administration. The application should support real daily operations across members, hierarchy, events, complaints, collections, accounts, tasks, calendar, notifications, reports, and audit tracking.

## Tracking Legend

- `[ ]` Pending
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

Update this file after every implementation session so the team can clearly see what is pending, in progress, completed, or blocked.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Requirements | `[x]` | Requirements captured in `requirements.txt`. |
| Project scaffold | `[ ]` | Next.js app not created yet. |
| Database schema | `[ ]` | Supabase PostgreSQL schema not created yet. |
| Authentication | `[ ]` | Supabase Auth flow not implemented yet. |
| RBAC | `[ ]` | Permission engine and RLS policies not implemented yet. |
| Core modules | `[ ]` | Dashboard, members, complaints, events, collections, accounts, tasks pending. |
| Deployment | `[ ]` | Vercel and Supabase deployment pending. |

## Architecture Decisions

- Frontend: Next.js App Router with TypeScript.
- Styling: Tailwind CSS and ShadCN UI.
- Backend: Supabase.
- Database: PostgreSQL on Supabase with UUID primary keys.
- Authentication: Supabase Auth.
- Authorization: UI-level RBAC plus Supabase Row Level Security.
- Server state: TanStack Query.
- Forms: React Hook Form with Zod validation.
- Calendar: FullCalendar.
- Charts: Recharts.
- Hosting: Vercel.
- Localization: English and Tamil-ready labels/content structure.

## Phase 1 - Foundation

### Goals

Create a clean, maintainable project foundation that supports future modules without major rewrites.

### Tasks

- [ ] Create Next.js App Router project with TypeScript.
- [ ] Install and configure Tailwind CSS.
- [ ] Install and configure ShadCN UI.
- [ ] Configure ESLint, Prettier, and TypeScript strict mode.
- [ ] Add project folder structure:
  - [ ] `app`
  - [ ] `components`
  - [ ] `features`
  - [ ] `lib`
  - [ ] `hooks`
  - [ ] `types`
  - [ ] `schemas`
  - [ ] `services`
  - [ ] `supabase`
  - [ ] `constants`
- [ ] Add environment variable templates.
- [ ] Create base app layout.
- [ ] Create protected dashboard layout.
- [ ] Create public auth layout.
- [ ] Add responsive sidebar navigation.
- [ ] Add top bar with user menu, theme toggle, and language toggle placeholder.
- [ ] Add loading, empty, and error states.

### Acceptance Criteria

- App runs locally without errors.
- TypeScript build passes.
- Main navigation includes Dashboard, Members, Organization, Events, Calendar, Complaints, Collections, Accounts, Tasks, Reports, and Settings.
- Base layout is mobile-friendly.

## Phase 2 - Supabase Setup and Database

### Goals

Create a normalized database schema with indexes, constraints, soft deletes, timestamps, and seed data.

### Tasks

- [ ] Create Supabase project.
- [ ] Configure local Supabase environment if needed.
- [ ] Create database migration folder.
- [ ] Enable required PostgreSQL extensions.
- [ ] Create shared database helpers:
  - [ ] UUID primary keys
  - [ ] `created_at`
  - [ ] `updated_at`
  - [ ] `deleted_at`
  - [ ] trigger for updating `updated_at`
- [ ] Create location tables:
  - [ ] `districts`
  - [ ] `unions`
  - [ ] `panchayats`
  - [ ] `villages`
  - [ ] `kilais`
  - [ ] `wards`
- [ ] Create identity and access tables:
  - [ ] `users`
  - [ ] `roles`
  - [ ] `permissions`
  - [ ] `role_permissions`
  - [ ] `role_hierarchy`
  - [ ] `user_roles`
- [ ] Create member tables:
  - [ ] `members`
  - [ ] `member_transfers`
  - [ ] `member_documents`
- [ ] Create event tables:
  - [ ] `events`
  - [ ] `event_registrations`
  - [ ] `event_attendance`
  - [ ] `event_photos`
  - [ ] `event_reports`
- [ ] Create complaint tables:
  - [ ] `complaints`
  - [ ] `complaint_history`
  - [ ] `complaint_attachments`
- [ ] Create collection tables:
  - [ ] `subscription_plans`
  - [ ] `subscriptions`
  - [ ] `subscription_payments`
  - [ ] `receipts`
- [ ] Create accounts tables:
  - [ ] `accounts`
  - [ ] `transactions`
  - [ ] `expense_categories`
  - [ ] `donations`
- [ ] Create operations tables:
  - [ ] `tasks`
  - [ ] `task_comments`
  - [ ] `notifications`
  - [ ] `audit_logs`
- [ ] Add foreign key constraints.
- [ ] Add indexes for common filters and reports.
- [ ] Add seed data for:
  - [ ] sample roles
  - [ ] permissions
  - [ ] Panchayat/Kilai/Ward hierarchy
  - [ ] sample members
  - [ ] sample complaints
  - [ ] sample events
  - [ ] sample collection records

### Acceptance Criteria

- Migrations can be applied cleanly.
- Seed data can be loaded repeatedly in development.
- Schema supports configurable role hierarchy instead of hardcoded roles.
- Tables include soft delete and audit-friendly fields.

## Phase 3 - Authentication

### Goals

Implement a secure Supabase Auth flow with protected routes and user profile sync.

### Tasks

- [ ] Configure Supabase browser client.
- [ ] Configure Supabase server client.
- [ ] Add login page.
- [ ] Add forgot password flow.
- [ ] Add password reset flow.
- [ ] Add logout action.
- [ ] Add auth middleware for protected routes.
- [ ] Sync authenticated users into the `users` profile table.
- [ ] Display current user profile in the app shell.
- [ ] Add session loading and expired-session handling.

### Acceptance Criteria

- Unauthenticated users cannot access protected pages.
- Authenticated users are redirected to dashboard.
- User profile is available to frontend and server code.

## Phase 4 - RBAC and RLS

### Goals

Create a flexible permission system that works in both the UI and database policies.

### Tasks

- [ ] Define permission naming convention, such as `members.create`, `complaints.resolve`, `accounts.audit`.
- [ ] Implement role creation.
- [ ] Implement role editing.
- [ ] Implement role disabling.
- [ ] Implement permission assignment.
- [ ] Implement reporting hierarchy configuration.
- [ ] Implement role management rules, such as which role can manage which role.
- [ ] Create frontend permission helper.
- [ ] Create route guard helper.
- [ ] Create component-level permission wrapper.
- [ ] Write Supabase RLS policies for:
  - [ ] users
  - [ ] roles
  - [ ] members
  - [ ] complaints
  - [ ] events
  - [ ] collections
  - [ ] accounts
  - [ ] tasks
  - [ ] notifications
  - [ ] audit logs
- [ ] Test access behavior for Panchayat Secretary, Kilai Secretary, Ward Secretary, Treasurer, Organizer, and Volunteer roles.

### Acceptance Criteria

- Users only see actions they have permission to perform.
- Supabase rejects unauthorized reads/writes even if frontend checks are bypassed.
- Role hierarchy is configurable from UI.

## Phase 5 - Shared Application Layer

### Goals

Build reusable patterns before implementing large modules.

### Tasks

- [ ] Add TanStack Query provider.
- [ ] Create shared API/service layer patterns.
- [ ] Create reusable data table component.
- [ ] Create reusable filters component.
- [ ] Create reusable page header component.
- [ ] Create reusable stats card component.
- [ ] Create reusable form field components.
- [ ] Create file upload component.
- [ ] Create confirm dialog component.
- [ ] Create status badge component.
- [ ] Create Tamil Nadu administrative selectors:
  - [ ] Panchayat selector
  - [ ] Village selector
  - [ ] Kilai selector
  - [ ] Ward selector
- [ ] Create shared export utilities for Excel/PDF.
- [ ] Create audit logging helper.

### Acceptance Criteria

- New modules can reuse table, form, filter, and permission patterns.
- Common UI states are consistent across the app.

## Phase 6 - Dashboard

### Goals

Provide a role-based overview of Panchayat operations.

### Tasks

- [ ] Add dashboard service queries.
- [ ] Add total members widget.
- [ ] Add active members widget.
- [ ] Add pending complaints widget.
- [ ] Add upcoming events widget.
- [ ] Add monthly collection status widget.
- [ ] Add village-wise statistics.
- [ ] Add ward-wise statistics.
- [ ] Add recent activities feed.
- [ ] Add attendance summary.
- [ ] Add birthdays and important dates.
- [ ] Add membership growth chart.
- [ ] Add collection performance chart.
- [ ] Add complaint resolution chart.
- [ ] Add event participation chart.
- [ ] Apply role-specific dashboard visibility.

### Acceptance Criteria

- Dashboard loads relevant data for the signed-in user's role.
- Charts render correctly on mobile and desktop.
- Empty states are useful when there is no data.

## Phase 7 - Organization Structure

### Goals

Manage political roles, responsibilities, and reporting hierarchy.

### Tasks

- [ ] Create roles list page.
- [ ] Create role detail page.
- [ ] Create role form.
- [ ] Create permission assignment UI.
- [ ] Create hierarchy tree view.
- [ ] Create reporting relationship editor.
- [ ] Create role disable/restore workflow.
- [ ] Add validation for invalid hierarchy cycles.
- [ ] Add audit logs for role and permission changes.

### Acceptance Criteria

- Admins can configure hierarchy without code changes.
- Hierarchy tree clearly shows relationships like Panchayat Secretary, Kilai Secretary, Ward Secretary, and Volunteers.
- Invalid hierarchy loops are prevented.

## Phase 8 - Member Management

### Goals

Maintain complete cadre/member records with search, filtering, import, export, and transfers.

### Tasks

- [ ] Create members list page.
- [ ] Create member profile page.
- [ ] Create member create/edit form.
- [ ] Add member photo upload.
- [ ] Add search by name, mobile, membership ID.
- [ ] Add filters for village, Panchayat, Kilai, Ward, role, gender, blood group, status.
- [ ] Add member activation/deactivation.
- [ ] Add member transfer between Kilai/Ward.
- [ ] Add transfer history.
- [ ] Add bulk Excel import.
- [ ] Add validation and preview for imports.
- [ ] Add Excel export.
- [ ] Add PDF export.
- [ ] Add birthday and important date support.
- [ ] Add audit logs for member changes.

### Acceptance Criteria

- Member records can be created, updated, searched, filtered, exported, activated, deactivated, and transferred.
- Bulk import handles validation errors clearly.

## Phase 9 - Events and Attendance

### Goals

Manage party activities, registrations, attendance, photos, and reports.

### Tasks

- [ ] Create events list page.
- [ ] Create event detail page.
- [ ] Create event create/edit form.
- [ ] Add event type support:
  - [ ] Public Meetings
  - [ ] Booth Meetings
  - [ ] Village Meetings
  - [ ] Awareness Programs
  - [ ] Membership Drives
  - [ ] Welfare Activities
  - [ ] Blood Donation Camps
  - [ ] Annadhanam
  - [ ] Protests
  - [ ] Campaign Events
- [ ] Add event registration.
- [ ] Add attendance tracking.
- [ ] Add photo uploads.
- [ ] Add event reports.
- [ ] Add reminder notifications.
- [ ] Add event analytics.
- [ ] Add audit logs for event changes.

### Acceptance Criteria

- Events can be planned, attended, documented, and reported.
- Attendance summary is available for dashboard and reports.

## Phase 10 - Calendar and Scheduling

### Goals

Provide a full Panchayat activity calendar.

### Tasks

- [ ] Install and configure FullCalendar.
- [ ] Create calendar page.
- [ ] Add day view.
- [ ] Add week view.
- [ ] Add month view.
- [ ] Show meetings.
- [ ] Show events.
- [ ] Show complaint follow-ups.
- [ ] Show collection deadlines.
- [ ] Show birthdays.
- [ ] Show party announcements.
- [ ] Add color coding by item type.
- [ ] Add recurring event support.
- [ ] Add role-specific calendar visibility.

### Acceptance Criteria

- Calendar displays operational dates clearly.
- Users only see calendar items allowed for their role.

## Phase 11 - Complaint Management

### Goals

Track citizen/public grievances from creation through resolution.

### Tasks

- [ ] Create complaints list page.
- [ ] Create complaint detail page.
- [ ] Create complaint create/edit form.
- [ ] Generate complaint numbers.
- [ ] Add category support:
  - [ ] Water Supply
  - [ ] Street Lights
  - [ ] Roads
  - [ ] Drainage
  - [ ] Garbage
  - [ ] Welfare Scheme
  - [ ] Electricity
  - [ ] Public Infrastructure
  - [ ] Other
- [ ] Add photo attachments.
- [ ] Add assignment workflow.
- [ ] Add status workflow:
  - [ ] New
  - [ ] Assigned
  - [ ] In Progress
  - [ ] Escalated
  - [ ] Resolved
  - [ ] Closed
- [ ] Add complaint timeline.
- [ ] Add escalation workflow.
- [ ] Add resolution notes.
- [ ] Add complaint analytics.
- [ ] Add notifications for assignment and escalation.
- [ ] Add audit logs for complaint changes.

### Acceptance Criteria

- Complaints move through a clear lifecycle.
- Complaint history is preserved.
- Analytics show status and category distribution.

## Phase 12 - Monthly Santhaa Collections

### Goals

Track monthly cadre contributions with dues, receipts, and reports.

### Tasks

- [ ] Create collection setup page.
- [ ] Create monthly collection dashboard.
- [ ] Create member-wise dues page.
- [ ] Create payment entry form.
- [ ] Generate receipts.
- [ ] Add payment history.
- [ ] Add collector assignment.
- [ ] Add pending dues view.
- [ ] Add village-wise reports.
- [ ] Add ward-wise reports.
- [ ] Add monthly trends chart.
- [ ] Add collection percentage widget.
- [ ] Add outstanding dues widget.
- [ ] Add audit logs for collection changes.

### Acceptance Criteria

- Monthly payments can be recorded and audited.
- Pending dues are visible by member, village, ward, and month.
- Receipt generation works.

## Phase 13 - Accounts and Finance

### Goals

Support basic accounting for local political operations.

### Tasks

- [ ] Create accounts dashboard.
- [ ] Add income tracking.
- [ ] Add expense tracking.
- [ ] Add donation tracking.
- [ ] Link Santhaa collections to finance summaries.
- [ ] Add expense categories:
  - [ ] Event Expenses
  - [ ] Welfare Activities
  - [ ] Office Expenses
  - [ ] Printing
  - [ ] Campaign Materials
  - [ ] Miscellaneous
- [ ] Add monthly statement report.
- [ ] Add cash book report.
- [ ] Add category reports.
- [ ] Add treasurer dashboard.
- [ ] Add audit logs for finance changes.

### Acceptance Criteria

- Treasurer can view income, expense, donation, and collection summaries.
- Monthly statements and cash book reports are available.

## Phase 14 - Task Management

### Goals

Assign and track responsibilities across Kilai, Ward, and volunteer levels.

### Tasks

- [ ] Create tasks list page.
- [ ] Create task detail page.
- [ ] Create task create/edit form.
- [ ] Add assignment to Kilai Secretary, Ward Secretary, and Volunteers.
- [ ] Add priority support.
- [ ] Add due date support.
- [ ] Add status workflow.
- [ ] Add comments or updates.
- [ ] Add overdue indicators.
- [ ] Add task assignment notifications.
- [ ] Add audit logs for task changes.

### Acceptance Criteria

- Tasks can be assigned, updated, completed, and monitored.
- Assigned users receive notifications.

## Phase 15 - Notifications

### Goals

Provide in-app operational alerts.

### Tasks

- [ ] Create notifications table policies.
- [ ] Create notification service.
- [ ] Create notification bell in top bar.
- [ ] Create notifications page.
- [ ] Add read/unread support.
- [ ] Add notification types:
  - [ ] New Complaint
  - [ ] Event Reminder
  - [ ] Task Assignment
  - [ ] Pending Collection
  - [ ] Member Approval
- [ ] Add notification cleanup/archive option.

### Acceptance Criteria

- Users receive relevant in-app notifications.
- Notifications can be marked as read.

## Phase 16 - Reports

### Goals

Give administrators practical exports and summaries for real-world usage.

### Tasks

- [ ] Create reports landing page.
- [ ] Add member reports.
- [ ] Add village-wise reports.
- [ ] Add ward-wise reports.
- [ ] Add event participation reports.
- [ ] Add complaint status reports.
- [ ] Add collection reports.
- [ ] Add finance reports.
- [ ] Add task performance reports.
- [ ] Add Excel export.
- [ ] Add PDF export.
- [ ] Add date range filtering.
- [ ] Add role-based report visibility.

### Acceptance Criteria

- Reports are useful for meetings and administrative review.
- Exports contain clean, readable data.

## Phase 17 - Settings, Localization, and Theme

### Goals

Add configuration, Tamil/English readiness, and dark mode.

### Tasks

- [ ] Create settings page.
- [ ] Add organization profile settings.
- [ ] Add location management settings.
- [ ] Add role/permission settings entry point.
- [ ] Add Tamil and English label structure.
- [ ] Add language toggle.
- [ ] Add dark mode support.
- [ ] Add theme persistence.
- [ ] Review all labels for Tamil Nadu administrative terminology.

### Acceptance Criteria

- App uses familiar terms such as Panchayat, Kilai, Ward, Union, Secretary, Treasurer, Organizer, and Volunteer.
- Dark mode and language toggle foundation work consistently.

## Phase 18 - Audit Trail

### Goals

Track important actions for accountability.

### Tasks

- [ ] Create audit logging service.
- [ ] Log create/update/delete actions.
- [ ] Log old and new values where appropriate.
- [ ] Add audit log list page.
- [ ] Add filters by user, module, action, and date.
- [ ] Restrict audit log visibility by permission.
- [ ] Add audit log export.

### Acceptance Criteria

- Important changes are traceable.
- Audit logs cannot be edited by normal users.

## Phase 19 - Testing and Quality

### Goals

Verify the application is reliable enough for production use.

### Tasks

- [ ] Add unit test setup.
- [ ] Add form validation tests.
- [ ] Add service-layer tests.
- [ ] Add RBAC helper tests.
- [ ] Add RLS policy test strategy.
- [ ] Add end-to-end test setup.
- [ ] Test authentication flows.
- [ ] Test member workflow.
- [ ] Test complaint workflow.
- [ ] Test collection workflow.
- [ ] Test role restrictions.
- [ ] Test mobile layouts.
- [ ] Run accessibility checks.
- [ ] Run production build.

### Acceptance Criteria

- Core workflows are tested.
- Production build passes.
- Role restrictions are verified beyond visual checks.

## Phase 20 - Deployment

### Goals

Deploy the app with production-ready configuration.

### Tasks

- [ ] Create Vercel project.
- [ ] Configure production environment variables.
- [ ] Configure Supabase production project.
- [ ] Apply database migrations.
- [ ] Apply RLS policies.
- [ ] Load production seed roles and permissions.
- [ ] Configure auth redirect URLs.
- [ ] Configure storage buckets and policies.
- [ ] Add deployment documentation.
- [ ] Add backup and recovery notes.
- [ ] Perform production smoke test.

### Acceptance Criteria

- App is live on Vercel.
- Supabase production data and policies are configured.
- Login and core workflows work in production.

## Module Priority

| Priority | Module | Reason |
| --- | --- | --- |
| 1 | Foundation, Auth, RBAC, Database | Required before real modules can work safely. |
| 2 | Members, Organization | Core identity and hierarchy data. |
| 3 | Dashboard, Complaints, Events, Tasks | Daily operations. |
| 4 | Collections, Accounts, Reports | Financial and administrative control. |
| 5 | Calendar, Notifications, Audit Trail | Operational polish and accountability. |
| 6 | Localization, Theme, Deployment | Production readiness and user comfort. |

## Suggested Initial Milestones

### Milestone 1 - Working App Shell

- [ ] Next.js app created.
- [ ] Tailwind and ShadCN configured.
- [ ] Auth pages created.
- [ ] Protected dashboard layout created.
- [ ] Navigation created.

### Milestone 2 - Database and Auth Ready

- [ ] Supabase connected.
- [ ] Initial schema created.
- [ ] User profile sync working.
- [ ] Roles and permissions seeded.
- [ ] Basic RLS policies enabled.

### Milestone 3 - Organization and Members MVP

- [ ] Roles managed from UI.
- [ ] Hierarchy visible.
- [ ] Members CRUD complete.
- [ ] Search and filters complete.
- [ ] Member import/export complete.

### Milestone 4 - Operations MVP

- [ ] Complaints lifecycle complete.
- [ ] Events and attendance complete.
- [ ] Tasks complete.
- [ ] Calendar displays operational items.

### Milestone 5 - Finance and Reports MVP

- [ ] Santhaa collection complete.
- [ ] Accounts dashboard complete.
- [ ] Reports and exports complete.

### Milestone 6 - Production Release

- [ ] Testing complete.
- [ ] Audit trail complete.
- [ ] Notifications complete.
- [ ] Deployment complete.
- [ ] Production smoke test complete.

## Open Questions

- [ ] What is the official organization name and branding to show in the app?
- [ ] Should the first version support only one Panchayat or multiple Panchayats?
- [ ] Who are the first production roles and admin users?
- [ ] Should member IDs be manually entered, auto-generated, or both?
- [ ] Should Santhaa amount be fixed for all members or configurable by role/member?
- [ ] Are online payments required now, or is manual cash/UPI entry enough for version 1?
- [ ] Should citizens have a public complaint submission page, or only internal users can create complaints?
- [ ] Is SMS/WhatsApp notification required, or only in-app notifications for version 1?
- [ ] Which Tamil labels are mandatory for the first release?

## Definition of Done

A task is complete only when:

- [ ] Implementation is finished.
- [ ] Validation and error states are handled.
- [ ] Role permissions are applied.
- [ ] Database policies are considered where data access is involved.
- [ ] Mobile layout is checked.
- [ ] Relevant tests or manual verification are completed.
- [ ] `plan.md` is updated.

## Daily Work Log

Use this section to track progress over time.

| Date | Work Completed | Pending / Blockers |
| --- | --- | --- |
| 2026-06-12 | Created project plan from requirements. | Implementation not started. |
