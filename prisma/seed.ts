import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and tech', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop' },
  { name: 'Clothing', slug: 'clothing', description: 'Premium fashion & apparel', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop' },
  { name: 'Home & Living', slug: 'home-living', description: 'Elevate your living space', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop' },
  { name: 'Accessories', slug: 'accessories', description: 'Complete your look', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop' },
  { name: 'Sports', slug: 'sports', description: 'Gear up for performance', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
  { name: 'Beauty', slug: 'beauty', description: 'Luxury skincare & cosmetics', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop' },
];

const products = [
  // Electronics
  { name: 'Wireless Noise-Canceling Headphones', slug: 'wireless-nc-headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio support. Crafted with memory foam ear cushions for all-day comfort.', price: 299.99, comparePrice: 399.99, categorySlug: 'electronics', images: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop"]', featured: true, trending: true, rating: 4.8, reviewCount: 234, stock: 45, tags: 'bestseller,new' },
  { name: 'Ultra-Slim Laptop Pro', slug: 'ultra-slim-laptop-pro', description: '14-inch 4K OLED display, M3 chip, 16GB RAM, 512GB SSD. Only 2.8mm at its thinnest point. All-day battery life for professionals on the go.', price: 1499.99, comparePrice: 1799.99, categorySlug: 'electronics', images: '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop"]', featured: true, trending: false, rating: 4.9, reviewCount: 567, stock: 23, tags: 'premium,top-rated' },
  { name: 'Smart Watch Series X', slug: 'smart-watch-x', description: 'Advanced health monitoring, GPS, always-on Retina display, water resistant to 100m. Track your fitness goals with precision sensors and 7-day battery life.', price: 449.99, comparePrice: 499.99, categorySlug: 'electronics', images: '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&h=800&fit=crop"]', featured: false, trending: true, rating: 4.6, reviewCount: 891, stock: 120, tags: 'trending,popular' },
  { name: 'Wireless Charging Pad', slug: 'wireless-charging-pad', description: 'Qi-certified 15W fast wireless charger with LED indicator and anti-slip surface. Compatible with all Qi-enabled devices.', price: 39.99, comparePrice: 59.99, categorySlug: 'electronics', images: '["https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=800&h=800&fit=crop"]', featured: false, trending: false, rating: 4.3, reviewCount: 445, stock: 200, tags: 'value' },

  // Clothing
  { name: 'Merino Wool Overcoat', slug: 'merino-wool-overcoat', description: 'Italian merino wool blend overcoat with satin lining. Tailored fit with notch lapel. Perfect for the modern professional who demands elegance and warmth.', price: 389.99, comparePrice: 520.00, categorySlug: 'clothing', images: '["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1544923246-77307dd270b1?w=800&h=800&fit=crop"]', featured: true, trending: false, rating: 4.7, reviewCount: 156, stock: 30, tags: 'premium,seasonal' },
  { name: 'Organic Cotton Tee', slug: 'organic-cotton-tee', description: '100% GOTS-certified organic cotton. Pre-shrunk, enzyme-washed for softness. Relaxed fit with reinforced collar stitching. Ethically manufactured.', price: 49.99, comparePrice: null, categorySlug: 'clothing', images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop"]', featured: false, trending: true, rating: 4.5, reviewCount: 1203, stock: 500, tags: 'bestseller,sustainable' },
  { name: 'Performance Joggers', slug: 'performance-joggers', description: '4-way stretch moisture-wicking fabric with hidden zip pocket. Tapered fit with elastic cuff. From gym to street without missing a beat.', price: 89.99, comparePrice: 119.99, categorySlug: 'clothing', images: '["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=800&fit=crop"]', featured: false, trending: true, rating: 4.4, reviewCount: 678, stock: 180, tags: 'active,popular' },

  // Home & Living
  { name: 'Scandinavian Floor Lamp', slug: 'scandinavian-floor-lamp', description: 'Minimalist arc floor lamp with linen shade and brass-finished steel base. Adjustable height from 160cm to 180cm. Warm ambient lighting for any room.', price: 249.99, comparePrice: 329.99, categorySlug: 'home-living', images: '["https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=800&fit=crop"]', featured: true, trending: false, rating: 4.6, reviewCount: 89, stock: 35, tags: 'designer' },
  { name: 'Handwoven Throw Blanket', slug: 'handwoven-throw-blanket', description: 'Artisan-crafted from 100% New Zealand wool. Herringbone pattern in neutral tones. 130x180cm — generous size for sofa or bed.', price: 149.99, comparePrice: 199.99, categorySlug: 'home-living', images: '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop"]', featured: false, trending: false, rating: 4.8, reviewCount: 234, stock: 60, tags: 'artisan' },
  { name: 'Ceramic Planter Set', slug: 'ceramic-planter-set', description: 'Set of 3 minimalist ceramic planters in matte earth tones. Includes drainage holes and bamboo saucers. Perfect for succulents and small plants.', price: 69.99, comparePrice: null, categorySlug: 'home-living', images: '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop"]', featured: false, trending: false, rating: 4.3, reviewCount: 312, stock: 90, tags: 'value,gift' },

  // Accessories
  { name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', description: 'Full-grain vegetable-tanned leather with adjustable strap. Interior card slots and zip pocket. Develops a beautiful patina over time.', price: 189.99, comparePrice: 249.99, categorySlug: 'accessories', images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop"]', featured: true, trending: true, rating: 4.7, reviewCount: 456, stock: 40, tags: 'bestseller,premium' },
  { name: 'Titanium Sunglasses', slug: 'titanium-sunglasses', description: 'Ultra-lightweight titanium frame with polarized CR-39 lenses. UV400 protection. Japanese hinge construction for durability. Comes with leather case.', price: 219.99, comparePrice: 279.99, categorySlug: 'accessories', images: '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop"]', featured: false, trending: true, rating: 4.5, reviewCount: 267, stock: 55, tags: 'popular,designer' },

  // Sports
  { name: 'Carbon Fiber Running Shoes', slug: 'carbon-fiber-running-shoes', description: 'Race-day performance with full-length carbon fiber plate. NitroFoam midsole delivers 40% more energy return. Weighs just 198g.', price: 199.99, comparePrice: 259.99, categorySlug: 'sports', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop"]', featured: true, trending: true, rating: 4.8, reviewCount: 1023, stock: 75, tags: 'bestseller,performance' },
  { name: 'Yoga Mat Pro', slug: 'yoga-mat-pro', description: '6mm natural rubber mat with alignment markings. Non-slip microfiber surface. Includes carrying strap. Eco-friendly and free from PVC, TPE, and toxic adhesives.', price: 79.99, comparePrice: null, categorySlug: 'sports', images: '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop"]', featured: false, trending: false, rating: 4.6, reviewCount: 534, stock: 150, tags: 'sustainable' },

  // Beauty
  { name: 'Vitamin C Serum', slug: 'vitamin-c-serum', description: '20% L-ascorbic acid with hyaluronic acid and vitamin E. Brightens, firms, and protects. Clinically proven to reduce dark spots in 4 weeks.', price: 59.99, comparePrice: 79.99, categorySlug: 'beauty', images: '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop","https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop"]', featured: true, trending: true, rating: 4.7, reviewCount: 2156, stock: 300, tags: 'bestseller,skincare' },
  { name: 'Luxury Fragrance Set', slug: 'luxury-fragrance-set', description: 'Collection of 5 artisan fragrances in 10ml travel sprays. Notes of bergamot, oud, amber, and white tea. Hand-blended in small batches.', price: 129.99, comparePrice: 175.00, categorySlug: 'beauty', images: '["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop"]', featured: false, trending: false, rating: 4.9, reviewCount: 178, stock: 45, tags: 'gift,premium' },
];

const reviews = [
  { productSlug: 'wireless-nc-headphones', author: 'Sarah M.', rating: 5, comment: 'Best headphones I have ever owned. The noise cancellation is incredible and the battery lasts forever.' },
  { productSlug: 'wireless-nc-headphones', author: 'James K.', rating: 5, comment: 'Worth every penny. Sound quality is phenomenal and they are so comfortable for long sessions.' },
  { productSlug: 'wireless-nc-headphones', author: 'Emily R.', rating: 4, comment: 'Great sound and build quality. Wish the carrying case was a bit more compact.' },
  { productSlug: 'ultra-slim-laptop-pro', author: 'David L.', rating: 5, comment: 'This laptop is a beast in a beautiful form factor. The OLED display is breathtaking.' },
  { productSlug: 'ultra-slim-laptop-pro', author: 'Anna P.', rating: 5, comment: 'As a designer, this display is perfection. Color accuracy is spot on out of the box.' },
  { productSlug: 'ultra-slim-laptop-pro', author: 'Michael T.', rating: 4, comment: 'Incredible machine. Only wish it had more ports without needing a dongle.' },
  { productSlug: 'leather-crossbody-bag', author: 'Lisa W.', rating: 5, comment: 'The leather quality is exceptional. It gets more beautiful with age.' },
  { productSlug: 'leather-crossbody-bag', author: 'Kate N.', rating: 4, comment: 'Perfect size for everyday use. The patina is developing beautifully.' },
  { productSlug: 'carbon-fiber-running-shoes', author: 'Marcus J.', rating: 5, comment: 'Shaved 2 minutes off my half marathon. The carbon plate makes a real difference.' },
  { productSlug: 'carbon-fiber-running-shoes', author: 'Rachel S.', rating: 5, comment: 'Like running on clouds. So lightweight and responsive.' },
  { productSlug: 'vitamin-c-serum', author: 'Priya D.', rating: 5, comment: 'My skin has never looked better. Dark spots are visibly fading after 3 weeks.' },
  { productSlug: 'vitamin-c-serum', author: 'Nina C.', rating: 4, comment: 'Lightweight and absorbs quickly. A little goes a long way.' },
  { productSlug: 'merino-wool-overcoat', author: 'Tom H.', rating: 5, comment: 'The fit is impeccable. Feels luxurious and keeps me warm in the city.' },
  { productSlug: 'smart-watch-x', author: 'Chris B.', rating: 4, comment: 'Great fitness tracking features. Battery easily lasts 5 days with heavy use.' },
  { productSlug: 'organic-cotton-tee', author: 'Megan L.', rating: 5, comment: 'So soft and the fit is perfect. Love that it is organic too.' },
  { productSlug: 'scandinavian-floor-lamp', author: 'Oliver R.', rating: 5, comment: 'Transforms the whole room. The warm light is incredibly cozy.' },
  { productSlug: 'titanium-sunglasses', author: 'Sophie A.', rating: 5, comment: 'The lightest sunglasses I have ever worn. Polarized lenses are crystal clear.' },
  { productSlug: 'luxury-fragrance-set', author: 'Daniel F.', rating: 5, comment: 'Each fragrance is unique and sophisticated. Perfect for travel.' },
];

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`Created ${categories.length} categories`);

  // Create products
  const categoryMap: Record<string, string> = {};
  const allCategories = await prisma.category.findMany();
  for (const cat of allCategories) {
    categoryMap[cat.slug] = cat.id;
  }

  for (const prod of products) {
    const { categorySlug, images, ...rest } = prod;
    await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoryMap[categorySlug],
        images: images as string,
      },
    });
  }
  console.log(`Created ${products.length} products`);

  // Create reviews
  const productMap: Record<string, string> = {};
  const allProducts = await prisma.product.findMany();
  for (const prod of allProducts) {
    productMap[prod.slug] = prod.id;
  }

  for (const review of reviews) {
    const { productId, ...data } = review;
    await prisma.review.create({
      data: {
        author: data.author,
        rating: data.rating,
        comment: data.comment,
        productId: productMap[data.productSlug],
      },
    });
  }
  console.log(`Created ${reviews.length} reviews`);

  console.log('Database seeded successfully!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
