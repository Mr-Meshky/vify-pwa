'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Wifi,
  Copy,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ConfigSubmission {
  id: string
  config_type: string
  config_content: string
  country?: string
  region?: string
  network_compatibility?: string[]
  use_case?: string
  contributor_nickname?: string
  contributor_telegram?: string
  status: 'pending' | 'approved' | 'rejected'
  is_duplicate: boolean
  quality_score: number
  submitted_ip: string
  admin_notes?: string
  created_at: string
  reviewed_at?: string
}

export default function AdminConfigsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedConfig, setSelectedConfig] = useState<ConfigSubmission | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  const { data, error, isLoading } = useSWR(
    `/api/admin/configs?status=${statusFilter}`,
    fetcher,
    { refreshInterval: 10000 }
  )

  const handleReview = async (configId: string, newStatus: 'approved' | 'rejected') => {
    setIsReviewing(true)
    try {
      const response = await fetch('/api/admin/configs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_id: configId,
          status: newStatus,
          admin_notes: adminNotes,
        }),
      })

      if (response.ok) {
        toast.success(`Config ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`)
        mutate(`/api/admin/configs?status=${statusFilter}`)
        setSelectedConfig(null)
        setAdminNotes('')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to review config')
      }
    } catch (error) {
      console.error('[v0] Review error:', error)
      toast.error('An error occurred while reviewing')
    } finally {
      setIsReviewing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{'Config Moderation Dashboard'}</h1>
          <p className="text-muted-foreground">
            {'Review and approve community-submitted VPN and proxy configurations'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{'Pending'}</p>
                  <p className="text-2xl font-bold">{data?.stats?.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{'Approved'}</p>
                  <p className="text-2xl font-bold text-green-600">{data?.stats?.approved || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{'Rejected'}</p>
                  <p className="text-2xl font-bold text-destructive">{data?.stats?.rejected || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{'Today'}</p>
                  <p className="text-2xl font-bold">{data?.stats?.today || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="status-filter" className="font-semibold">
                {'Filter by Status:'}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>{'Config Submissions'}</CardTitle>
            <CardDescription>
              {`${data?.data?.length || 0} ${statusFilter === 'all' ? '' : statusFilter} submissions`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                {'Failed to load submissions'}
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {'No submissions found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{'Type'}</TableHead>
                      <TableHead>{'Location'}</TableHead>
                      <TableHead>{'Contributor'}</TableHead>
                      <TableHead>{'Status'}</TableHead>
                      <TableHead>{'Submitted'}</TableHead>
                      <TableHead>{'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.map((config: ConfigSubmission) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {config.config_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {config.country || 'Unknown'}{config.region ? `, ${config.region}` : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {config.contributor_nickname || config.contributor_telegram || 'Anonymous'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(config.status)}
                            {config.is_duplicate && (
                              <Badge variant="secondary" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Duplicate
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(config.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedConfig(config)}
                          >
                            {'Review'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedConfig} onOpenChange={() => setSelectedConfig(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{'Review Configuration'}</DialogTitle>
            <DialogDescription>
              {'Review the details and decide whether to approve or reject this submission'}
            </DialogDescription>
          </DialogHeader>

          {selectedConfig && (
            <div className="space-y-6">
              {/* Config Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{'Config Type'}</Label>
                  <p className="font-semibold uppercase">{selectedConfig.config_type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{'Location'}</Label>
                  <p className="font-semibold">
                    {selectedConfig.country || 'Unknown'}
                    {selectedConfig.region ? `, ${selectedConfig.region}` : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{'Contributor'}</Label>
                  <p className="font-semibold">
                    {selectedConfig.contributor_nickname ||
                      selectedConfig.contributor_telegram ||
                      'Anonymous'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{'Use Case'}</Label>
                  <p className="font-semibold">{selectedConfig.use_case || 'Not specified'}</p>
                </div>
              </div>

              {/* Network Compatibility */}
              {selectedConfig.network_compatibility &&
                selectedConfig.network_compatibility.length > 0 && (
                  <div>
                    <Label className="mb-2 text-xs text-muted-foreground">
                      {'Network Compatibility'}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedConfig.network_compatibility.map((network) => (
                        <Badge key={network} variant="secondary" className="gap-1">
                          <Wifi className="h-3 w-3" />
                          {network}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Config Content */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{'Configuration'}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedConfig.config_content)}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {'Copy'}
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-muted p-4">
                  <pre className="overflow-x-auto text-xs font-mono">
                    {selectedConfig.config_content}
                  </pre>
                </div>
              </div>

              {/* Warnings */}
              {selectedConfig.is_duplicate && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">{'Duplicate Detected'}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {'This configuration appears to be similar to an existing approved config'}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes" className="mb-2">
                  {'Admin Notes'}
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add notes about this review (optional)"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleReview(selectedConfig.id, 'approved')}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReview(selectedConfig.id, 'rejected')}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {'Reject'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedConfig(null)} disabled={isReviewing}>
                  {'Cancel'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
