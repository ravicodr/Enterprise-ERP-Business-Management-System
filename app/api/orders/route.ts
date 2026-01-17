import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { authenticate } from '@/middleware/auth';
import { generateOrderNumber } from '@/lib/utils';

// GET all orders
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
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);
    
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const data = await request.json();
    
    // Validate stock availability
    for (const item of data.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productName} not found` },
          { status: 404 }
        );
      }
      
      if (product.currentStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.currentStock}` },
          { status: 400 }
        );
      }
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create order
    const order = await Order.create({
      ...data,
      orderNumber,
      createdBy: user.userId,
    });
    
    // Update inventory
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { currentStock: -item.quantity },
      });
    }
    
    // Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('createdBy', 'name email');
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
