const Product = require('../models/Product');

/**
 * @desc Get Products filtered by Buyer Location & Seller Delivery Geo-Fence Radius
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
          // Geo-fence boolean condition: distance <= deliveryRadius (in meters)
          isWithinDeliveryZone: {
            $lte: ['$distanceMeters', { $multiply: ['$deliveryRadiusKm', 1000] }],
          },
        },
      },
      {
        // Strictly return products where the buyer location is inside the seller's geo-fence radius
        $match: {
          isWithinDeliveryZone: true,
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

    // Step 1: Find product and check status inside session
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

    // Step 2: Atomic Update with concurrency guard condition
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

    // Step 3: Check if target weight is reached to auto-close listing
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

    // Ensure seller owns product or user is Admin
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

