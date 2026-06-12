'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  GitBranch,
  Shield,
  Heart,
  User,
  History,
  Send,
  Loader2
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { transferMember } from '../actions'

interface MemberProfileProps {
  member: any
  transfers: any[]
  kilais: any[]
  wards: any[]
}

export default function MemberProfile({
  member,
  transfers,
  kilais,
  wards,
}: MemberProfileProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [toKilai, setToKilai] = useState(member.kilai_id)
  const [toWard, setToWard] = useState(member.ward_id)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTransfer = async () => {
    if (toKilai === member.kilai_id && toWard === member.ward_id) {
      setError('Please select a different Kilai or Ward to transfer.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the transfer.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await transferMember({
        memberId: member.id,
        toKilaiId: toKilai,
        toWardId: toWard,
        fromKilaiId: member.kilai_id,
        fromWardId: member.ward_id,
        reason,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setOpen(false)
        router.refresh()
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/members"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              "text-slate-400 hover:text-white rounded-full"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{member.name}</h1>
            <p className="text-xs text-amber-500 font-mono font-bold">{member.membership_id || 'NO MEMBERSHIP ID'}</p>
          </div>
        </div>

        {/* Transfer Cadre Action */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-bold whitespace-nowrap transition-all outline-none select-none h-8 gap-1.5 px-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shadow-md">
            <GitBranch className="w-4 h-4" /> Transfer Cadre
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-white font-extrabold text-xl">Transfer Cadre Unit</DialogTitle>
              <DialogDescription className="text-slate-400">
                Move {member.name} to a different Kilai or Ward within the Panchayat.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Target Kilai</Label>
                <select
                  value={toKilai}
                  onChange={(e) => setToKilai(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                >
                  {kilais.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Target Ward</Label>
                <select
                  value={toWard}
                  onChange={(e) => setToWard(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      Ward {w.number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Reason for Transfer</Label>
                <Input
                  placeholder="e.g. Relocated to North village"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-400 font-bold text-slate-950"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Transferring...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Confirm Transfer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Basic Profile Info */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-amber-500/20 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <User className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-xl font-black text-white">{member.name}</h2>
            <p className="text-xs text-amber-500 font-medium tracking-wider uppercase mt-1">
              {member.roles?.name || 'Volunteer'}
            </p>
            <Badge
              variant="outline"
              className={`mt-3 ${
                member.status === 'active'
                  ? 'border-green-500/25 bg-green-500/10 text-green-400'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              {member.status}
            </Badge>
          </div>

          <div className="border-t border-slate-900 pt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Phone className="w-4.5 h-4.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-600">Contact Number</p>
                <p className="text-slate-200">{member.mobile_number}</p>
                {member.alternate_number && <p className="text-xs text-slate-500">Alt: {member.alternate_number}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <MapPin className="w-4.5 h-4.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-600">Location Placement</p>
                <p className="text-slate-200">{member.wards?.name || `Ward ${member.wards?.number}`}</p>
                <p className="text-xs text-slate-500">{member.kilais?.name}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{member.villages?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="w-4.5 h-4.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-600">Joining Date</p>
                <p className="text-slate-200">
                  {member.joining_date ? new Date(member.joining_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cards: Detailed Profile Details and Transfers */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
            <h3 className="font-extrabold text-lg text-white mb-6 border-b border-slate-900 pb-2">Cadre Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Gender</span>
                <span className="text-slate-200 font-semibold">{member.gender || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Blood Group</span>
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-red-500/10" /> {member.blood_group || '-'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Date of Birth</span>
                <span className="text-slate-200">
                  {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }) : '-'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Occupation</span>
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {member.occupation || '-'}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-900">
              <span className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Residential Address</span>
              <span className="text-slate-300 leading-relaxed">{member.address || '-'}</span>
            </div>
          </div>

          {/* Transfer Timeline Card */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
            <h3 className="font-extrabold text-lg text-white mb-6 border-b border-slate-900 pb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" /> Unit Transfer Log
            </h3>
            {transfers.length > 0 ? (
              <div className="relative border-l border-slate-800 ml-3.5 pl-6 space-y-6 py-2">
                {transfers.map((t) => (
                  <div key={t.id} className="relative">
                    {/* Circle Pin */}
                    <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-950" />
                    <div>
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(t.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        Transferred to {t.to_kilais?.name || '-'}{' '}
                        <span className="text-slate-500 text-xs">(Ward {t.to_wards?.number || '-'})</span>
                      </p>
                      {t.reason && <p className="text-xs text-slate-400 mt-1 italic">" {t.reason} "</p>}
                      <p className="text-[10px] text-slate-500 mt-1">
                        Approved by: {t.users?.full_name || 'System Administrator'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-sm text-slate-500 italic">
                No transfer history recorded. Member remains in original unit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
