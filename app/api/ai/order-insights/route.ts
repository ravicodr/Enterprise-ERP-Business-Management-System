import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { generateOrderSummary } from '@/lib/openai';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const user = authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get recent orders
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    const insights = await generateOrderSummary(orders);
    
    return NextResponse.json({
      success: true,
      insights,
    });
    
  } catch (error: any) {
    console.error('AI order insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
