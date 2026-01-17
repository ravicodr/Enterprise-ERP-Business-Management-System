'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  Search,
  Plus,
  LogOut,
  BarChart3,
  Filter,
  Download,
  Edit,
  Trash2,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'ai-assistant'>('dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);
  
  // AI Feature States
  const [aiInventoryInsights, setAiInventoryInsights] = useState<string>('');
  const [aiOrderInsights, setAiOrderInsights] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData(token);
  }, []);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/analytics', { headers }),
        fetch('/api/inventory?limit=50', { headers }),
        fetch('/api/orders?limit=20', { headers }),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.data);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data);
      }
      
      // Load AI insights
      loadAIInsights(token);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [inventoryRes, orderRes] = await Promise.all([
        fetch('/api/ai/inventory-insights', { headers }),
        fetch('/api/ai/order-insights', { headers }),
      ]);

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setAiInventoryInsights(data.insights);
      }

      if (orderRes.ok) {
        const data = await orderRes.json();
        setAiOrderInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    }
  };

  const handleAIChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: userMessage,
          context: `Current inventory items: ${products.length}, Recent orders: ${orders.length}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enterprise ERP</h1>
                <p className="text-xs text-gray-500">Business Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('inventory')}
            >
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === 'ai-assistant' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ai-assistant')}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Assistant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && analytics && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-3xl">{analytics.overview.totalOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-3xl">{formatCurrency(analytics.overview.totalRevenue)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Processing 500+ orders daily
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Low Stock Alerts</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">{analytics.overview.lowStockCount}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Requires attention
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Users</CardDescription>
                  <CardTitle className="text-3xl">{analytics.overview.activeUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-blue-600">
                    <Users className="h-4 w-4 mr-1" />
                    JWT-secured access
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Insights Cards */}
              {aiInventoryInsights && (
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <CardTitle className="text-blue-900">AI Inventory Insights</CardTitle>
                    </div>
                    <CardDescription>Powered by OpenAI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{aiInventoryInsights}</p>
                  </CardContent>
                </Card>
              )}

              {aiOrderInsights && (
                <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <CardTitle className="text-purple-900">AI Order Analysis</CardTitle>
                    </div>
                    <CardDescription>Powered by OpenAI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{aiOrderInsights}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
                  <CardDescription>Daily revenue and order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                      <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                  <CardDescription>Product distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.categoryDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best performing products by quantity sold</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topProducts.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" fontSize={11} angle={-45} textAnchor="end" height={80} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="totalQuantity" fill="#3b82f6" name="Quantity Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current order status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.orderStatusDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis dataKey="_id" type="category" fontSize={12} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest order activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Button onClick={() => setShowAddProduct(!showAddProduct)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>

            {showAddProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddProductForm onSuccess={() => {
                    setShowAddProduct(false);
                    const token = localStorage.getItem('token');
                    if (token) loadDashboardData(token);
                  }} />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.status === 'in-stock' ? 'bg-green-100 text-green-700' :
                            product.status === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
                            product.status === 'out-of-stock' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">SKU</p>
                            <p className="font-medium">{product.sku}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="font-medium">{product.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Stock</p>
                            <p className="font-medium">{product.currentStock} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reorder Level</p>
                            <p className="font-medium">{product.reorderLevel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Supplier</p>
                            <p className="font-medium">{product.supplier}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{product.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Orders Management</h2>
              <Button onClick={() => setShowAddOrder(!showAddOrder)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>

            {showAddOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Order creation form would go here with product selection, customer details, etc.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Items</p>
                        <p className="font-medium">{order.items.length} products</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipping Method</p>
                        <p className="font-medium">{order.shippingMethod}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <CardTitle>AI ERP Assistant</CardTitle>
                  </div>
                  <CardDescription>Ask me anything about your inventory, orders, or business operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20">
                          <svg className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="font-medium">Start a conversation with your AI assistant</p>
                          <p className="text-sm mt-2">Try asking: "What products are low in stock?" or "Summarize my recent orders"</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}>
                              <p className="text-sm whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-600">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask about inventory, orders, analytics..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAIChat()}
                        disabled={aiLoading}
                      />
                      <Button onClick={handleAIChat} disabled={aiLoading || !chatInput.trim()}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick AI Actions</CardTitle>
                  <CardDescription>Common tasks you can ask the AI assistant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setChatInput("What products are currently low in stock?");
                    }}
                  >
                    📊 Check low stock items
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setChatInput("Summarize my recent orders and revenue");
                    }}
                  >
                    💰 Analyze recent orders
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setChatInput("What are the top selling products?");
                    }}
                  >
                    🏆 Top performing products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setChatInput("Give me inventory optimization recommendations");
                    }}
                  >
                    🎯 Optimization tips
                  </Button>
                </CardContent>
              </Card>

              {/* AI Features Info */}
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Features</CardTitle>
                  <CardDescription>What our AI can help you with</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Inventory Analysis</h4>
                      <p className="text-xs text-gray-600">Smart insights on stock levels and trends</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Order Intelligence</h4>
                      <p className="text-xs text-gray-600">Automated order pattern recognition</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Predictive Analytics</h4>
                      <p className="text-xs text-gray-600">Forecast demand and optimize stock</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Auto Descriptions</h4>
                      <p className="text-xs text-gray-600">Generate product descriptions instantly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Add Product Form Component
function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    currentStock: 0,
    reorderLevel: 10,
    reorderQuantity: 50,
    unitPrice: 0,
    supplier: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const generateAIDescription = async () => {
    if (!formData.name || !formData.category) {
      setError('Please enter product name and category first');
      return;
    }

    setGeneratingDesc(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: formData.name,
          category: formData.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          description: data.description,
        });
      } else {
        setError('Failed to generate description');
      }
    } catch (err: any) {
      setError('Failed to generate description');
    } finally {
      setGeneratingDesc(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">SKU</label>
          <Input name="sku" value={formData.sku} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input name="category" value={formData.category} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Supplier</label>
          <Input name="supplier" value={formData.supplier} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Stock</label>
          <Input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit Price ($)</label>
          <Input type="number" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reorder Level</label>
          <Input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input name="location" value={formData.location} onChange={handleChange} required />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Description</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAIDescription}
            disabled={generatingDesc || !formData.name || !formData.category}
          >
            {generatingDesc ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Generate
              </>
            )}
          </Button>
        </div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Product description (or use AI to generate)"
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
