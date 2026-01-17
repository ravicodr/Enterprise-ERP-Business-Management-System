const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise-erp';

// Inline schemas (since we can't import from TypeScript in plain JS)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  isActive: Boolean,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  category: String,
  description: String,
  currentStock: Number,
  reorderLevel: Number,
  reorderQuantity: Number,
  unitPrice: Number,
  supplier: String,
  location: String,
  status: String,
  lastRestocked: Date,
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  items: [{
    product: mongoose.Schema.Types.ObjectId,
    productName: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
  }],
  subtotal: Number,
  tax: Number,
  shippingCost: Number,
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  paymentMethod: String,
  shippingMethod: String,
  trackingNumber: String,
  notes: String,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Management',
        isActive: true,
      },
      {
        name: 'John Manager',
        email: 'manager@company.com',
        password: hashedPassword,
        role: 'manager',
        department: 'Operations',
        isActive: true,
      },
      {
        name: 'Sarah Staff',
        email: 'staff@company.com',
        password: hashedPassword,
        role: 'staff',
        department: 'Warehouse',
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
      {
        name: 'Aluminum Sign Sheet 24x36',
        sku: 'ALU-SIGN-001',
        category: 'Sign Materials',
        description: 'Durable aluminum sign sheet, weather-resistant',
        currentStock: 450,
        reorderLevel: 50,
        reorderQuantity: 200,
        unitPrice: 15.99,
        supplier: 'MetalWorks Inc',
        location: 'Warehouse A - Shelf 12',
        status: 'in-stock',
        lastRestocked: new Date(),
      },
      {
        name: 'Vinyl Lettering - White',
        sku: 'VIN-LET-WHT-002',
        category: 'Vinyl Products',
        description: 'Premium white vinyl lettering, outdoor rated',
        currentStock: 8,
        reorderLevel: 15,
        reorderQuantity: 50,
        unitPrice: 2.49,
        supplier: 'Vinyl Distributors LLC',
        location: 'Warehouse B - Shelf 5',
        status: 'low-stock',
        lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'LED Channel Letters - Red',
        sku: 'LED-CHA-RED-003',
        category: 'LED Products',
        description: 'Energy-efficient LED channel letters',
        currentStock: 125,
        reorderLevel: 20,
        reorderQuantity: 100,
        unitPrice: 89.99,
        supplier: 'BrightSign Technologies',
        location: 'Warehouse A - Shelf 3',
        status: 'in-stock',
        lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Acrylic Display Stand',
        sku: 'ACR-DIS-004',
        category: 'Display Materials',
        description: 'Clear acrylic display stand, various sizes',
        currentStock: 0,
        reorderLevel: 10,
        reorderQuantity: 50,
        unitPrice: 12.99,
        supplier: 'PlasticWorks Co',
        location: 'Warehouse B - Shelf 8',
        status: 'out-of-stock',
      },
      {
        name: 'Reflective Sheeting - Yellow',
        sku: 'REF-SHE-YEL-005',
        category: 'Safety Materials',
        description: 'High-visibility reflective sheeting for safety signs',
        currentStock: 320,
        reorderLevel: 50,
        reorderQuantity: 150,
        unitPrice: 8.75,
        supplier: 'SafeSign Materials',
        location: 'Warehouse A - Shelf 15',
        status: 'in-stock',
        lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Corrugated Plastic Signs 18x24',
        sku: 'COR-PLA-006',
        category: 'Sign Materials',
        description: 'Lightweight corrugated plastic signs',
        currentStock: 550,
        reorderLevel: 100,
        reorderQuantity: 300,
        unitPrice: 4.99,
        supplier: 'PlasticWorks Co',
        location: 'Warehouse B - Shelf 2',
        status: 'in-stock',
        lastRestocked: new Date(),
      },
      {
        name: 'Magnetic Sheet Roll',
        sku: 'MAG-SHE-007',
        category: 'Specialty Materials',
        description: 'Flexible magnetic sheet, vehicle-rated',
        currentStock: 14,
        reorderLevel: 20,
        reorderQuantity: 60,
        unitPrice: 24.99,
        supplier: 'MagnaProducts Inc',
        location: 'Warehouse A - Shelf 7',
        status: 'low-stock',
        lastRestocked: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Post-Mounted Sign Frame',
        sku: 'POS-FRA-008',
        category: 'Hardware',
        description: 'Heavy-duty post-mounted sign frame',
        currentStock: 85,
        reorderLevel: 15,
        reorderQuantity: 50,
        unitPrice: 34.50,
        supplier: 'MetalWorks Inc',
        location: 'Warehouse C - Shelf 1',
        status: 'in-stock',
        lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Digital Print Banner Material',
        sku: 'DIG-BAN-009',
        category: 'Print Materials',
        description: 'Weather-resistant banner material for digital printing',
        currentStock: 240,
        reorderLevel: 40,
        reorderQuantity: 120,
        unitPrice: 6.25,
        supplier: 'PrintSupply Distributors',
        location: 'Warehouse B - Shelf 10',
        status: 'in-stock',
        lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Foam Board 1/2 inch',
        sku: 'FOA-BOR-010',
        category: 'Display Materials',
        description: 'Lightweight foam board for displays and presentations',
        currentStock: 180,
        reorderLevel: 30,
        reorderQuantity: 100,
        unitPrice: 3.75,
        supplier: 'DisplayPro Supplies',
        location: 'Warehouse B - Shelf 4',
        status: 'in-stock',
        lastRestocked: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create orders
    console.log('🛒 Creating orders...');
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    };

    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    const paymentStatuses = ['pending', 'paid'];
    const shippingMethods = ['Standard Shipping', 'Express Shipping', 'Next Day Air', 'Freight'];
    const paymentMethods = ['Credit Card', 'Purchase Order', 'Wire Transfer', 'PayPal'];

    const orders = [];
    for (let i = 0; i < 25; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        selectedProducts.push({
          product: product._id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice: product.unitPrice,
          totalPrice: quantity * product.unitPrice,
        });
      }

      const subtotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      const shippingCost = Math.random() > 0.5 ? 15 : 25;
      const totalAmount = subtotal + tax + shippingCost;

      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

      orders.push({
        orderNumber: generateOrderNumber(),
        customer: {
          name: ['ABC Corporation', 'XYZ Industries', 'Smith & Associates', 'Tech Innovations LLC', 'Global Retail Co'][Math.floor(Math.random() * 5)],
          email: `contact${i}@customer.com`,
          phone: `+1-555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          address: `${Math.floor(Math.random() * 9000 + 1000)} Business Ave, Suite ${Math.floor(Math.random() * 500)}, City, ST 12345`,
        },
        items: selectedProducts,
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingMethod: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
        trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString(36).substring(2, 12).toUpperCase()}` : undefined,
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Order.insertMany(orders);
    console.log(`✅ Created ${orders.length} orders`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@company.com / password123');
    console.log('   Manager: manager@company.com / password123');
    console.log('   Staff:   staff@company.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedDatabase();
