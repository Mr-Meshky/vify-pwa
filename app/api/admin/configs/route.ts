import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Build query
    let query = supabase.from('config_submissions').select('*').order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Get stats
    const { data: allSubmissions } = await supabase
      .from('config_submissions')
      .select('status, created_at')

    const stats = {
      pending: allSubmissions?.filter((s) => s.status === 'pending').length || 0,
      approved: allSubmissions?.filter((s) => s.status === 'approved').length || 0,
      rejected: allSubmissions?.filter((s) => s.status === 'rejected').length || 0,
      today: allSubmissions?.filter((s) => {
        const today = new Date()
        const createdAt = new Date(s.created_at)
        return (
          createdAt.getDate() === today.getDate() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getFullYear() === today.getFullYear()
        )
      }).length || 0,
    }

    return NextResponse.json({ data, stats }, { status: 200 })
  } catch (error) {
    console.error('[v0] Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
