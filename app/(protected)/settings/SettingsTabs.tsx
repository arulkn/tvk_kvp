'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  MapPin,
  Plus,
  Loader2,
  Settings as SettingsIcon,
  Tag,
  Hash,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { addRole, addVillage, addKilai, addWard } from './actions'

interface SettingsTabsProps {
  roles: any[]
  villages: any[]
  kilais: any[]
  wards: any[]
  panchayatId: string
}

export default function SettingsTabs({
  roles,
  villages,
  kilais,
  wards,
  panchayatId,
}: SettingsTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'roles' | 'locations'>('roles')

  // Dialogs control
  const [roleOpen, setRoleOpen] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [roleCode, setRoleCode] = useState('')
  const [roleNameTa, setRoleNameTa] = useState('')
  const [roleDesc, setRoleDesc] = useState('')

  const [villageOpen, setVillageOpen] = useState(false)
  const [villageName, setVillageName] = useState('')
  const [villageNameTa, setVillageNameTa] = useState('')

  const [kilaiOpen, setKilaiOpen] = useState(false)
  const [kilaiName, setKilaiName] = useState('')
  const [kilaiNameTa, setKilaiNameTa] = useState('')
  const [targetVillage, setTargetVillage] = useState(villages[0]?.id || '')

  const [wardOpen, setWardOpen] = useState(false)
  const [wardNumber, setWardNumber] = useState(1)
  const [targetKilai, setTargetKilai] = useState(kilais[0]?.id || '')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName || !roleCode) {
      setError('Please provide role name and unique code.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await addRole({
        code: roleCode,
        name: roleName,
        name_ta: roleNameTa,
        description: roleDesc,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setRoleOpen(false)
        setRoleName('')
        setRoleCode('')
        setRoleNameTa('')
        setRoleDesc('')
        setIsLoading(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  const handleAddVillage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!villageName) {
      setError('Please provide village name.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await addVillage({
        name: villageName,
        name_ta: villageNameTa,
        panchayatId,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setVillageOpen(false)
        setVillageName('')
        setVillageNameTa('')
        setIsLoading(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  const handleAddKilai = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kilaiName || !targetVillage) {
      setError('Please provide kilai name and select target village.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await addKilai({
        name: kilaiName,
        name_ta: kilaiNameTa,
        villageId: targetVillage,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setKilaiOpen(false)
        setKilaiName('')
        setKilaiNameTa('')
        setIsLoading(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wardNumber || !targetKilai) {
      setError('Please specify ward number and select kilai unit.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await addWard({
        number: Number(wardNumber),
        kilaiId: targetKilai,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setWardOpen(false)
        setWardNumber((prev) => prev + 1)
        setIsLoading(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-amber-500" /> Master Data Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Configure political roles and local administrative units for Kavaraipettai Panchayat.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-slate-900 pb-px">
        <button
          onClick={() => {
            setActiveTab('roles')
            setError(null)
          }}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-amber-500 text-white bg-slate-900/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Party Roles
        </button>

        <button
          onClick={() => {
            setActiveTab('locations')
            setError(null)
            if (villages.length > 0 && !targetVillage) {
              setTargetVillage(villages[0].id)
            }
            if (kilais.length > 0 && !targetKilai) {
              setTargetKilai(kilais[0].id)
            }
          }}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'border-amber-500 text-white bg-slate-900/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" /> Location Structure
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-sm max-w-3xl mx-auto">
          {error}
        </div>
      )}

      {/* Tab 1: Roles Management */}
      {activeTab === 'roles' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-white">Configured Political Roles</h3>
            
            <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
              <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all outline-none select-none h-8 gap-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-500 text-white hover:scale-[1.02] cursor-pointer shadow-md">
                <Plus className="w-4 h-4" /> Add Custom Role
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-white font-extrabold text-xl">Create Custom Party Role</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Define a new organizational role.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddRole} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-bold text-xs uppercase">Role Code *</Label>
                    <Input
                      placeholder="e.g. youth_wing_coordinator"
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-bold text-xs uppercase">Role Name (English) *</Label>
                    <Input
                      placeholder="e.g. Youth Wing Coordinator"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-bold text-xs uppercase">Role Name (Tamil)</Label>
                    <Input
                      placeholder="e.g. இளைஞரணி ஒருங்கிணைப்பாளர்"
                      value={roleNameTa}
                      onChange={(e) => setRoleNameTa(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 font-bold text-xs uppercase">Role Description</Label>
                    <Input
                      placeholder="e.g. Responsible for mobilizing young volunteers"
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="ghost" onClick={() => setRoleOpen(false)} className="text-slate-400 hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/50 border-b border-slate-900">
                <TableRow className="hover:bg-transparent border-slate-900">
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Code</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Role Title</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Tamil Label</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-900/30 border-slate-900/50">
                    <TableCell className="font-mono text-xs text-amber-500 font-bold">{role.code}</TableCell>
                    <TableCell className="font-semibold text-white">{role.name}</TableCell>
                    <TableCell className="text-slate-300">{role.name_ta || '-'}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{role.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 2: Locations Structure */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          {/* Villages Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Villages</h3>
              
              <Dialog open={villageOpen} onOpenChange={setVillageOpen}>
                <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-xs font-semibold whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 bg-slate-900 text-slate-300 border border-slate-800 hover:text-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Village
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-white font-extrabold text-xl">Create Location Village</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add a new village to Kavaraipettai Panchayat.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddVillage} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Village Name (English) *</Label>
                      <Input
                        placeholder="e.g. Kavaraipettai West"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Village Name (Tamil)</Label>
                      <Input
                        placeholder="e.g. கவரப்பேட்டை மேற்கு"
                        value={villageNameTa}
                        onChange={(e) => setVillageNameTa(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="ghost" onClick={() => setVillageOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Village'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl max-h-[400px] overflow-y-auto p-4 space-y-2">
              {villages.map((v) => (
                <div key={v.id} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">{v.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{v.name_ta || '-'}</p>
                  </div>
                  <Tag className="w-3.5 h-3.5 text-slate-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Kilais Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Neighborhood Kilais</h3>
              
              <Dialog open={kilaiOpen} onOpenChange={setKilaiOpen}>
                <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-xs font-semibold whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 bg-slate-900 text-slate-300 border border-slate-800 hover:text-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Kilai
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-white font-extrabold text-xl">Create Neighborhood Kilai</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add a neighborhood Kilai unit under a village.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddKilai} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Select Village *</Label>
                      <select
                        value={targetVillage}
                        onChange={(e) => setTargetVillage(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                        required
                      >
                        {villages.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Kilai Name (English) *</Label>
                      <Input
                        placeholder="e.g. Kavaraipettai Railway Station Kilai"
                        value={kilaiName}
                        onChange={(e) => setKilaiName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Kilai Name (Tamil)</Label>
                      <Input
                        placeholder="e.g. கவரப்பேட்டை ரயில்வே ஸ்டேஷன் கிளை"
                        value={kilaiNameTa}
                        onChange={(e) => setKilaiNameTa(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="ghost" onClick={() => setKilaiOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Kilai'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl max-h-[400px] overflow-y-auto p-4 space-y-2">
              {kilais.map((k) => (
                <div key={k.id} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between text-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-white">{k.name}</p>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 mt-1 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{k.name_ta || '-'}</p>
                  <p className="text-[9px] text-amber-500/60 font-semibold uppercase tracking-wider mt-1.5">
                    Parent: {k.villages?.name || 'Village'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Wards Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Wards</h3>
              
              <Dialog open={wardOpen} onOpenChange={setWardOpen}>
                <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-xs font-semibold whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-2.5 bg-slate-900 text-slate-300 border border-slate-800 hover:text-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Ward
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-white font-extrabold text-xl">Create Ward Unit</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add a new Ward number under a Kilai unit.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddWard} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Select Parent Kilai *</Label>
                      <select
                        value={targetKilai}
                        onChange={(e) => setTargetKilai(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                        required
                      >
                        {kilais.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-300 font-bold text-xs uppercase">Ward Number *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={wardNumber}
                        onChange={(e) => setWardNumber(Number(e.target.value))}
                        className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                        required
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="ghost" onClick={() => setWardOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Ward'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-xl max-h-[400px] overflow-y-auto p-4 space-y-2">
              {wards.map((w) => (
                <div key={w.id} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between text-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white">Ward {w.number}</p>
                    <Hash className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Name: {w.name}</p>
                  <p className="text-[9px] text-amber-500/60 font-semibold uppercase tracking-wider mt-1.5">
                    Parent Kilai: {w.kilais?.name || 'Kilai'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
