'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createMember } from '../actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BLOOD_GROUPS, GENDERS, MEMBER_STATUSES } from '@/constants'

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  alternate_number: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  district_id: z.string().uuid('Please select a valid district'),
  union_id: z.string().uuid('Please select a valid union'),
  panchayat_id: z.string().uuid('Please select a valid panchayat'),
  village_id: z.string().uuid('Please select a valid village'),
  kilai_id: z.string().uuid('Please select a valid kilai'),
  ward_id: z.string().uuid('Please select a valid ward'),
  date_of_birth: z.string().optional(),
  occupation: z.string().optional(),
  joining_date: z.string().optional(),
  blood_group: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  role_id: z.string().uuid('Please select a valid role'),
  status: z.enum(['active', 'inactive', 'suspended']),
})

type MemberFormValues = z.infer<typeof memberSchema>

interface MemberFormProps {
  districts: any[]
  unions: any[]
  panchayats: any[]
  villages: any[]
  kilais: any[]
  wards: any[]
  roles: any[]
}

export default function MemberForm({
  districts,
  unions,
  panchayats,
  villages,
  kilais,
  wards,
  roles,
}: MemberFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Default to first indices for pre-filling default locations
  const defaultDistrict = districts[0]?.id || ''
  const defaultUnion = unions[0]?.id || ''
  const defaultPanchayat = panchayats[0]?.id || ''

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      mobile_number: '',
      alternate_number: '',
      address: '',
      district_id: defaultDistrict,
      union_id: defaultUnion,
      panchayat_id: defaultPanchayat,
      village_id: villages[0]?.id || '',
      kilai_id: kilais[0]?.id || '',
      ward_id: wards[0]?.id || '',
      date_of_birth: '',
      occupation: '',
      joining_date: new Date().toISOString().split('T')[0],
      blood_group: 'B+',
      gender: 'Male',
      role_id: roles.find((r) => r.code === 'volunteer')?.id || roles[0]?.id || '',
      status: 'active',
    },
  })

  const onSubmit = async (values: MemberFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await createMember(values)
      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        router.push('/members')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
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
          <h1 className="text-2xl font-black text-white tracking-tight">Register New Member</h1>
          <p className="text-slate-400 text-xs">Add a new cadre profile to the local Panchayat structure.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/10 border border-slate-900 p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Full Name</Label>
            <Input
              {...register('name')}
              placeholder="e.g. Arul Kumar"
              className="bg-slate-950/40 border-slate-800 text-slate-100"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Mobile Number</Label>
            <Input
              {...register('mobile_number')}
              placeholder="e.g. 9876543210"
              className="bg-slate-950/40 border-slate-800 text-slate-100"
            />
            {errors.mobile_number && <p className="text-xs text-red-400 mt-1">{errors.mobile_number.message}</p>}
          </div>

          {/* Alternate Number */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Alternate Contact (Optional)</Label>
            <Input
              {...register('alternate_number')}
              placeholder="e.g. 9876543211"
              className="bg-slate-950/40 border-slate-800 text-slate-100"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Party Role</Label>
            <select
              {...register('role_id')}
              className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.name_ta || ''})
                </option>
              ))}
            </select>
            {errors.role_id && <p className="text-xs text-red-400 mt-1">{errors.role_id.message}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Gender</Label>
            <select
              {...register('gender')}
              className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Blood Group</Label>
            <select
              {...register('blood_group')}
              className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Date of Birth</Label>
            <Input
              type="date"
              {...register('date_of_birth')}
              className="bg-slate-950/40 border-slate-800 text-slate-300"
            />
          </div>

          {/* Joining Date */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Joining Date</Label>
            <Input
              type="date"
              {...register('joining_date')}
              className="bg-slate-950/40 border-slate-800 text-slate-300"
            />
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Occupation</Label>
            <Input
              {...register('occupation')}
              placeholder="e.g. Farmer, Engineer"
              className="bg-slate-950/40 border-slate-800 text-slate-100"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Cadre Status</Label>
            <select
              {...register('status')}
              className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
            >
              {MEMBER_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Residential Address</Label>
          <Input
            {...register('address')}
            placeholder="e.g. 12, North Street, Melpattampakkam"
            className="bg-slate-950/40 border-slate-800 text-slate-100"
          />
          {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
        </div>

        {/* Geographic Assignment */}
        <div className="border-t border-slate-900 pt-6">
          <h3 className="font-extrabold text-sm text-slate-300 mb-4 uppercase tracking-wider">Administrative Placement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Village */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Village</Label>
              <select
                {...register('village_id')}
                className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kilai */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Kilai Unit</Label>
              <select
                {...register('kilai_id')}
                className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
              >
                {kilais.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Ward</Label>
              <select
                {...register('ward_id')}
                className="w-full h-8 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t border-slate-900 pt-6">
          <Link
            href="/members"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              "text-slate-400 hover:text-white border border-slate-900"
            )}
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-amber-500 font-bold text-white shadow-md hover:scale-[1.01] transition-transform"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Member...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Member
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
