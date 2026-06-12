import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, createClient } from '@/lib/supabase/server'
import { logout } from '../(auth)/login/actions'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Calendar,
  HelpCircle,
  Landmark,
  Coins,
  CheckSquare,
  FileBarChart,
  Settings,
  Bell,
  LogOut,
  Menu,
  Shield,
  MapPin,
  User as UserIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string;
  nameTa: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', nameTa: 'முகப்பு', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', nameTa: 'உறுப்பினர்கள்', href: '/members', icon: Users },
  { name: 'Organization', nameTa: 'அமைப்பு', href: '/organization', icon: GitBranch },
  { name: 'Events', nameTa: 'நிகழ்வுகள்', href: '/events', icon: Calendar },
  { name: 'Complaints', nameTa: 'புகார்கள்', href: '/complaints', icon: HelpCircle },
  { name: 'Collections', nameTa: 'சந்தா வசூல்', href: '/collections', icon: Coins },
  { name: 'Accounts', nameTa: 'நிதி கணக்குகள்', href: '/accounts', icon: Landmark },
  { name: 'Tasks', nameTa: 'பணிகள்', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', nameTa: 'அறிக்கைகள்', href: '/reports', icon: FileBarChart },
  { name: 'Settings', nameTa: 'அமைப்புகள்', href: '/settings', icon: Settings },
]

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch public user profile and roles
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('*, user_roles(role_id, roles(code, name, name_ta))')
    .eq('id', user.id)
    .single()

  const roleName = profile?.user_roles?.[0]?.roles?.name || 'Volunteer'
  const roleNameTa = profile?.user_roles?.[0]?.roles?.name_ta || 'தொண்டர்'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Static Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-900 bg-slate-950">
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-900">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 via-amber-500 to-red-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-black text-xs text-transparent bg-clip-text bg-gradient-to-tr from-red-500 to-amber-400">
                TVK
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                தமிழக வெற்றி கழகம்
              </span>
              <span className="block text-[8px] text-amber-500 font-medium tracking-widest uppercase">
                Panchayat Portal
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all duration-200"
              >
                <item.icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-medium">{item.nameTa}</span>
                </div>
              </Link>
            ))}
          </nav>
          {/* User profile block */}
          <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold shadow-inner uppercase">
                {profile?.full_name?.substring(0, 2) || user.email?.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Administrator'}</p>
                <p className="text-[10px] text-amber-500 font-medium truncate flex items-center gap-1">
                  <Shield className="w-3 h-3 shrink-0" /> {roleName} ({roleNameTa})
                </p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
              >
                <LogOut className="h-4.5 w-4.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Kavaraipettai Panchayat</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white rounded-full bg-slate-900/30 border border-slate-900">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </Button>
            <div className="w-px h-6 bg-slate-900" />
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                {profile?.full_name?.substring(0, 2) || user.email?.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
