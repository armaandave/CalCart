import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, DollarSign, ShoppingCart } from 'lucide-react'
import Aurora from '@/components/Aurora'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Animated Aurora background */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-[42vh] z-0 opacity-[0.22]"
        data-aurora
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)' }}
      >
        <Aurora colorStops={["#66ff33", "#33cccc", "#ccffff"]} blend={0.32} amplitude={0.6} speed={0.8} />
      </div>
      {/* Remove heavy blobs to reduce tint */}
      <svg className="pointer-events-none absolute top-0 left-0 right-0 h-[44vh] opacity-[0.02] z-0" aria-hidden="true" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Minimal Header */}
      <header className="fixed top-0 inset-x-0 z-10 border-b bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium tracking-wide">Recipe Optimizer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="h-8 px-3">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-8 px-3">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Slim Hero */}
        <section className="px-4 pt-28 pb-12">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Cook smarter. Spend less.</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              A focused toolkit for home cooks: optimize recipes, compare prices, and check out in one click.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Link href="/signup">
                <Button className="px-5">Create free account</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">I already have an account</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Three Core Use Cases */}
        <section className="px-4 pb-14">
          <div className="container mx-auto max-w-5xl grid gap-4 md:grid-cols-3">
          <Card className="border-muted hover:shadow-sm transition-shadow">
            <CardHeader className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <ChefHat className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Optimize Recipes</CardTitle>
              <CardDescription className="text-sm">
                Tune ingredients and macros while keeping the dish’s character.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Smart swaps • Nutrition targets • Dietary constraints
            </CardContent>
          </Card>

          <Card className="border-muted hover:shadow-sm transition-shadow">
            <CardHeader className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Compare Prices</CardTitle>
              <CardDescription className="text-sm">
                Map every ingredient to the best store and current price.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Live comparisons • Store optimization • Fees factored in
            </CardContent>
          </Card>

          <Card className="border-muted hover:shadow-sm transition-shadow">
            <CardHeader className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Shop Instantly</CardTitle>
              <CardDescription className="text-sm">
                One-click carts with the exact items you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Pre-filled carts • Consolidated lists • Fast checkout
            </CardContent>
          </Card>
          </div>
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="px-4 py-10 border-t mt-auto relative z-10">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          © 2025 Recipe Optimizer
        </div>
      </footer>
    </div>
  )
}

