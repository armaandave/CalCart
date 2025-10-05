# Recipe Health Optimizer & Smart Grocery Shopping Platform

A comprehensive web application that optimizes user-submitted recipes for health goals while finding the best prices for ingredients across multiple grocery stores. Built with Next.js 14, TypeScript, Prisma, and the Anthropic Claude API.

## Features

- 🍳 **Recipe Management**: Create and manage your favorite recipes
- 🤖 **AI-Powered Optimization**: Optimize recipes for your health goals using Claude AI
- 💰 **Price Comparison**: Compare ingredient prices across multiple grocery stores
- 🛒 **Smart Shopping**: Generate shopping lists with direct Instacart integration
- 📊 **Nutrition Tracking**: Detailed nutritional information for all recipes
- 🏪 **Multi-Store Support**: Find the best prices across different stores

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude API for recipe optimization
- **State Management**: Zustand
- **UI Components**: Radix UI + Tailwind CSS
- **Authentication**: JWT-based auth system

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd alihacks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_optimizer?schema=public"

# Authentication
JWT_SECRET="your-secure-jwt-secret-at-least-32-characters-long"

# Anthropic API
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ENABLE_PRICE_OPTIMIZATION=true
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
alihacks/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── recipes/              # Recipe management
│   │   ├── grocery-list/         # Grocery list operations
│   │   ├── cart/                 # Shopping cart generation
│   │   └── instacart/            # Mock Instacart API
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── recipes/              # Recipe pages
│   │   ├── grocery-lists/        # Grocery list pages
│   │   └── stores/               # Store browsing
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   └── page.tsx                  # Landing page
├── components/
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── services/                 # Business logic services
│   │   ├── recipe-optimizer.ts  # Claude AI integration
│   │   ├── instacart-mock.ts    # Mock Instacart service
│   │   └── price-engine.ts      # Price comparison logic
│   ├── stores/                   # Zustand state stores
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Prisma client
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helper functions
├── mocks/
│   └── data/                     # Mock data for stores/products
├── prisma/
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

## Key Features Explained

### Recipe Optimization

The application uses the Anthropic Claude API to intelligently optimize recipes:

1. Submit any recipe with ingredients and instructions
2. AI analyzes the recipe based on your health goals
3. Suggests healthier ingredient substitutions
4. Maintains the dish's identity and taste
5. Provides detailed nutritional information

### Price Comparison

The price comparison engine:

1. Searches for all ingredients across multiple stores
2. Compares prices in real-time
3. Suggests the best single-store option
4. Identifies multi-store savings opportunities
5. Calculates delivery fees and minimum orders

### Smart Shopping Lists

Generate consolidated shopping lists:

1. Select multiple recipes
2. Automatically consolidates duplicate ingredients
3. Handles unit conversions (cups to tbsp, etc.)
4. Groups items by category
5. Creates deep links to Instacart for one-click checkout

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Recipes
- `POST /api/recipes/create` - Create recipe
- `GET /api/recipes/list` - List all recipes
- `GET /api/recipes/[id]` - Get recipe details
- `POST /api/recipes/optimize` - Optimize recipe with AI
- `DELETE /api/recipes/[id]` - Delete recipe

### Grocery Lists
- `POST /api/grocery-list/create` - Create grocery list
- `GET /api/grocery-list/list` - List all grocery lists
- `GET /api/grocery-list/[id]` - Get list details
- `POST /api/grocery-list/prices` - Fetch price comparisons

### Shopping Cart
- `POST /api/cart/create-link` - Generate Instacart deep link

### Stores
- `GET /api/instacart/stores` - Get available stores
- `POST /api/instacart/search` - Search products

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User**: User accounts and profiles
- **UserProfile**: Dietary preferences, goals, and restrictions
- **Recipe**: Recipe data with ingredients and instructions
- **RecipeIngredient**: Individual recipe ingredients
- **Nutrition**: Nutritional information
- **GroceryList**: Shopping lists
- **GroceryListItem**: Items in a grocery list
- **PriceComparison**: Price data from different stores
- **ShoppingCart**: Generated shopping cart links

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `DATABASE_URL` - Your production PostgreSQL URL
- `JWT_SECRET` - A secure secret for JWT tokens
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `NEXT_PUBLIC_APP_URL` - Your production URL

## Mock Data

The application includes mock data for development:

- **Products**: 36 sample products across categories
- **Stores**: 5 sample stores with realistic pricing
- **Instacart API**: Fully functional mock API with realistic delays

## Future Enhancements

- [ ] Real Instacart API integration
- [ ] Walmart and Kroger API integration
- [ ] Meal planning calendar
- [ ] Recipe sharing and community features
- [ ] Mobile app (React Native)
- [ ] Barcode scanning for pantry management
- [ ] Advanced nutrition analytics
- [ ] Recipe recommendations based on available ingredients

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Support

For questions or issues, please open a GitHub issue.

## Acknowledgments

- **Anthropic Claude** for AI-powered recipe optimization
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for styling
- **Prisma** for database management

---

Built with ❤️ for healthier, more affordable cooking.
