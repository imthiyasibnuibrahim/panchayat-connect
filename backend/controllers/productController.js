const Product = require('../models/Product');

// Fallback seed products for Kudumbashree Marketplace when database is empty
const MOCK_KUDUMBASHREE_PRODUCTS = [
  {
    _id: 'ks_prod_1',
    title: 'Pure Kerala Homemade Cut Mango Pickle',
    description: 'Traditional sun-cured Kerala cut mango pickle prepared with organic sesame oil and authentic spices by local Ward 4 unit.',
    category: 'Homemade Foods',
    price: 140,
    pricePerUnit: 140,
    unit: '500g',
    sellerUnitName: 'Swasraya Kudumbashree Unit (Ward 4)',
    sellerPhone: '+919847123456',
    status: 'available',
    stockQuantity: 45,
    distanceKm: 1.2
  },
  {
    _id: 'ks_prod_2',
    title: 'Wayanad Organic Black Pepper Powder',
    description: 'Single-origin, sun-dried aromatic black pepper milled fresh by Ward 4 women micro-enterprise.',
    category: 'Spices & Oils',
    price: 260,
    pricePerUnit: 260,
    unit: '250g',
    sellerUnitName: 'Haritha Kudumbashree Unit (Ward 4)',
    sellerPhone: '+919847654321',
    status: 'available',
    stockQuantity: 30,
    distanceKm: 2.1
  },
  {
    _id: 'ks_prod:3',
    title: 'Cold-Pressed Pure Virgin Coconut Oil',
    description: '100% natural, unrefined virgin coconut oil extracted from locally sourced copra.',
    category: 'Spices & Oils',
    price: 210,
    pricePerUnit: 210,
    unit: 'litre',
    sellerUnitName: 'Kera Samrudhi Kudumbashree Unit',
    sellerPhone: '+919847998877',
    status: 'available',
    stockQuantity: 50,
    distanceKm: 0.8
  },
  {
    _id: 'ks_prod_4',
    title: 'Handcrafted Eco-Friendly Banana Fiber Tote Bag',
    description: 'Durable, stylish handwoven banana plantain fiber shopping bag created by local artisans.',
    category: 'Handicrafts',
    price: 320,
    pricePerUnit: 320,
    unit: 'piece',
    sellerUnitName: 'Kripa Kudumbashree Craft Unit',
    sellerPhone: '+919847332211',
    status: 'available',
    stockQuantity: 15,
    distanceKm: 3.4
  },
  {
    _id: 'ks_prod_5',
    title: 'Fresh Organic Free-Range Farm Country Eggs',
    description: 'Nutritious country chicken eggs from backyard poultry units in Ward 4.',
    category: 'Organic Poultry',
    price: 90,
    pricePerUnit: 90,
    unit: 'bundle',
    sellerUnitName: 'Nanma Kudumbashree Poultry Unit',
    sellerPhone: '+919847554433',
    status: 'available',
    stockQuantity: 60,
    distanceKm: 1.5
  }
];

/**
 * @desc Get all products (Kudumbashree Marketplace)
 * @route GET /api/v1/products
 * @access Public / Citizen
 */
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'available' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const dbProducts = await Product.find(query).sort({ createdAt: -1 });

    if (dbProducts.length > 0) {
      const formatted = dbProducts.map(p => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.pricePerUnit || p.price,
        pricePerUnit: p.pricePerUnit || p.price,
        unit: p.unit || 'kg',
        sellerUnitName: p.sellerUnitName || `Kudumbashree Unit (Ward ${p.wardNumber || '4'})`,
        sellerPhone: p.sellerPhone || '+919876543210',
        status: p.status,
        stockQuantity: p.stockQuantity || 20,
        distanceKm: p.distanceKm || 1.5
      }));
      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    }

    // Fallback to seed Kudumbashree marketplace items if DB has no products
    let filteredFallback = MOCK_KUDUMBASHREE_PRODUCTS;
    if (category && category !== 'All') {
      filteredFallback = filteredFallback.filter(p => p.category === category);
    }

    return res.status(200).json({
      success: true,
      count: filteredFallback.length,
      data: filteredFallback,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return fallback seed products on DB connection fallback
    return res.status(200).json({
      success: true,
      count: MOCK_KUDUMBASHREE_PRODUCTS.length,
      data: MOCK_KUDUMBASHREE_PRODUCTS,
    });
  }
};

/**
 * @desc Get Products filtered by Buyer Location & Calculated Distance
 * @route GET /api/v1/products/nearby
 * @access Public / Citizen
 */
