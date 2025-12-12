import mongoose from 'mongoose';
import ServiceableCity from '../models/serviceableCity.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed Script for Serviceable Cities
 * 
 * Initializes the database with initial serviceable cities
 * Run with: node server/src/scripts/seedServiceableCities.js
 */

const initialCities = [
  {
    city: 'Gaya',
    state: 'Bihar',
    country: 'India',
    displayName: 'Gaya, Bihar',
    priority: 10, // Higher priority (shows first)
    isActive: true,
    description: 'Gaya is one of our primary service locations offering comprehensive beauty and wellness services.',
    coveragePincodes: ['823001', '823002', '823003', '823004'],
    launchDate: new Date('2024-01-01'),
    notes: 'Initial launch city - Full service coverage'
  },
  {
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    displayName: 'Patna, Bihar',
    priority: 9, // Slightly lower priority than Gaya
    isActive: true,
    description: 'Patna, the capital city of Bihar, is served with premium beauty and wellness services.',
    coveragePincodes: ['800001', '800002', '800003', '800004', '800005', '800006', '800007', '800008'],
    launchDate: new Date('2024-01-15'),
    notes: 'Capital city - Expanding service coverage'
  }
];

const seedServiceableCities = async () => {
  try {
    console.log('🌱 [Seed] Starting serviceable cities seed...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/makeover';
    console.log('🔗 [Seed] Connecting to MongoDB:', mongoURI.replace(/\/\/.*@/, '//***@'));
    
    await mongoose.connect(mongoURI);
    console.log('✅ [Seed] Connected to MongoDB');
    
    // Check if cities already exist
    const existingCities = await ServiceableCity.find({
      city: { $in: ['Gaya', 'Patna'] }
    });
    
    if (existingCities.length > 0) {
      console.log('ℹ️ [Seed] Cities already exist in database:');
      existingCities.forEach(city => {
        console.log(`   - ${city.city}, ${city.state} (${city.isActive ? 'Active' : 'Inactive'})`);
      });
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to re-seed (this will delete existing cities)? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ [Seed] Seed cancelled by user');
        process.exit(0);
      }
      
      // Delete existing cities
      console.log('🗑️ [Seed] Deleting existing cities...');
      await ServiceableCity.deleteMany({ city: { $in: ['Gaya', 'Patna'] } });
      console.log('✅ [Seed] Existing cities deleted');
    }
    
    // Insert initial cities
    console.log('➕ [Seed] Inserting initial serviceable cities...');
    const insertedCities = await ServiceableCity.insertMany(initialCities);
    
    console.log('✅ [Seed] Successfully seeded serviceable cities:');
    insertedCities.forEach(city => {
      console.log(`   ✓ ${city.city}, ${city.state} (Priority: ${city.priority})`);
    });
    
    // Display summary
    console.log('\n📊 [Seed] Summary:');
    console.log(`   Total cities: ${insertedCities.length}`);
    console.log(`   Active cities: ${insertedCities.filter(c => c.isActive).length}`);
    console.log(`   Inactive cities: ${insertedCities.filter(c => !c.isActive).length}`);
    
    console.log('\n🎉 [Seed] Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ [Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 [Seed] Database connection closed');
    process.exit(0);
  }
};

// Run seed
seedServiceableCities();




