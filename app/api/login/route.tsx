import { NextResponse } from 'next/server'
import axios from "axios";

export async function POST(req: Request) {
    const body = await req.json()

    // Call your backend
    const res = await fetch("http://universitymailbox.runasp.net/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    const data = await res.json()

    const response = NextResponse.json({ data })
    const accessToken = data.data.accessToken
    const refreshToken = data.data.refreshToken
    console.log(accessToken, refreshToken)

    const api = axios.create({
        baseURL: 'http://universitymailbox.runasp.net/api',
    })

    api.interceptors.request.use((config) => {
        const token = accessToken// or memory/cookie fallback

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    })

    // Store tokens securely
    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    return response
}