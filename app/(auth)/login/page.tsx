'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await login(values)
      if (result && result.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/15 hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-red-500 to-amber-400">
                TVK
              </div>
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                தமிழக வெற்றி கழகம்
              </span>
              <span className="block text-[10px] text-amber-500 font-medium tracking-widest uppercase">
                Panchayat Portal
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-2xl text-slate-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black text-center text-white">Admin Access</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Enter credentials to access the Panchayat organization platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="admin@tvkpanchayat.org"
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 text-slate-100 rounded-lg"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <Input
                    {...register('password')}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 text-slate-100 rounded-lg"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 font-bold py-2.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-[size:200%_auto] text-white rounded-lg shadow-md transition-all duration-500 hover:bg-right hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t border-slate-800/50 pt-4 text-center">
            <span className="text-xs text-slate-500">
              Only authorized party coordinators are permitted.
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
