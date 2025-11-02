import 'dotenv/config';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function ensureUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}) {
  const existing = await storage.getUserByEmail(params.email);
  if (existing) {
    console.log(`User already exists: ${params.email}`);
    return existing;
  }
  const hashed = await hashPassword(params.password);
  const created = await storage.createUser({
    email: params.email,
    password: hashed,
    firstName: params.firstName,
    lastName: params.lastName,
    isAdmin: !!params.isAdmin,
  } as any);
  console.log(`Created user: ${params.email}${params.isAdmin ? ' (admin)' : ''}`);
  return created;
}

async function ensureRestaurant(params: {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email: string;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  image?: string;
}) {
  // Check if restaurant exists by name
  const existing = await storage.getRestaurants().then(restaurants => 
    restaurants.find(r => r.name === params.name)
  );
  if (existing) {
    console.log(`Restaurant already exists: ${params.name}`);
    return existing;
  }
  
  const created = await storage.createRestaurant({
    name: params.name,
    description: params.description,
    cuisine: params.cuisine,
    address: params.address,
    phone: params.phone,
    email: params.email,
    rating: 0,
    reviewCount: 0,
    deliveryTime: params.deliveryTime,
    deliveryFee: params.deliveryFee,
    minimumOrder: params.minimumOrder,
    isOpen: true,
    image: params.image || null,
  } as any);
  console.log(`Created restaurant: ${params.name}`);
  return created;
}

async function main() {
  try {
    // Users
    await ensureUser({
      email: 'admin@westrowkitchen.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
    });

    await ensureUser({
      email: 'customer@westrowkitchen.com',
      password: 'TestPassword123!',
      firstName: 'Customer',
      lastName: 'User',
      isAdmin: false,
    });

    // Restaurants
    await ensureRestaurant({
      name: 'My Lai Kitchen',
      description: 'Authentic Vietnamese cuisine with fresh ingredients and traditional recipes passed down through generations.',
      cuisine: 'Vietnamese',
      address: '123 Main Street, San Francisco, CA 94102',
      phone: '+1 (555) 123-4567',
      email: 'info@mylaikitchen.com',
      deliveryTime: '25-35 minutes',
      deliveryFee: 2.99,
      minimumOrder: 15.00,
      image: '/assets/My Lai Kitchen Logo_1755170145363.png',
    });

    await ensureRestaurant({
      name: 'Cheeky\'s Burgers',
      description: 'Gourmet burgers made with premium beef, fresh toppings, and our signature cheeky sauce. A local favorite!',
      cuisine: 'American',
      address: '456 Oak Avenue, San Francisco, CA 94103',
      phone: '+1 (555) 234-5678',
      email: 'hello@cheekysburgers.com',
      deliveryTime: '20-30 minutes',
      deliveryFee: 2.99,
      minimumOrder: 12.00,
      image: '/assets/Cheeky\'s Burgers Logo_1755170145363.png',
    });

    await ensureRestaurant({
      name: 'Pappi\'s Pizza',
      description: 'Artisanal wood-fired pizzas with fresh mozzarella, San Marzano tomatoes, and authentic Italian recipes.',
      cuisine: 'Italian',
      address: '789 Pine Street, San Francisco, CA 94104',
      phone: '+1 (555) 345-6789',
      email: 'orders@pappispizza.com',
      deliveryTime: '30-40 minutes',
      deliveryFee: 3.99,
      minimumOrder: 18.00,
      image: '/assets/Pappi\'s Pizza Logo_1755170145362.png',
    });

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();


