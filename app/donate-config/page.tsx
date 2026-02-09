'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Upload, Trophy, Users, CheckCircle2, Loader2 } from 'lucide-react'
import useSWR from 'swr'

const configSchema = z.object({
  config_type: z.string().min(1, 'Please select a config type'),
  config_content: z.string().min(10, 'Config content must be at least 10 characters'),
  country: z.string().optional(),
  region: z.string().optional(),
  network_compatibility: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  contributor_nickname: z.string().optional(),
  contributor_telegram: z.string().optional(),
})

type ConfigFormData = z.infer<typeof configSchema>

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DonateConfigPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [networkCompat, setNetworkCompat] = useState<string[]>([])
  
  const { data: leaderboardData } = useSWR('/api/donate-config/leaderboard', fetcher)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      network_compatibility: [],
    },
  })

  const onSubmit = async (data: ConfigFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/donate-config/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          network_compatibility: networkCompat,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message || 'Config submitted successfully!')
        reset()
        setNetworkCompat([])
      } else {
        toast.error(result.error || 'Failed to submit config')
      }
    } catch (error) {
      console.error('[v0] Submission error:', error)
      toast.error('An error occurred while submitting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNetworkToggle = (network: string) => {
    const updated = networkCompat.includes(network)
      ? networkCompat.filter((n) => n !== network)
      : [...networkCompat, network]
    setNetworkCompat(updated)
    setValue('network_compatibility', updated)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {'Contribute to Vify'}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {'Help the community by sharing your working VPN and proxy configurations. Your contribution makes internet freedom accessible to everyone.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {'Submit Configuration'}
                </CardTitle>
                <CardDescription>
                  {'Share your working configs to help others bypass restrictions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Config Type */}
                  <div className="space-y-2">
                    <Label htmlFor="config_type">{'Config Type'}</Label>
                    <Select
                      onValueChange={(value) => setValue('config_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select config type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vmess">VMess</SelectItem>
                        <SelectItem value="vless">VLess</SelectItem>
                        <SelectItem value="trojan">Trojan</SelectItem>
                        <SelectItem value="shadowsocks">Shadowsocks</SelectItem>
                        <SelectItem value="wireguard">WireGuard</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.config_type && (
                      <p className="text-sm text-destructive">{errors.config_type.message}</p>
                    )}
                  </div>

                  {/* Config Content */}
                  <div className="space-y-2">
                    <Label htmlFor="config_content">{'Configuration'}</Label>
                    <Textarea
                      id="config_content"
                      placeholder="Paste your config here (e.g., vmess://, vless://, trojan://)"
                      rows={6}
                      className="font-mono text-sm"
                      {...register('config_content')}
                    />
                    {errors.config_content && (
                      <p className="text-sm text-destructive">{errors.config_content.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">{'Country (Optional)'}</Label>
                      <Input
                        id="country"
                        placeholder="e.g., United States"
                        {...register('country')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">{'Region (Optional)'}</Label>
                      <Input
                        id="region"
                        placeholder="e.g., California"
                        {...register('region')}
                      />
                    </div>
                  </div>

                  {/* Network Compatibility */}
                  <div className="space-y-3">
                    <Label>{'Network Compatibility (Optional)'}</Label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {['WiFi', 'Mobile Data', '4G', '5G', 'Broadband', 'Satellite'].map(
                        (network) => (
                          <div key={network} className="flex items-center space-x-2">
                            <Checkbox
                              id={network}
                              checked={networkCompat.includes(network)}
                              onCheckedChange={() => handleNetworkToggle(network)}
                            />
                            <label
                              htmlFor={network}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {network}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="space-y-2">
                    <Label htmlFor="use_case">{'Use Case (Optional)'}</Label>
                    <Select onValueChange={(value) => setValue('use_case', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Browsing</SelectItem>
                        <SelectItem value="streaming">Streaming</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="privacy">Privacy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contributor Info */}
                  <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="text-sm font-semibold">{'Contributor Info (Optional but Recommended)'}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contributor_nickname">{'Nickname'}</Label>
                        <Input
                          id="contributor_nickname"
                          placeholder="Your display name"
                          {...register('contributor_nickname')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributor_telegram">{'Telegram Username'}</Label>
                        <Input
                          id="contributor_telegram"
                          placeholder="@username"
                          {...register('contributor_telegram')}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {'Provide your info to appear on the leaderboard and earn contributor points!'}
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {'Submitting...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {'Submit Configuration'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  {'Community Impact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">{'Total Configs Shared'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">567</p>
                  <p className="text-sm text-muted-foreground">{'Active Contributors'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">{'Countries Covered'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4" />
                  {'Top Contributors'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.data?.map((contributor: any, index: number) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0
                              ? 'bg-amber-500 text-amber-950'
                              : index === 1
                              ? 'bg-gray-400 text-gray-900'
                              : index === 2
                              ? 'bg-orange-600 text-orange-50'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {contributor.nickname || contributor.telegram_username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contributor.contributor_level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{contributor.contributor_score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                  {(!leaderboardData?.data || leaderboardData.data.length === 0) && (
                    <p className="text-center text-sm text-muted-foreground">
                      {'No contributors yet. Be the first!'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{'Submission Guidelines'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-accent">{'•'}</span>
                    {'Only submit working configs you have tested'}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">{'•'}</span>
                    {'Do not submit configs from paid services'}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">{'•'}</span>
                    {'Include location info for better results'}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">{'•'}</span>
                    {'Configs are reviewed before approval'}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">{'•'}</span>
                    {'Earn points for every approved config'}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
