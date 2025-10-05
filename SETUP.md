# Setup Guide - Recipe Health Optimizer

This guide will walk you through setting up the Recipe Health Optimizer project from scratch.

## Prerequisites

Before starting, make sure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/) or use a cloud service
- **Anthropic API Key** - [Sign up here](https://console.anthropic.com/)
- **Git** - [Download here](https://git-scm.com/)

## Step-by-Step Setup

### 1. Install Node.js and PostgreSQL

#### macOS (using Homebrew)
```bash
# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15
```

#### Windows
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib
```

### 2. Set Up PostgreSQL Database

#### Create Database
```bash
# Connect to PostgreSQL
psql postgres

# In psql console:
CREATE DATABASE recipe_optimizer;
CREATE USER recipe_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE recipe_optimizer TO recipe_user;

# Exit psql
\q
```

#### Get Connection String
Your connection string will look like:
```
postgresql://recipe_user:your_password_here@localhost:5432/recipe_optimizer?schema=public
```

### 3. Get Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 4. Clone and Install Project

```bash
# Navigate to your projects folder
cd ~/projects

# Clone the repository (if from git)
# git clone <repository-url>
# cd alihacks

# Or if already in the project folder
cd alihacks

# Install dependencies
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your values
nano .env  # or use your preferred editor
```

Update these values in `.env`:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://recipe_user:your_password_here@localhost:5432/recipe_optimizer?schema=public"

# Authentication - Generate a secure secret
JWT_SECRET="generate-a-long-random-string-here-at-least-32-chars"

# Anthropic API - Your API key from step 3
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# App URL (keep as is for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ENABLE_PRICE_OPTIMIZATION=true
```

#### Generate Secure JWT Secret

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Set Up Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify database is set up correctly
npx prisma studio
```

This will open Prisma Studio in your browser where you can view your database tables.

### 7. Start Development Server

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

### 1. Create an Account

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Location: `San Francisco, CA`
4. Click "Create Account"

### 2. Create Your First Recipe

1. Navigate to "My Recipes"
2. Click "New Recipe"
3. Fill in recipe details:
   - Name: `Spaghetti Carbonara`
   - Servings: `4`
   - Add ingredients:
     - `spaghetti`, `400`, `g`
     - `bacon`, `200`, `g`
     - `eggs`, `4`, `whole`
     - `parmesan cheese`, `100`, `g`
   - Add instructions:
     - `Cook pasta according to package directions`
     - `Fry bacon until crispy`
     - `Mix eggs and cheese`
     - `Combine everything and serve`
4. Click "Create Recipe"

### 3. Optimize the Recipe

1. Click "Optimize Recipe" on the recipe page
2. Wait for AI optimization (takes 5-10 seconds)
3. Review the optimized ingredients and nutrition info

### 4. Create a Grocery List

1. Navigate to "Grocery Lists"
2. Click "New List"
3. Name it: `Weekly Shopping`
4. Select your optimized recipe
5. Click "Create List"

### 5. Compare Prices

1. Open your grocery list
2. Click "Compare Prices"
3. Wait for price comparison across stores
4. View recommendations and best prices

### 6. Generate Shopping Cart

1. Click "Shop at [Store Name]" in the recommendations
2. A cart will be generated with deep link to Instacart
3. View the cart details and estimated total

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**

Solution:
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Start PostgreSQL if not running
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Prisma Issues

**Error: "Schema engine error"**

Solution:
```bash
# Reset Prisma
npx prisma generate
npx prisma db push --force-reset
```

### API Key Issues

**Error: "ANTHROPIC_API_KEY is not set"**

Solution:
1. Verify `.env` file exists
2. Check that `ANTHROPIC_API_KEY` is set correctly
3. Restart the dev server after changing `.env`

### Port Already in Use

**Error: "Port 3000 is already in use"**

Solution:
```bash
# Find and kill process using port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or run on a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

**Error: "Cannot find module..."**

Solution:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

## Development Tools

### Prisma Studio
View and edit your database:
```bash
npx prisma studio
```

### TypeScript Type Checking
Check for type errors:
```bash
npx tsc --noEmit
```

### Linting
Check code quality:
```bash
npm run lint
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env` but use production database)
5. Deploy

### Environment Variables for Production

Required variables:
- `DATABASE_URL` - Production PostgreSQL URL
- `JWT_SECRET` - Same secret as development (or new one)
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `NEXT_PUBLIC_APP_URL` - Your production URL

## Next Steps

Once setup is complete:

1. ✅ Explore the dashboard
2. ✅ Create and optimize recipes
3. ✅ Generate grocery lists
4. ✅ Compare prices across stores
5. ✅ Create shopping carts

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review the main [README.md](./README.md)
3. Check the [Troubleshooting](#troubleshooting) section
4. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy cooking! 🍳

