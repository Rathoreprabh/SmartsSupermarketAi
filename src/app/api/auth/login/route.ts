import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started');

    const { email, password } = await request.json();
    console.log('📝 Login data:', { email, hasPassword: !!password });

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('✅ User found:', user.id);

    // Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('✅ Password valid, login successful');

    // Create token
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
      })
    ).toString('base64');

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
