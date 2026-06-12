'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FilterX, Eye, ArrowUpRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BLOOD_GROUPS, MEMBER_STATUSES } from '@/constants'

interface MembersTableProps {
  initialMembers: any[]
  roles: any[]
  villages: any[]
  kilais: any[]
  wards: any[]
}

export default function MembersTable({
  initialMembers,
  roles,
  villages,
  kilais,
  wards,
}: MembersTableProps) {
  const [search, setSearch] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('all')
  const [selectedKilai, setSelectedKilai] = useState('all')
  const [selectedWard, setSelectedWard] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedBlood, setSelectedBlood] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const resetFilters = () => {
    setSearch('')
    setSelectedVillage('all')
    setSelectedKilai('all')
    setSelectedWard('all')
    setSelectedRole('all')
    setSelectedBlood('all')
    setSelectedStatus('all')
  }

  // Perform multi-dimensional client-side filtering
  const filteredMembers = initialMembers.filter((m) => {
    const searchString = `${m.name} ${m.membership_id || ''} ${m.mobile_number}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())

    const matchesVillage = selectedVillage === 'all' || m.village_id === selectedVillage
    const matchesKilai = selectedKilai === 'all' || m.kilai_id === selectedKilai
    const matchesWard = selectedWard === 'all' || m.ward_id === selectedWard
    const matchesRole = selectedRole === 'all' || m.role_id === selectedRole
    const matchesBlood = selectedBlood === 'all' || m.blood_group === selectedBlood
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus

    return (
      matchesSearch &&
      matchesVillage &&
      matchesKilai &&
      matchesWard &&
      matchesRole &&
      matchesBlood &&
      matchesStatus
    )
  })

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cadre Directory</h1>
          <p className="text-slate-400 text-sm">
            Manage and monitor party members and field workers across all Wards.
          </p>
        </div>
        <Link
          href="/members/new"
          className={cn(
            buttonVariants({ variant: 'default' }),
            "bg-gradient-to-r from-red-600 to-amber-500 font-bold hover:scale-[1.02] transition-transform text-white"
          )}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Link>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search name, mobile, id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950/40 border-slate-800 text-slate-100"
          />
        </div>

        {/* Village Select */}
        <Select value={selectedVillage} onValueChange={(val) => setSelectedVillage(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Village" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Villages</SelectItem>
            {villages.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} ({v.name_ta})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Kilai Select */}
        <Select value={selectedKilai} onValueChange={(val) => setSelectedKilai(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Kilai" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Kilais</SelectItem>
            {kilais.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ward Select */}
        <Select value={selectedWard} onValueChange={(val) => setSelectedWard(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Ward" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Wards</SelectItem>
            {wards.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                Ward {w.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Select */}
        <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Blood Group Select */}
        <Select value={selectedBlood} onValueChange={(val) => setSelectedBlood(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Blood Groups</SelectItem>
            {BLOOD_GROUPS.map((bg) => (
              <SelectItem key={bg} value={bg}>
                {bg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || 'all')}>
          <SelectTrigger className="bg-slate-950/40 border-slate-800 text-slate-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
            <SelectItem value="all">All Statuses</SelectItem>
            {MEMBER_STATUSES.map((st) => (
              <SelectItem key={st.value} value={st.value}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        <Button variant="ghost" onClick={resetFilters} className="text-slate-400 hover:text-white border border-slate-800/60 bg-slate-900/10">
          <FilterX className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      {/* Grid count display */}
      <div className="text-xs font-semibold text-slate-400">
        Found {filteredMembers.length} members out of {initialMembers.length} total.
      </div>

      {/* Members Table */}
      <div className="border border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/50 border-b border-slate-900">
            <TableRow className="hover:bg-transparent border-slate-900">
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Membership ID</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Name</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Mobile Number</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Ward / Kilai</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Role</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Blood Group</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs text-center">Status</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-slate-900/30 border-slate-900/50">
                  <TableCell className="font-mono text-xs font-bold text-amber-500">
                    {member.membership_id || 'PENDING'}
                  </TableCell>
                  <TableCell className="font-semibold text-white">{member.name}</TableCell>
                  <TableCell className="text-slate-300">{member.mobile_number}</TableCell>
                  <TableCell className="text-slate-400 text-xs">
                    <div>{member.wards?.name || `Ward ${member.wards?.number || '-'}`}</div>
                    <div className="text-[10px] text-slate-500">{member.kilais?.name || '-'}</div>
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs font-semibold">
                    {member.roles?.name || '-'}
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono text-center md:text-left">{member.blood_group || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        member.status === 'active'
                          ? 'border-green-500/25 bg-green-500/10 text-green-400'
                          : member.status === 'inactive'
                          ? 'border-slate-800 bg-slate-900 text-slate-400'
                          : 'border-red-500/25 bg-red-500/10 text-red-400'
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/members/${member.id}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        "text-amber-500 hover:text-amber-400 hover:bg-slate-900 inline-flex items-center"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  No members found matching the selected filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
