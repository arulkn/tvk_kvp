'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IndianRupee,
  Coins,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  FileText,
  TrendingUp,
  Clock,
  Printer
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { recordContribution } from './actions'

interface CollectionsDashboardProps {
  members: any[]
  contributions: any[]
  defaultSanthaaAmount?: number
}

export default function CollectionsDashboard({
  members,
  contributions,
  defaultSanthaaAmount = 100,
}: CollectionsDashboardProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [amount, setAmount] = useState(defaultSanthaaAmount) // Default monthly Santhaa
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Map contributions by member_id for the selected month YYYY-MM
  const currentMonthFilter = `${month}-01`
  const paymentsMapping: { [memberId: string]: any } = {}
  contributions
    .filter((c) => c.month === currentMonthFilter)
    .forEach((c) => {
      paymentsMapping[c.member_id] = c
    })

  // Calculate metrics
  const activeMembers = members.filter((m) => m.status === 'active')
  const totalExpected = activeMembers.length * defaultSanthaaAmount
  const actualCollected = Object.values(paymentsMapping).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  )
  const outstandingDues = totalExpected - actualCollected
  const collectionPercentage = totalExpected > 0 ? Math.round((actualCollected / totalExpected) * 100) : 0

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !amount || !month || !paymentDate) {
      setError('Please fill in all required fields.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await recordContribution({
        memberId: selectedMember,
        amount: Number(amount),
        month,
        paymentDate,
        remarks,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setOpen(false)
        setSelectedMember('')
        setRemarks('')
        setIsLoading(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  // Filter members list for search matching
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Santhaa Collections</h1>
          <p className="text-slate-400 text-sm">
            Monitor and record monthly cadre subscription contributions (₹{defaultSanthaaAmount}/month standard).
          </p>
        </div>

        {/* Record dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 gap-1.5 px-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold hover:scale-[1.02] cursor-pointer shadow-md">
            <Plus className="w-4 h-4" /> Record Contribution
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-white font-extrabold text-xl">Record subscription (Santhaa)</DialogTitle>
              <DialogDescription className="text-slate-400">
                Log monthly contribution and auto-credit to Panchayat cash ledger.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleRecord} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Select Member *</Label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Cadre --</option>
                  {members
                    .filter((m) => m.status === 'active')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.membership_id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Contribution Month *</Label>
                  <Input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-300 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Amount (INR) *</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Payment Date *</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-300 h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Remarks</Label>
                <Input
                  placeholder="e.g. Paid via UPI"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recording...
                    </>
                  ) : (
                    <>Record Payment</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Dues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{actualCollected.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>Collected for {month}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Dues</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{outstandingDues.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
            <span>Pending collection</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{collectionPercentage}%</p>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${collectionPercentage}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Cadre</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{totalExpected.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>{activeMembers.length} active members</span>
          </div>
        </div>
      </div>

      {/* Cadre Payment Status List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-extrabold text-lg text-white">Dues Status ({month})</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Month Filter Selector */}
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-300 h-8 text-xs w-36"
            />
            <div className="relative w-64">
              <Input
                placeholder="Search member name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 h-8"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950/50 border-b border-slate-900">
              <TableRow className="hover:bg-transparent border-slate-900">
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Membership ID</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Name</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Kilai / Ward</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Amount Paid</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const payment = paymentsMapping[member.id]
                  const isPaid = !!payment

                  return (
                    <TableRow key={member.id} className="hover:bg-slate-900/30 border-slate-900/50">
                      <TableCell className="font-mono text-xs font-bold text-amber-500">{member.membership_id}</TableCell>
                      <TableCell className="font-semibold text-white">{member.name}</TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {member.kilais?.name || '-'} <span className="text-slate-500">(Ward {member.wards?.number || '-'})</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isPaid
                              ? 'border-green-500/25 bg-green-500/10 text-green-400'
                              : 'border-amber-500/25 bg-amber-500/10 text-amber-400'
                          }
                        >
                          {isPaid ? (
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>
                          ) : (
                            <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pending</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-white">
                        {isPaid ? `₹${payment.amount}` : '₹0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPaid ? (
                           <Link
                             href={`/collections/receipt/${payment.id}`}
                             className={cn(
                               buttonVariants({ variant: 'ghost', size: 'sm' }),
                               "text-amber-500 hover:text-amber-400 hover:bg-slate-900"
                             )}
                           >
                             <Printer className="w-3.5 h-3.5 mr-1" /> Print Receipt
                           </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedMember(member.id)
                              setOpen(true)
                            }}
                            className="text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                          >
                            Collect Dues
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No members match search query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
