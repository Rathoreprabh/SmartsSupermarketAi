import { db } from './index';
import { users, products } from './schema';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    // await db.delete(products);
    // await db.delete(users);

    // Seed sample products
    const sampleProducts = [
      {
        name: 'Fresh Organic Tomatoes',
        description: 'Ripe and juicy organic tomatoes from local farmers',
        price: '4.99',
        stock: 100,
        category: 'Fruits & Vegetables',
        sku: 'PROD-001',
        image: 'https://images.pexels.com/photos/60582/tomatoes-bowl-food-fresh-60582.jpeg',
        isActive: true,
      },
      {
        name: 'Free-Range Eggs',
        description: '12 pack of fresh free-range eggs',
        price: '5.99',
        stock: 50,
        category: 'Dairy & Eggs',
        sku: 'PROD-002',
        image: 'https://images.pexels.com/photos/5737440/pexels-photo-5737440.jpeg',
        isActive: true,
      },
      {
        name: 'Grass-Fed Beef',
        description: '500g of premium grass-fed beef',
        price: '12.99',
        stock: 30,
        category: 'Meat & Fish',
        sku: 'PROD-003',
        image: 'https://images.pexels.com/photos/6510/meat-food-raw-beef.jpg',
        isActive: true,
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Fresh baked whole wheat bread',
        price: '3.49',
        stock: 75,
        category: 'Bakery',
        sku: 'PROD-004',
        image: 'https://images.pexels.com/photos/6646135/pexels-photo-6646135.jpeg',
        isActive: true,
      },
      {
        name: 'Fresh Orange Juice',
        description: '1L of fresh squeezed orange juice',
        price: '4.49',
        stock: 60,
        category: 'Beverages',
        sku: 'PROD-005',
        image: 'https://images.pexels.com/photos/320220/pexels-photo-320220.jpeg',
        isActive: true,
      },
    ];

    console.log('📦 Inserting sample products...');
    await db.insert(products).values(sampleProducts).onConflictDoNothing();

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