exports.getProductsWithinDeliveryRadius = async (req, res) => {
  try {
    const { lng, lat, category, type } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        error: 'Longitude (lng) and Latitude (lat) are required parameters.',
      });
    }

    const buyerCoordinates = [parseFloat(lng), parseFloat(lat)];

    // Build query conditions
    const matchConditions = { status: 'available' };
    if (category) matchConditions.category = category;
    if (type) matchConditions.type = type;

    // MongoDB Aggregation Pipeline using $geoNear for accurate Geo-Fencing
    const products = await Product.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: buyerCoordinates,
          },
          distanceField: 'distanceMeters',
          maxDistance: 50000, // Search up to 50km radius so client-side slider works smoothly
          spherical: true,
          query: matchConditions,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          seller: 1,
          type: 1,
          pricePerUnit: 1,
          unit: 1,
          images: 1,
          location: 1,
          deliveryRadiusKm: 1,
          harvestDate: 1,
          targetQuantityKg: 1,
          bookedQuantityKg: 1,
          status: 1,
          createdAt: 1,
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
        },
      },
      {
        $sort: { distanceMeters: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      buyerLocation: { lng: buyerCoordinates[0], lat: buyerCoordinates[1] },
      data: products,
    });
  } catch (error) {
    console.error('Error fetching nearby products:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while performing geospatial search',
    });
  }
};

/**
 * @desc Pre-book crops under "Harvesting Tomorrow" (Atomic zero-waste inventory management)
 * @route POST /api/v1/products/:id/pre-book
 * @access Private (Citizen/Buyer)
 */
exports.preBookHarvestCrop = async (req, res) => {
  const session = await Product.startSession();
  session.startTransaction();

  try {
    const { productId } = req.params;
    const { quantityKg } = req.body;

    const bookingQty = parseFloat(quantityKg);

    if (!bookingQty || bookingQty <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Please specify a valid booking quantity in kg greater than 0',
      });
    }

    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: 'Harvest listing not found' });
    }

    if (product.type !== 'pre_harvest') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'Product is not a pre-harvest crop listing' });
    }

    if (product.isPreBookingClosed || product.status === 'fully_booked') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Pre-booking for this harvest listing is already closed/fully booked.',
      });
    }

    const availableKg = product.targetQuantityKg - product.bookedQuantityKg;
    if (bookingQty > availableKg) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: `Requested quantity (${bookingQty} kg) exceeds remaining available harvest capacity (${availableKg.toFixed(1)} kg).`,
      });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        isPreBookingClosed: false,
        $expr: {
          $lte: [{ $add: ['$bookedQuantityKg', bookingQty] }, '$targetQuantityKg'],
        },
      },
      {
        $inc: { bookedQuantityKg: bookingQty },
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedProduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        error: 'Conflict: Another buyer completed a pre-booking concurrently. Please retry.',
      });
    }

    if (updatedProduct.bookedQuantityKg >= updatedProduct.targetQuantityKg) {
      updatedProduct.status = 'fully_booked';
      updatedProduct.isPreBookingClosed = true;
      await updatedProduct.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Successfully pre-booked ${bookingQty} kg of ${updatedProduct.title}!`,
      data: {
        productId: updatedProduct._id,
        bookedQuantityKg: updatedProduct.bookedQuantityKg,
        targetQuantityKg: updatedProduct.targetQuantityKg,
        remainingKg: updatedProduct.targetQuantityKg - updatedProduct.bookedQuantityKg,
        status: updatedProduct.status,
        isFullyBooked: updatedProduct.isPreBookingClosed,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in pre-booking harvest:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process pre-booking due to internal error',
    });
  }
};

/**
 * @desc Create new product listing (Seller - Kudumbashree / Admin)
 * @route POST /api/v1/products
 * @access Private (Seller, Admin)
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      pricePerUnit,
      unit,
      deliveryRadiusKm,
      harvestDate,
      targetQuantityKg,
      lng,
      lat,
    } = req.body;

    if (!title || !category || !pricePerUnit || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required product fields: title, category, pricePerUnit, unit',
      });
    }

    const product = await Product.create({
      title,
      description,
      category: category || 'Kudumbashree',
      seller: req.user._id,
      type: type || 'standard',
      pricePerUnit: parseFloat(pricePerUnit),
      unit,
      deliveryRadiusKm: parseFloat(deliveryRadiusKm || 5),
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      targetQuantityKg: targetQuantityKg ? parseFloat(targetQuantityKg) : undefined,
      bookedQuantityKg: 0,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(lng || (req.user.location ? req.user.location.coordinates[0] : 76.2711)),
          parseFloat(lat || (req.user.location ? req.user.location.coordinates[1] : 10.8505)),
        ],
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully on Kudumbashree Marketplace!',
      data: product,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc Get products listed by the logged-in seller
 * @route GET /api/v1/products/seller/my-products
 * @access Private (Seller, Admin)
 */
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Delete product listing
 * @route DELETE /api/v1/products/:id
 * @access Private (Seller, Admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only delete your own products',
      });
    }

    await product.deleteOne();
    return res.status(200).json({ success: true, message: 'Product listing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
