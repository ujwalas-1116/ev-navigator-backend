const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 4.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  chargerTypes: [{
    type: String,
    enum: ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'],
    default: ['CCS2']
  }],
  chargingSpeed: {
    type: String, // 'Fast', 'Slow', 'Ultra-Fast'
    default: 'Fast'
  },
  pricingPerKwh: {
    type: Number,
    required: true
  },
  slotsTotal: {
    type: Number,
    default: 4
  },
  slotsOccupied: {
    type: Number,
    default: 0
  },
  distanceKm: {
    type: Number,
    required: true
  },
  openHours: {
    type: String,
    default: 'Open 24 Hours'
  }
});

module.exports = mongoose.model('Station', StationSchema);
