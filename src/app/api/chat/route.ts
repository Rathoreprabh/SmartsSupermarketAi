import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { chatWithActions } from '@/lib/cohere/client';

// POST - Send message to chatbot
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('💬 Chat request:', { userId, sessionId, message });

    let currentSessionId = sessionId;

    // Create new session if none exists
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + '...',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
      console.log('✅ Created new session:', currentSessionId);
    }

    // Get chat history
    const { data: history } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Fetch available products for context
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image, category, in_stock')
      .eq('in_stock', true)
      .limit(50);

    // Save user message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: currentSessionId,
      user_id: userId,
      role: 'user',
      content: message,
    });

    // Get AI response with actions
    const aiResponse = await chatWithActions(
      message, 
      history || [], 
      products || []
    );

    if (!aiResponse.success) {
      throw new Error(aiResponse.error);
    }

    // Extract action from response
    const actionMatch = aiResponse.message.match(/<ACTION>(.*?)<\/ACTION>/);
    let action = null;
    let cleanMessage = aiResponse.message;

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
        cleanMessage = aiResponse.message.replace(/<ACTION>.*?<\/ACTION>/g, '').trim();
        console.log('🎯 Action detected:', action);
      } catch (e) {
        console.error('Failed to parse action:', e);
      }
    }

    // Save AI response
    await supabaseAdmin.from('chat_messages').insert({
      session_id: currentSessionId,
      user_id: userId,
      role: 'assistant',
      content: cleanMessage,
      metadata: action ? { action } : null,
    });

    // Update session timestamp
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId);

    console.log('✅ Chat completed');

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      message: cleanMessage,
      action: action, // Return action to frontend
    });
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET - Fetch chat sessions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (error: any) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}