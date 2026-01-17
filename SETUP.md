# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas account)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/enterprise-erp
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key-here
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/enterprise-erp
```

**Getting OpenAI API Key** (Required for AI features):
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy and paste into `.env.local`

💡 **Note**: AI features will show fallback responses if OpenAI key is not configured.

### 3. Start MongoDB (if using local installation)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Seed the Database (Optional but Recommended)
This creates demo users, products, and orders:

```bash
node scripts/seed.js
```

**Demo Login Credentials:**
- Admin: `admin@company.com` / `password123`
- Manager: `manager@company.com` / `password123`
- Staff: `staff@company.com` / `password123`

### 5. Start the Development Server
```bash
npm run dev
```

### 6. Open Your Browser
Navigate to: `http://localhost:3000`

## 🎯 First Steps

1. **Register a new account** or use demo credentials
2. **Explore the Dashboard** - View analytics, AI insights, and recent orders
3. **Try AI Assistant** - Go to AI Assistant tab and ask questions
4. **Check Inventory** - Browse products and use AI to generate descriptions
5. **Create an Order** - Process a test order
6. **View Analytics** - See charts and AI-powered insights

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env.local`
- Verify network access if using MongoDB Atlas

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

For issues or questions:
1. Check the README.md
2. Review the code comments
3. Open an issue on GitHub

---

**Ready to get started? Run `npm install` and follow the steps above!**
