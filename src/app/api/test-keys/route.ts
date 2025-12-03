import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return NextResponse.json({
    serviceKeyLength: serviceKey.length,
    anonKeyLength: anonKey.length,
    serviceKeyFirst50: serviceKey.substring(0, 50),
    anonKeyFirst50: anonKey.substring(0, 50),
    areSame: serviceKey === anonKey,
  });
}