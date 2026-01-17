import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { analyzeInventoryTrends } from '@/lib/openai';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';

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
    
    // Get inventory data
    const products = await Product.find()
      .sort({ currentStock: 1 })
      .limit(20);
    
    const insights = await analyzeInventoryTrends(products);
    
    return NextResponse.json({
      success: true,
      insights,
    });
    
  } catch (error: any) {
    console.error('AI inventory insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
