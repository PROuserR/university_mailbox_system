import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = cookies()

    const refreshToken = (await cookieStore).get('refresh_token')?.value

    // Optional: notify backend to invalidate refresh token
    if (refreshToken) {
        await fetch("http://universitymailbox.runasp.net/api/auth/logout", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        })
    }

    const response = NextResponse.json({ success: true })

    // Clear cookies
    response.cookies.set('access_token', '', { maxAge: 0 })
    response.cookies.set('refresh_token', '', { maxAge: 0 })

    return response
}