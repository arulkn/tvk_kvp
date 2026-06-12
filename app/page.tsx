import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { Shield, Users, Calendar, HelpCircle, FileText, Landmark } from 'lucide-react'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-tr from-red-500 to-amber-400">
                TVK
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                தமிழக வெற்றி கழகம்
              </span>
              <span className="block text-[10px] text-amber-500 font-medium tracking-widest uppercase">
                Panchayat Portal
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md hover:from-red-500 hover:to-amber-400 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-24 sm:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" /> Panchayat Operations Management
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-none">
                Empowering Local Leadership,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500">
                  Serving the Grassroots
                </span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Streamlining cadre membership, grievance redressal, campaign events, task delegations, and local party finances at the Panchayat, Kilai, and Ward levels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-bold bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-[size:200%_auto] text-white shadow-lg shadow-amber-500/10 hover:bg-right transition-all duration-500 hover:scale-[1.02]"
                >
                  Access Administration Dashboard
                </Link>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cadre & Member Directory</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Maintain digital profiles for all party members with smart search, filters by Kilai/Ward, age details, and official transfer history.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Grievance Redressal</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Log, assign, track, and resolve citizen complaints on water, infrastructure, and welfare schemes with full history logs.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Events & Attendance</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Schedule booth meetings, blood camps, public rallies, and campaign drives. Check and record attendee counts.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Santhaa & Accounts</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Track monthly Santhaa collection percentage, outstanding dues, local donations, and operational expenses in a transparent cash ledger.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Task Management</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Assign actionable items to Kilai Secretaries, Ward Secretaries, and volunteers. Monitor deadlines and completion rates.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 group hover:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Hierarchical RBAC</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Secure administration access via custom roles (Panchayat Incharge, Treasurer, Volunteer) matching local organizational hierarchies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Tamizhaga Vettri Kazhagam (TVK) Local Administration. All rights reserved.</p>
      </footer>
    </div>
  )
}
