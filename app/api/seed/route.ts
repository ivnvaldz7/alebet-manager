import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import { seedDemoDataIfEmpty } from '@/lib/utils/seed-demo'

export async function POST() {
  try {
    await connectDB()
    await seedDemoDataIfEmpty()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
