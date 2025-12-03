import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🟢 Register endpoint called');

    const { fullName, email, password } = await request.json();
    console.log('📝 Received data:', { fullName, email, passwordLength: password?.length });

    // Validation
    if (!fullName || !email || !password) {
      console.log('❌ Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, checking existing user...');

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Changed from .single() to avoid error when not found

    console.log('🔍 Existing user check:', {
      found: !!existingUser,
      error: checkError?.message,
    });

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    console.log('✅ User does not exist, hashing password...');

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    console.log('✅ Creating new user...');

    // Create user in database
    const { data: newUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash, // ✅ Changed from 'password' to 'password_hash'
        full_name: fullName,
        role: 'user', // ✅ Changed from 'is_admin' to 'role'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
      });
      return NextResponse.json(
        {
          error: 'Failed to create account',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ User created successfully:', newUser?.id);

    // Create token
    const token = Buffer.from(
      JSON.stringify({
        userId: newUser.id,
        email: newUser.email,
      })
    ).toString('base64');

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Register error:', error);
    return NextResponse.json(
      {
        error: 'An error occurred during registration',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
