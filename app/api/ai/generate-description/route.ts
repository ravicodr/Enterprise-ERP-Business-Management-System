import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { generateProductDescription } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { productName, category } = await request.json();
    
    if (!productName || !category) {
      return NextResponse.json(
        { error: 'Product name and category are required' },
        { status: 400 }
      );
    }
    
    const description = await generateProductDescription(productName, category);
    
    return NextResponse.json({
      success: true,
      description,
    });
    
  } catch (error: any) {
    console.error('AI description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
