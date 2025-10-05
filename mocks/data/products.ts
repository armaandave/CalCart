import { Product } from '@/lib/types'

export const mockProducts: Product[] = [
  // Produce
  {
    id: 'prod_001',
    name: 'Organic Bananas',
    brand: 'Whole Foods',
    price: 0.79,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    available: true,
    storeId: 'store_001',
    category: 'produce'
  },
  {
    id: 'prod_002',
    name: 'Bananas',
    brand: 'Dole',
    price: 0.59,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    available: true,
    storeId: 'store_002',
    category: 'produce'
  },
  {
    id: 'prod_003',
    name: 'Roma Tomatoes',
    brand: 'Local Farms',
    price: 1.49,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-227e7dd35618',
    available: true,
    storeId: 'store_001',
    category: 'produce'
  },
  {
    id: 'prod_004',
    name: 'Tomatoes',
    brand: 'Store Brand',
    price: 1.29,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-227e7dd35618',
    available: true,
    storeId: 'store_002',
    category: 'produce'
  },
  {
    id: 'prod_005',
    name: 'Organic Spinach',
    brand: 'Earthbound Farm',
    price: 3.99,
    unit: 'bag',
    size: '10 oz',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    available: true,
    storeId: 'store_001',
    category: 'produce'
  },
  {
    id: 'prod_006',
    name: 'Baby Spinach',
    brand: 'Store Brand',
    price: 2.99,
    unit: 'bag',
    size: '10 oz',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    available: true,
    storeId: 'store_002',
    category: 'produce'
  },
  {
    id: 'prod_007',
    name: 'Avocados',
    brand: 'Hass',
    price: 1.99,
    unit: 'each',
    size: '1 avocado',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578',
    available: true,
    storeId: 'store_001',
    category: 'produce'
  },
  {
    id: 'prod_008',
    name: 'Yellow Onions',
    brand: 'Local',
    price: 0.89,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510',
    available: true,
    storeId: 'store_001',
    category: 'produce'
  },
  
  // Dairy
  {
    id: 'prod_009',
    name: 'Whole Milk',
    brand: 'Organic Valley',
    price: 5.99,
    unit: 'gallon',
    size: '1 gallon',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_010',
    name: 'Whole Milk',
    brand: 'Store Brand',
    price: 3.99,
    unit: 'gallon',
    size: '1 gallon',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    available: true,
    storeId: 'store_002',
    category: 'dairy'
  },
  {
    id: 'prod_011',
    name: '2% Milk',
    brand: 'Horizon',
    price: 4.99,
    unit: 'half-gallon',
    size: '64 oz',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_012',
    name: 'Almond Milk',
    brand: 'Silk',
    price: 3.99,
    unit: 'half-gallon',
    size: '64 oz',
    imageUrl: 'https://images.unsplash.com/photo-1622909826581-bfa88fba7a7f',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_013',
    name: 'Greek Yogurt',
    brand: 'Fage',
    price: 5.99,
    unit: 'container',
    size: '32 oz',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_014',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    price: 4.99,
    unit: 'container',
    size: '32 oz',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    available: true,
    storeId: 'store_002',
    category: 'dairy'
  },
  {
    id: 'prod_015',
    name: 'Cheddar Cheese',
    brand: 'Tillamook',
    price: 6.99,
    unit: 'block',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_016',
    name: 'Eggs',
    brand: 'Happy Eggs',
    price: 5.99,
    unit: 'dozen',
    size: '12 eggs',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc1f3e29a1',
    available: true,
    storeId: 'store_001',
    category: 'dairy'
  },
  {
    id: 'prod_017',
    name: 'Eggs',
    brand: 'Store Brand',
    price: 3.99,
    unit: 'dozen',
    size: '12 eggs',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc1f3e29a1',
    available: true,
    storeId: 'store_002',
    category: 'dairy'
  },
  
  // Meat
  {
    id: 'prod_018',
    name: 'Chicken Breast',
    brand: 'Organic',
    price: 8.99,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791',
    available: true,
    storeId: 'store_001',
    category: 'meat'
  },
  {
    id: 'prod_019',
    name: 'Chicken Breast',
    brand: 'Regular',
    price: 5.99,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791',
    available: true,
    storeId: 'store_002',
    category: 'meat'
  },
  {
    id: 'prod_020',
    name: 'Ground Beef',
    brand: '93% Lean',
    price: 7.99,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
    available: true,
    storeId: 'store_001',
    category: 'meat'
  },
  {
    id: 'prod_021',
    name: 'Ground Beef',
    brand: '80% Lean',
    price: 5.99,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
    available: true,
    storeId: 'store_002',
    category: 'meat'
  },
  {
    id: 'prod_022',
    name: 'Salmon Fillet',
    brand: 'Wild Caught',
    price: 12.99,
    unit: 'lb',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
    available: true,
    storeId: 'store_001',
    category: 'meat'
  },
  
  // Grains & Pasta
  {
    id: 'prod_023',
    name: 'Brown Rice',
    brand: 'Lundberg',
    price: 4.99,
    unit: 'bag',
    size: '2 lb',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    available: true,
    storeId: 'store_001',
    category: 'grains'
  },
  {
    id: 'prod_024',
    name: 'White Rice',
    brand: 'Store Brand',
    price: 2.99,
    unit: 'bag',
    size: '2 lb',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    available: true,
    storeId: 'store_002',
    category: 'grains'
  },
  {
    id: 'prod_025',
    name: 'Whole Wheat Pasta',
    brand: 'Barilla',
    price: 2.49,
    unit: 'box',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
    available: true,
    storeId: 'store_001',
    category: 'grains'
  },
  {
    id: 'prod_026',
    name: 'Regular Pasta',
    brand: 'Barilla',
    price: 1.99,
    unit: 'box',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
    available: true,
    storeId: 'store_002',
    category: 'grains'
  },
  {
    id: 'prod_027',
    name: 'Quinoa',
    brand: 'Ancient Harvest',
    price: 5.99,
    unit: 'bag',
    size: '1 lb',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    available: true,
    storeId: 'store_001',
    category: 'grains'
  },
  {
    id: 'prod_028',
    name: 'Oatmeal',
    brand: 'Quaker',
    price: 4.99,
    unit: 'container',
    size: '42 oz',
    imageUrl: 'https://images.unsplash.com/photo-1517686748114-11f2a34e2346',
    available: true,
    storeId: 'store_001',
    category: 'grains'
  },
  
  // Pantry
  {
    id: 'prod_029',
    name: 'Olive Oil',
    brand: 'California Olive Ranch',
    price: 12.99,
    unit: 'bottle',
    size: '25.4 oz',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  {
    id: 'prod_030',
    name: 'Olive Oil',
    brand: 'Store Brand',
    price: 7.99,
    unit: 'bottle',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
    available: true,
    storeId: 'store_002',
    category: 'pantry'
  },
  {
    id: 'prod_031',
    name: 'Black Beans',
    brand: 'Goya',
    price: 1.29,
    unit: 'can',
    size: '15 oz',
    imageUrl: 'https://images.unsplash.com/photo-1584255014406-2a7a3a55b5f1',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  {
    id: 'prod_032',
    name: 'Peanut Butter',
    brand: 'Jif',
    price: 4.99,
    unit: 'jar',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1566845015531-c5e8e67b9a21',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  {
    id: 'prod_033',
    name: 'Almond Butter',
    brand: 'Justin\'s',
    price: 8.99,
    unit: 'jar',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1566845015531-c5e8e67b9a21',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  {
    id: 'prod_034',
    name: 'Honey',
    brand: 'Local',
    price: 9.99,
    unit: 'jar',
    size: '16 oz',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784363',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  
  // Condiments
  {
    id: 'prod_035',
    name: 'Soy Sauce',
    brand: 'Kikkoman',
    price: 3.99,
    unit: 'bottle',
    size: '15 oz',
    imageUrl: 'https://images.unsplash.com/photo-1632834990446-81f79c4b7ef3',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  },
  {
    id: 'prod_036',
    name: 'Hot Sauce',
    brand: 'Cholula',
    price: 3.49,
    unit: 'bottle',
    size: '12 oz',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1',
    available: true,
    storeId: 'store_001',
    category: 'pantry'
  }
]

