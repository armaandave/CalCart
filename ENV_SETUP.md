# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Development Environment Variables
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
# Replace with your PostgreSQL credentials
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://recipe_user:password@localhost:5432/recipe_optimizer?schema=public"

# Authentication Secret
# Generate a secure secret using: openssl rand -base64 32
JWT_SECRET="your-generated-secure-jwt-secret-here"

# Anthropic API Key
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"

# Feature Flags
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ENABLE_PRICE_OPTIMIZATION=true
```

## How to Get Each Value

### DATABASE_URL

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   ```

2. **Create database and user**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # In psql console:
   CREATE DATABASE recipe_optimizer;
   CREATE USER recipe_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE recipe_optimizer TO recipe_user;
   \q
   ```

3. **Build connection string**
   ```
   postgresql://recipe_user:your_password@localhost:5432/recipe_optimizer?schema=public
   ```

### JWT_SECRET

Generate a secure random string:

```bash
# Option 1: Using OpenSSL (macOS/Linux)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Copy the output and use it as your JWT_SECRET.

### ANTHROPIC_API_KEY

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Paste it as your ANTHROPIC_API_KEY

**Important**: Keep this key secret! Never commit it to version control.

## Verify Your Setup

After creating your `.env` file:

```bash
# Test database connection
npx prisma db push

# If successful, you'll see:
# "Your database is now in sync with your schema."
```

## Example .env File

Here's a complete example (replace with your actual values):

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL="postgresql://recipe_user:mySecurePassword123@localhost:5432/recipe_optimizer?schema=public"

JWT_SECRET="aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9=="

ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ENABLE_PRICE_OPTIMIZATION=true
```

## Security Notes

⚠️ **Never commit your `.env` file to version control!**

The `.gitignore` file already includes `.env` to prevent accidental commits.

✅ Good practices:
- Use different secrets for development and production
- Store production secrets in your deployment platform (Vercel, etc.)
- Rotate API keys regularly
- Use strong, random JWT secrets

## Troubleshooting

### "Environment variable not found" error

Make sure:
1. File is named exactly `.env` (not `.env.txt`)
2. File is in project root directory
3. No spaces around the `=` sign
4. Values with spaces are wrapped in quotes
5. Server was restarted after creating `.env`

### Database connection fails

Check:
1. PostgreSQL is running
2. Database name is correct
3. Username and password are correct
4. Host and port are correct (default: localhost:5432)

### API key not working

Verify:
1. Key starts with `sk-ant-`
2. Key is copied completely (no extra spaces)
3. Key is active in Anthropic console
4. You have API credits available

## Need Help?

See the main [SETUP.md](./SETUP.md) for detailed setup instructions.

