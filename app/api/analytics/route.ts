import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { authenticate } from '@/middleware/auth';

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
    const period = searchParams.get('period') || '30'; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Overview statistics
    const [
      totalOrders,
      totalRevenue,
      lowStockCount,
      activeUsers,
      recentOrders,
      topProducts,
      categoryDistribution,
      orderStatusDistribution,
      dailyRevenue,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      
      // Low stock products
      Product.countDocuments({ status: { $in: ['low-stock', 'out-of-stock'] } }),
      
      // Active users
      User.countDocuments({ isActive: true }),
      
      // Recent orders
      Order.find()
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber customer totalAmount status createdAt'),
      
      // Top selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productName',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
      
      // Category distribution
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          },
        },
        { $sort: { count: -1 } },
      ]),
      
      // Order status distribution
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      
      // Daily revenue for last 30 days
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          lowStockCount,
          activeUsers,
        },
        recentOrders,
        topProducts,
        categoryDistribution,
        orderStatusDistribution,
        dailyRevenue,
      },
    });
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
