const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Product = require('./models/Product');
const Notice = require('./models/Notice');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/panchayat_connect';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany();
    await Job.deleteMany();
    await Product.deleteMany();
    await Notice.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        phoneNumber: '+919999999999',
        password: hashedPassword,
        role: 'Admin',
        panchayatName: 'Ward 4',
        district: 'Ernakulam',
        location: { type: 'Point', coordinates: [76.2711, 10.8505] }
      },
      {
        name: 'Citizen John',
        phoneNumber: '+918888888888',
        password: hashedPassword,
        role: 'Citizen',
        panchayatName: 'Ward 4',
        district: 'Ernakulam',
        location: { type: 'Point', coordinates: [76.2721, 10.8515] }
      },
      {
        name: 'Farmer Kunjumon',
        phoneNumber: '+917777777777',
        password: hashedPassword,
        role: 'Farmer',
        panchayatName: 'Ward 4',
        district: 'Ernakulam',
        location: { type: 'Point', coordinates: [76.2731, 10.8525] }
      }
    ]);

    await Job.insertMany([
      {
        title: 'Data Entry Operator',
        type: 'vacancy',
        department: 'Panchayat Office',
        description: 'Handling digital entry for citizen applications.',
        locationName: 'Panchayat Office - Block B',
        stipendOrSalary: '₹15,000 / month',
        deadline: new Date('2026-08-15'),
        category: 'Clerical'
      },
      {
        title: 'Carbon Neutral Survey Intern',
        type: 'internship',
        department: 'ASAP Kerala',
        description: 'Survey ward 4 for carbon footprint data.',
        locationName: 'Ward 4 Field',
        stipendOrSalary: 'Certificate + ₹5,000',
        deadline: new Date('2026-08-10'),
        category: 'Environmental'
      }
    ]);

    await Product.insertMany([
      {
        title: 'Organic Mango Pickle',
        category: 'Kudumbashree',
        seller: users[0]._id, // Just picking first user as seller for demo
        type: 'standard',
        pricePerUnit: 120,
        unit: 'packet',
        location: { type: 'Point', coordinates: [76.2711, 10.8505] },
        deliveryRadiusKm: 5
      },
      {
        title: 'Organic Tapioca (Kappa)',
        category: 'HarvestingTomorrow',
        seller: users[2]._id,
        type: 'pre_harvest',
        pricePerUnit: 40,
        unit: 'kg',
        location: { type: 'Point', coordinates: [76.2731, 10.8525] },
        deliveryRadiusKm: 10,
        harvestDate: new Date(Date.now() + 86400000), // Tomorrow
        targetQuantityKg: 100,
        bookedQuantityKg: 75
      }
    ]);

    console.log('Data Seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
