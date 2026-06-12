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
  ArrowRight,
  Pencil,
  Trash2,
  User as UserIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
import {
  addRole,
  addVillage,
  addKilai,
  addWard,
  updateRole,
  updateVillage,
  updateKilai,
  updateWard,
  deleteRole,
  deleteVillage,
  deleteKilai,
  deleteWard,
  updatePanchayatSettings,
  updateUserRole,
} from './actions'

type MasterType = 'role' | 'village' | 'kilai' | 'ward'

type EditTarget = {
  type: MasterType
  item: any
} | null

type DeleteTarget = {
  type: MasterType
  item: any
} | null

interface SettingsTabsProps {
  roles: any[]
  villages: any[]
  kilais: any[]
  wards: any[]
  panchayatId: string
  defaultSanthaaAmount: number
  portalUsers: any[]
}

export default function SettingsTabs({
  roles,
  villages,
  kilais,
  wards,
  panchayatId,
  defaultSanthaaAmount,
  portalUsers,
}: SettingsTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'roles' | 'locations' | 'general' | 'users'>('roles')

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

  const [santhaaAmount, setSanthaaAmount] = useState(defaultSanthaaAmount)
  const [generalSuccess, setGeneralSuccess] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})

  const openEditDialog = (type: MasterType, item: any) => {
    setError(null)
    setEditTarget({ type, item })
    setEditForm({
      code: item.code || '',
      name: item.name || '',
      name_ta: item.name_ta || '',
      description: item.description || '',
      is_active: item.is_active ?? true,
      village_id: item.village_id || villages[0]?.id || '',
      kilai_id: item.kilai_id || kilais[0]?.id || '',
      number: item.number || 1,
    })
  }

  const openDeleteDialog = (type: MasterType, item: any) => {
    setError(null)
    setDeleteTarget({ type, item })
  }

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

  const handleUpdateGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setGeneralSuccess(false)
    try {
      const res = await updatePanchayatSettings(panchayatId, {
        defaultSanthaaAmount: Number(santhaaAmount)
      })
      if (res && res.error) {
        setError(res.error)
      } else {
        setGeneralSuccess(true)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, roleId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await updateUserRole(userId, roleId)
      if (res && res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return

    setIsLoading(true)
    setError(null)

    try {
      let res: { error?: string; success?: boolean } | undefined

      if (editTarget.type === 'role') {
        if (!editForm.name || !editForm.code) {
          setError('Please provide role code and name.')
          setIsLoading(false)
          return
        }

        res = await updateRole(editTarget.item.id, {
          code: editForm.code,
          name: editForm.name,
          name_ta: editForm.name_ta,
          description: editForm.description,
          is_active: Boolean(editForm.is_active),
        })
      }

      if (editTarget.type === 'village') {
        if (!editForm.name) {
          setError('Please provide village name.')
          setIsLoading(false)
          return
        }

        res = await updateVillage(editTarget.item.id, {
          name: editForm.name,
          name_ta: editForm.name_ta,
          panchayatId,
        })
      }

      if (editTarget.type === 'kilai') {
        if (!editForm.name || !editForm.village_id) {
          setError('Please provide kilai name and village.')
          setIsLoading(false)
          return
        }

        res = await updateKilai(editTarget.item.id, {
          name: editForm.name,
          name_ta: editForm.name_ta,
          villageId: editForm.village_id,
        })
      }

      if (editTarget.type === 'ward') {
        if (!editForm.number || !editForm.kilai_id) {
          setError('Please provide ward number and kilai.')
          setIsLoading(false)
          return
        }

        res = await updateWard(editTarget.item.id, {
          number: Number(editForm.number),
          name: editForm.name,
          name_ta: editForm.name_ta,
          kilaiId: editForm.kilai_id,
        })
      }

      if (res?.error) {
        setError(res.error)
      } else {
        setEditTarget(null)
        setEditForm({})
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to update master data.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setIsLoading(true)
    setError(null)

    try {
      let res: { error?: string; success?: boolean } | undefined

      if (deleteTarget.type === 'role') {
        res = await deleteRole(deleteTarget.item.id)
      }

      if (deleteTarget.type === 'village') {
        res = await deleteVillage(deleteTarget.item.id)
      }

      if (deleteTarget.type === 'kilai') {
        res = await deleteKilai(deleteTarget.item.id)
      }

      if (deleteTarget.type === 'ward') {
        res = await deleteWard(deleteTarget.item.id)
      }

      if (res?.error) {
        setError(res.error)
      } else {
        setDeleteTarget(null)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to delete master data.')
    } finally {
      setIsLoading(false)
    }
  }

  const masterLabel = (target: EditTarget | DeleteTarget) => {
    if (!target) return 'item'
    if (target.type === 'ward') return `Ward ${target.item.number}`
    return target.item.name || target.item.code || 'item'
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

        <button
          onClick={() => {
            setActiveTab('general')
            setError(null)
            setGeneralSuccess(false)
          }}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-amber-500 text-white bg-slate-900/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <SettingsIcon className="w-4 h-4" /> General Settings
        </button>

        <button
          onClick={() => {
            setActiveTab('users')
            setError(null)
          }}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-amber-500 text-white bg-slate-900/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Users & Roles
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
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-900/30 border-slate-900/50">
                    <TableCell className="font-mono text-xs text-amber-500 font-bold">{role.code}</TableCell>
                    <TableCell className="font-semibold text-white">{role.name}</TableCell>
                    <TableCell className="text-slate-300">{role.name_ta || '-'}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{role.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="Edit role"
                          onClick={() => openEditDialog('role', role)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="Delete role"
                          onClick={() => openDeleteDialog('role', role)}
                          className="text-red-400 hover:text-red-300"
                          disabled={role.code === 'super_admin'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
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
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      title="Edit village"
                      onClick={() => openEditDialog('village', v)}
                      className="text-slate-500 hover:text-white"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      title="Delete village"
                      onClick={() => openDeleteDialog('village', v)}
                      className="text-red-500 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Tag className="w-3.5 h-3.5 text-slate-700" />
                  </div>
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
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Edit kilai"
                        onClick={() => openEditDialog('kilai', k)}
                        className="text-slate-500 hover:text-white"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Delete kilai"
                        onClick={() => openDeleteDialog('kilai', k)}
                        className="text-red-500 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Edit ward"
                        onClick={() => openEditDialog('ward', w)}
                        className="text-slate-500 hover:text-white"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Delete ward"
                        onClick={() => openDeleteDialog('ward', w)}
                        className="text-red-500 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Hash className="w-3.5 h-3.5 text-slate-700" />
                    </div>
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

      {activeTab === 'general' && (
        <div className="space-y-6 max-w-xl bg-slate-900/10 border border-slate-900 p-6 rounded-2xl">
          <h3 className="font-extrabold text-lg text-white">General Subscription Settings</h3>
          <p className="text-xs text-slate-400">
            Configure default collection values for monthly subscriptions (Santhaa).
          </p>

          {generalSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg text-sm">
              Settings updated successfully!
            </div>
          )}

          <form onSubmit={handleUpdateGeneralSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold text-xs uppercase">Panchayat Name</Label>
              <Input
                value="Kavaraipettai Panchayat"
                className="bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold text-xs uppercase">Default Monthly Santhaa (₹) *</Label>
              <Input
                type="number"
                min={1}
                value={santhaaAmount}
                onChange={(e) => setSanthaaAmount(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                required
              />
              <p className="text-[10px] text-slate-500">
                This amount will be pre-filled when recording subscriptions and used as the standard base rate to calculate outstanding dues.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold h-9 px-4 rounded-lg hover:scale-[1.02] transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 max-w-4xl">
          <div>
            <h3 className="font-extrabold text-lg text-white">Portal User Accounts</h3>
            <p className="text-xs text-slate-400">
              Manage portal permissions by assigning administrative roles to registered accounts.
            </p>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/50 border-b border-slate-900">
                <TableRow className="hover:bg-transparent border-slate-900">
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Email / Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Active Role</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Assign New Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portalUsers.map((pUser) => {
                  const currentRoleId = pUser.user_roles?.[0]?.role_id || '';
                  const roleName = pUser.user_roles?.[0]?.roles?.name || 'Volunteer';
                  const roleCode = pUser.user_roles?.[0]?.roles?.code || 'volunteer';
                  
                  return (
                    <TableRow key={pUser.id} className="hover:bg-slate-900/30 border-slate-900/50">
                      <TableCell className="font-semibold text-white py-4">
                        <div>
                          <p className="text-sm">{pUser.full_name || 'Portal User'}</p>
                          <p className="text-xs text-slate-500 font-normal">{pUser.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          roleCode === 'super_admin' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          roleCode === 'treasurer' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {roleName}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <select
                          disabled={isLoading}
                          value={currentRoleId}
                          onChange={(e) => handleUpdateUserRole(pUser.id, e.target.value)}
                          className="h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="">-- No Role / Inactive --</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white font-extrabold text-xl">Edit {editTarget?.type}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update this master data record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {editTarget?.type === 'role' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Role Code *</Label>
                  <Input
                    value={editForm.code || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Role Name *</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Tamil Label</Label>
                  <Input
                    value={editForm.name_ta || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name_ta: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Description</Label>
                  <Input
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.is_active)}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                  />
                  Active role
                </label>
              </>
            )}

            {editTarget?.type === 'village' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Village Name *</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Tamil Label</Label>
                  <Input
                    value={editForm.name_ta || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name_ta: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>
              </>
            )}

            {editTarget?.type === 'kilai' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Parent Village *</Label>
                  <select
                    value={editForm.village_id || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, village_id: e.target.value }))}
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
                  <Label className="text-slate-300 font-bold text-xs uppercase">Kilai Name *</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Tamil Label</Label>
                  <Input
                    value={editForm.name_ta || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name_ta: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>
              </>
            )}

            {editTarget?.type === 'ward' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Parent Kilai *</Label>
                  <select
                    value={editForm.kilai_id || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, kilai_id: e.target.value }))}
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
                    value={editForm.number || 1}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, number: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Ward Name</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Tamil Label</Label>
                  <Input
                    value={editForm.name_ta || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name_ta: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-9"
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-white font-extrabold text-xl">Delete {deleteTarget?.type}</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will permanently delete {masterLabel(deleteTarget)}. Related records may also be affected by database relationships.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteConfirm}
              className="font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
