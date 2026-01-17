import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { chatAssistant } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { message, context } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const response = await chatAssistant(message, context);
    
    return NextResponse.json({
      success: true,
      response,
    });
    
  } catch (error: any) {
    console.error('AI chat assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
