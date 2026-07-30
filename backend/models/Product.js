const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Kudumbashree', 'HarvestingTomorrow', 'Dairy', 'Handicrafts', 'OrganicVegetables', 'ProcessedFood', 'Organic Foods', 'Home Care', 'Textiles'],
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['standard', 'pre_harvest'],
      default: 'standard',
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'gram', 'packet', 'litre', 'ml', '500ml', '250g', 'piece', 'bundle', 'bottle', 'bar', 'pack'],
      default: 'kg',
    },
    // GeoJSON Point representing seller dispatch / crop harvest location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    deliveryRadiusKm: {
      type: Number,
      required: [true, 'Delivery radius in km is required'],
      default: 5.0, // Default 5km radius for Kudumbashree local geo-fence
      min: [0.5, 'Minimum delivery radius is 0.5km'],
      max: [50.0, 'Maximum delivery radius is 50km'],
    },
    distanceKm: {
      type: Number,
      default: 1.0,
    },
    images: [
      {
        type: String, // S3 bucket URLs
      },
    ],
    // --- Pre-Harvesting (Zero-Waste Agriculture) Fields ---
    harvestDate: {
      type: Date,
      required: function () {
        return this.type === 'pre_harvest';
      },
    },
    targetQuantityKg: {
      type: Number,
      required: function () {
        return this.type === 'pre_harvest';
      },
      min: [1, 'Target quantity must be at least 1 kg'],
    },
    bookedQuantityKg: {
      type: Number,
      default: 0,
      min: [0, 'Booked quantity cannot be negative'],
    },
    isPreBookingClosed: {
      type: Boolean,
      default: false,
    },
    // Status tracking
    status: {
      type: String,
      enum: ['available', 'fully_booked', 'sold_out', 'archived'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location-based proximity and geo-fence filtering
productSchema.index({ location: '2dsphere' });
// Compound index for listing query performance
productSchema.index({ type: 1, status: 1, harvestDate: 1 });

module.exports = mongoose.model('Product', productSchema);
