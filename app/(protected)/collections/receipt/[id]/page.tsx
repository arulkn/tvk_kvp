import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import PrintButton from './PrintButton'

interface ReceiptPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch contribution details joining member details and collector details
  const { data: payment } = await supabase
    .from('contributions_santhaa')
    .select('*, members(*, wards(*), kilais(*)), users(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!payment) {
    notFound()
  }

  const formattedMonth = new Date(payment.month).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const formattedDate = new Date(payment.payment_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Navigation and Actions (Hidden in Print) */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4 print:hidden">
        <Link
          href="/collections"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            "text-slate-400 hover:text-white rounded-full"
          )}
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Collections
        </Link>
        <PrintButton />
      </div>

      {/* Printable Receipt Card */}
      <div className="bg-white text-slate-900 p-8 border border-slate-200 rounded-2xl shadow-xl space-y-6 print:border-0 print:shadow-none print:p-0">
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-red-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-red-500 to-amber-400">
                TVK
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-950 uppercase tracking-tight">Tamizhaga Vettri Kazhagam</h1>
              <span className="block text-[9px] text-amber-600 font-bold tracking-widest uppercase">Melpattampakkam Panchayat</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-100 text-green-800 text-xs font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Receipt
            </span>
            <p className="text-[10px] text-slate-500 mt-1.5">No: {payment.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Details List */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-b border-slate-100 pb-6">
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Member Name</span>
            <span className="text-slate-950 font-bold">{payment.members?.name}</span>
          </div>

          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Membership ID</span>
            <span className="text-slate-950 font-mono font-bold text-amber-600">{payment.members?.membership_id}</span>
          </div>

          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Ward / Kilai Placement</span>
            <span className="text-slate-700">
              Ward {payment.members?.wards?.number || '-'} / {payment.members?.kilais?.name || '-'}
            </span>
          </div>

          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Payment Date</span>
            <span className="text-slate-700">{formattedDate}</span>
          </div>
        </div>

        {/* Financial Segment */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex justify-between items-center">
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Subscription Month</span>
            <span className="text-slate-900 font-bold text-base">{formattedMonth}</span>
          </div>
          <div className="text-right">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Amount Paid</span>
            <span className="text-slate-950 font-black text-2xl flex items-center gap-1 justify-end">
              <Landmark className="w-5 h-5 text-amber-600" /> ₹{Number(payment.amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer Seal Signatures */}
        <div className="grid grid-cols-2 pt-12 text-center text-xs">
          <div>
            <div className="w-32 h-0.5 bg-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-900">{payment.members?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase">Cadre Signature</p>
          </div>
          <div>
            <div className="w-32 h-0.5 bg-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-900">{payment.users?.full_name || 'Treasurer Incharge'}</p>
            <p className="text-[10px] text-slate-500 uppercase">Authorized Collector</p>
          </div>
        </div>
      </div>
    </div>
  )
}
