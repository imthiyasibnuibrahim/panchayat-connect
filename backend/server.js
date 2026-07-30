const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models for initial seeding
const User = require('./models/User');
const Job = require('./models/Job');
const Product = require('./models/Product');
const Notice = require('./models/Notice');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const productRoutes = require('./routes/productRoutes');
const alertRoutes = require('./routes/alertRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/grievances', grievanceRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Panchayat Connect API is running' });
});

// Seed Initial Data if database is empty
const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📦 Database already has existing records. Refreshing seeded products...');
      await Product.deleteMany({});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    let users;
    if (userCount === 0) {
      users = await User.insertMany([
        {
          name: 'Central Admin',
          phoneNumber: '+919999999999',
          password: hashedPassword,
          role: 'Admin',
          aadhaarNumber: '111122223333',
          wardNumber: '4',
          houseNumber: 'ADM-01',
          panchayatName: 'Ward 4 Central Panchayat',
          district: 'Ernakulam',
          isPhoneVerified: true,
          status: 'Active',
          location: { type: 'Point', coordinates: [76.2711, 10.8505] },
        },
        {
          name: 'Kudumbashree Unit Leader',
          phoneNumber: '+917777777777',
          password: hashedPassword,
          role: 'Seller',
          aadhaarNumber: '222233334444',
          wardNumber: '4',
          houseNumber: 'KDB-42',
          panchayatName: 'Ward 4 Central Panchayat',
          district: 'Ernakulam',
          isPhoneVerified: true,
          status: 'Active',
          location: { type: 'Point', coordinates: [76.2731, 10.8525] },
        },
        {
          name: 'President Mary',
          phoneNumber: '+916666666666',
          password: hashedPassword,
          role: 'Authority',
          aadhaarNumber: '333344445555',
          wardNumber: '4',
          houseNumber: 'GOV-01',
          panchayatName: 'Ward 4 Central Panchayat',
          district: 'Ernakulam',
          isPhoneVerified: true,
          status: 'Active',
          location: { type: 'Point', coordinates: [76.2705, 10.8495] },
        },
        {
          name: 'Citizen John Doe',
          phoneNumber: '+918888888888',
          password: hashedPassword,
          role: 'Citizen',
          aadhaarNumber: '444455556666',
          wardNumber: '4',
          houseNumber: 'H-102',
          panchayatName: 'Ward 4 Central Panchayat',
          district: 'Ernakulam',
          isPhoneVerified: true,
          status: 'Active',
          location: { type: 'Point', coordinates: [76.2721, 10.8515] },
        },
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
    } else {
      users = await User.find();
    }

    const sellerId = users[1] ? users[1]._id : users[0]._id;

    // 14 Kudumbashree & Local Products with varying distanceKm values
    await Product.insertMany([
      {
        title: 'Organic Mango Pickle',
        category: 'Kudumbashree',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 120,
        unit: 'packet',
        description: 'Authentic home-prepared mango pickle made by local Kudumbashree unit using traditional spices.',
        location: { type: 'Point', coordinates: [76.2711, 10.8505] },
        deliveryRadiusKm: 5,
        distanceKm: 0.8,
      },
      {
        title: 'Homemade Jackfruit Chips (Chakka Chips)',
        category: 'Kudumbashree',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 90,
        unit: 'packet',
        description: 'Crispy raw jackfruit fried in 100% pure coconut oil by Ward 4 Kudumbashree Self Help Group.',
        location: { type: 'Point', coordinates: [76.2715, 10.8510] },
        deliveryRadiusKm: 5,
        distanceKm: 1.2,
      },
      {
        title: 'Pure Cold Pressed Coconut Oil',
        category: 'Organic Foods',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 240,
        unit: '500ml',
        description: 'Unrefined, 100% organic cold-pressed coconut oil extracted from local ward coconut groves.',
        location: { type: 'Point', coordinates: [76.2720, 10.8518] },
        deliveryRadiusKm: 10,
        distanceKm: 1.5,
      },
      {
        title: 'Handcrafted Coir Door Mats',
        category: 'Handicrafts',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 180,
        unit: 'piece',
        description: 'Durable eco-friendly natural coir entrance door mats crafted by local artisans.',
        location: { type: 'Point', coordinates: [76.2730, 10.8522] },
        deliveryRadiusKm: 8,
        distanceKm: 2.1,
      },
      {
        title: 'Organic Banana Powder (Kannan Kaya)',
        category: 'Organic Foods',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 150,
        unit: '250g',
        description: '100% natural raw Nendran banana powder ideal for baby food and healthy porridge.',
        location: { type: 'Point', coordinates: [76.2740, 10.8530] },
        deliveryRadiusKm: 6,
        distanceKm: 2.8,
      },
      {
        title: 'Herbal Eco Floor Cleaner',
        category: 'Home Care',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 110,
        unit: 'bottle',
        description: 'Non-toxic, aromatic lemongrass herbal disinfectant floor cleaner made by Kudumbashree enterprise.',
        location: { type: 'Point', coordinates: [76.2750, 10.8540] },
        deliveryRadiusKm: 5,
        distanceKm: 3.4,
      },
      {
        title: 'Handwoven Cotton Saree',
        category: 'Textiles',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 850,
        unit: 'piece',
        description: 'Traditional Kerala handloom cotton saree woven by local weavers.',
        location: { type: 'Point', coordinates: [76.2760, 10.8550] },
        deliveryRadiusKm: 12,
        distanceKm: 4.2,
      },
      {
        title: 'Bamboo Storage Baskets',
        category: 'Handicrafts',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 220,
        unit: 'piece',
        description: 'Handcrafted natural bamboo baskets for home organization and kitchen vegetable storage.',
        location: { type: 'Point', coordinates: [76.2770, 10.8560] },
        deliveryRadiusKm: 8,
        distanceKm: 4.8,
      },
      {
        title: 'Kudumbashree Special Meat Masala',
        category: 'Kudumbashree',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 65,
        unit: 'packet',
        description: 'Freshly roasted and ground Kerala spice mix prepared with zero artificial preservatives.',
        location: { type: 'Point', coordinates: [76.2780, 10.8570] },
        deliveryRadiusKm: 10,
        distanceKm: 5.5,
      },
      {
        title: 'Organic Wild Honey (Wayanad)',
        category: 'Organic Foods',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 320,
        unit: 'bottle',
        description: 'Pure forest wild honey harvested ethically by tribal Kudumbashree collectives.',
        location: { type: 'Point', coordinates: [76.2790, 10.8580] },
        deliveryRadiusKm: 15,
        distanceKm: 6.2,
      },
      {
        title: 'Handmade Neem & Turmeric Soap',
        category: 'Home Care',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 50,
        unit: 'bar',
        description: 'Natural Ayurvedic bath soap made with organic virgin coconut oil, neem, and wild turmeric.',
        location: { type: 'Point', coordinates: [76.2800, 10.8590] },
        deliveryRadiusKm: 10,
        distanceKm: 7.5,
      },
      {
        title: 'Traditional Brass Nilavilakku (Lamp)',
        category: 'Handicrafts',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 650,
        unit: 'piece',
        description: 'Hand-cast solid brass traditional Kerala oil lamp crafted by cottage industry artisans.',
        location: { type: 'Point', coordinates: [76.2820, 10.8610] },
        deliveryRadiusKm: 15,
        distanceKm: 8.9,
      },
      {
        title: 'Organic Kerala Matta Rice',
        category: 'Organic Foods',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 210,
        unit: 'kg',
        description: 'Nutritious unpolished red matta rice cultivated by local paddy farmers using organic manure.',
        location: { type: 'Point', coordinates: [76.2840, 10.8630] },
        deliveryRadiusKm: 15,
        distanceKm: 10.2,
      },
      {
        title: 'Handloom Bath Towels (Set of 2)',
        category: 'Textiles',
        seller: sellerId,
        type: 'standard',
        pricePerUnit: 290,
        unit: 'pack',
        description: 'High-absorbency 100% pure cotton handloom bath towels made by Kudumbashree textile wing.',
        location: { type: 'Point', coordinates: [76.2860, 10.8650] },
        deliveryRadiusKm: 15,
        distanceKm: 11.5,
      },
      {
        title: 'Organic Tapioca (Kappa)',
        category: 'Organic Foods',
        seller: sellerId,
        type: 'pre_harvest',
        pricePerUnit: 40,
        unit: 'kg',
        description: 'Fresh organic cassava tapioca pre-harvest booking.',
        location: { type: 'Point', coordinates: [76.2731, 10.8525] },
        deliveryRadiusKm: 10,
        distanceKm: 1.0,
        harvestDate: new Date(Date.now() + 86400000),
        targetQuantityKg: 100,
        bookedQuantityKg: 75,
      }
    ]);

    console.log('✅ Database seeded successfully with 15 Kudumbashree & Local Products!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const PORT = process.env.PORT || 5000;

// Initialize Server & Database Connection
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('ℹ️ No MONGO_URI provided in env. Initializing MongoMemoryServer for development...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected successfully to: ${mongoUri}`);
    
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 Panchayat Connect API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
