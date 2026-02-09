import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { config_id, status, admin_notes } = body

    if (!config_id || !status) {
      return NextResponse.json(
        { error: 'Config ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the submission
    const { data, error } = await supabase
      .from('config_submissions')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
        published_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', config_id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    // The trigger will automatically update contributor stats

    return NextResponse.json(
      {
        success: true,
        data,
        message: `Config ${status} successfully`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
