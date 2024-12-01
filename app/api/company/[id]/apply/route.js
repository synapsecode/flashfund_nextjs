import { NextResponse } from 'next/server'

export async function POST(req) {
    const { id } = req.body;
    try {
        return NextResponse.json({ message: 'Sample POST Request' })
    } catch (err) {
        return NextResponse.json({ message: 'Internal server error' })
    }
}