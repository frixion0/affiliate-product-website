import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // Clean existing data
  await db.clickLog.deleteMany();
  await db.productMedia.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();

  // Create categories
  const electronics = await db.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });

  const fashion = await db.category.create({
    data: { name: 'Fashion', slug: 'fashion' },
  });

  const home = await db.category.create({
    data: { name: 'Home & Garden', slug: 'home-garden' },
  });

  // Create products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-noise-cancelling-headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for travel, work, and everyday listening.',
      price: 79.99,
      comparePrice: 149.99,
      affiliateLink: '#',
      categoryId: electronics.id,
      featured: true,
      media: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 2 },
      ],
    },
    {
      name: 'Minimalist Leather Watch',
      slug: 'minimalist-leather-watch',
      description: 'Elegant timepiece with a genuine leather strap and Japanese quartz movement. Water-resistant to 30m with a scratch-resistant sapphire crystal.',
      price: 45.00,
      comparePrice: 89.99,
      affiliateLink: '#',
      categoryId: fashion.id,
      featured: true,
      media: [
        { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Smart Home Speaker',
      slug: 'smart-home-speaker',
      description: 'Voice-controlled smart speaker with rich, room-filling sound. Built-in smart home hub to control lights, thermostats, and more.',
      price: 49.99,
      comparePrice: 99.99,
      affiliateLink: '#',
      categoryId: electronics.id,
      featured: false,
      media: [
        { url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Premium Cotton T-Shirt Pack',
      slug: 'premium-cotton-tshirt-pack',
      description: 'Pack of 3 ultra-soft 100% organic cotton t-shirts. Pre-shrunk fabric with reinforced seams for long-lasting comfort.',
      price: 34.99,
      comparePrice: 59.99,
      affiliateLink: '#',
      categoryId: fashion.id,
      featured: false,
      media: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Ceramic Plant Pot Set',
      slug: 'ceramic-plant-pot-set',
      description: 'Set of 3 handmade ceramic plant pots in modern minimalist design. Includes drainage holes and bamboo saucers. Perfect for succulents and small plants.',
      price: 28.99,
      comparePrice: 54.99,
      affiliateLink: '#',
      categoryId: home.id,
      featured: true,
      media: [
        { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Portable Bluetooth Speaker',
      slug: 'portable-bluetooth-speaker',
      description: 'Compact waterproof Bluetooth speaker with 360-degree sound. 12-hour battery life and built-in microphone for hands-free calls.',
      price: 29.99,
      comparePrice: 59.99,
      affiliateLink: '#',
      categoryId: electronics.id,
      featured: false,
      media: [
        { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Bamboo Desk Organizer',
      slug: 'bamboo-desk-organizer',
      description: 'Eco-friendly bamboo desk organizer with multiple compartments for pens, phones, and accessories. Keeps your workspace tidy and stylish.',
      price: 19.99,
      comparePrice: 39.99,
      affiliateLink: '#',
      categoryId: home.id,
      featured: false,
      media: [
        { url: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
      ],
    },
    {
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless denim jacket made from premium selvedge denim. Features a modern slim fit with classic button closure and chest pockets.',
      price: 68.00,
      comparePrice: 120.00,
      affiliateLink: '#',
      categoryId: fashion.id,
      featured: true,
      media: [
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&h=450&fit=crop', type: 'image', source: 'upload', sortOrder: 2 },
      ],
    },
  ];

  for (const prod of products) {
    const { media, ...productData } = prod;
    await db.product.create({
      data: {
        ...productData,
        media: {
          create: media,
        },
      },
    });
  }

  console.log('✅ Seed complete: 3 categories, 8 products created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
