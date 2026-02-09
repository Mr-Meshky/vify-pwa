import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_WINDOW = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Extract IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Validate required fields
    const {
      config_type,
      config_content,
      country,
      region,
      network_compatibility,
      use_case,
      contributor_nickname,
      contributor_telegram,
    } = body

    if (!config_type || !config_content) {
      return NextResponse.json(
        { error: 'Config type and content are required' },
        { status: 400 }
      )
    }

    // Check rate limiting
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('submission_rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .single()

    if (rateLimitData) {
      const windowStart = new Date(rateLimitData.window_start).getTime()
      const now = Date.now()

      if (now - windowStart < RATE_LIMIT_WINDOW) {
        if (rateLimitData.submission_count >= MAX_SUBMISSIONS_PER_WINDOW) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          )
        }

        // Update counter
        await supabase
          .from('submission_rate_limits')
          .update({ submission_count: rateLimitData.submission_count + 1 })
          .eq('ip_address', ip)
      } else {
        // Reset window
        await supabase
          .from('submission_rate_limits')
          .update({ submission_count: 1, window_start: new Date().toISOString() })
          .eq('ip_address', ip)
      }
    } else {
      // Create new rate limit entry
      await supabase.from('submission_rate_limits').insert({
        ip_address: ip,
        submission_count: 1,
        window_start: new Date().toISOString(),
      })
    }

    // Check for duplicate configs
    const { data: existingConfigs } = await supabase
      .from('config_submissions')
      .select('id')
      .eq('config_content', config_content)
      .eq('status', 'approved')
      .limit(1)

    const isDuplicate = existingConfigs && existingConfigs.length > 0

    // Insert the config submission
    const { data, error } = await supabase
      .from('config_submissions')
      .insert({
        config_type,
        config_content,
        country,
        region,
        network_compatibility: network_compatibility || [],
        use_case,
        contributor_nickname,
        contributor_telegram,
        submitted_ip: ip,
        is_duplicate: isDuplicate,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit configuration' },
        { status: 500 }
      )
    }

    // Update contributor total submissions count
    if (contributor_telegram) {
      const { data: contributor } = await supabase
        .from('contributors')
        .select('*')
        .eq('telegram_username', contributor_telegram)
        .single()

      if (contributor) {
        await supabase
          .from('contributors')
          .update({
            total_submissions: contributor.total_submissions + 1,
            last_submission_at: new Date().toISOString(),
          })
          .eq('telegram_username', contributor_telegram)
      } else {
        await supabase.from('contributors').insert({
          telegram_username: contributor_telegram,
          nickname: contributor_nickname,
          total_submissions: 1,
          last_submission_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: isDuplicate
          ? 'Config submitted successfully! However, a similar config already exists.'
          : 'Config submitted successfully! It will be reviewed soon.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
