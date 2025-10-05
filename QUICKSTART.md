# Quick Start Guide

Get the Recipe Health Optimizer running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running locally
- Anthropic API key

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Create database
createdb recipe_optimizer

# Alternative: Use psql
psql postgres -c "CREATE DATABASE recipe_optimizer;"
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.local .env

# Edit .env and update these values:
# - DATABASE_URL (your PostgreSQL connection string)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - ANTHROPIC_API_KEY (from https://console.anthropic.com/)
```

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## Test the App

1. **Sign Up**: Create account at `/signup`
2. **Create Recipe**: Add a recipe with ingredients
3. **Optimize**: Click "Optimize Recipe" to improve for health goals
4. **Grocery List**: Create a list from your recipes
5. **Compare Prices**: See prices across stores
6. **Shop**: Generate Instacart cart link

## Common Issues

### Database Connection Failed
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Port 3000 In Use
```bash
# Run on different port
npm run dev -- -p 3001
```

### Missing API Key
Make sure `ANTHROPIC_API_KEY` is set in `.env` file

## What's Included

✅ Full authentication system  
✅ Recipe creation and management  
✅ AI-powered recipe optimization  
✅ Price comparison across stores  
✅ Smart grocery list generation  
✅ Instacart cart integration  
✅ Nutrition tracking  
✅ Modern, responsive UI  

## Next Steps

- Read the full [README.md](./README.md) for details
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Explore the code structure in `/app`, `/lib`, and `/components`

## Need Help?

- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review API documentation in [README.md](./README.md)
- Open an issue on GitHub

---

Enjoy building healthier recipes! 🥗

