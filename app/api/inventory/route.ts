import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { authenticate } from '@/middleware/auth';

// GET all products with filtering and pagination
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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden. Insufficient permissions.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const data = await request.json();
    
    const product = await Product.create(data);
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
