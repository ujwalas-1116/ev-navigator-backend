const express = require('express');
const router = express.Router();
const Station = require('../models/Station');

// Seed mock data
const mockStations = [
  {
    name: 'Tata Power Charging Station',
    address: 'Near Central Highway Plaza, Sector 12',
    lat: 12.9716,
    lng: 77.5946,
    rating: 4.5,
    reviewsCount: 120,
    chargerTypes: ['CCS2', 'Type 2'],
    chargingSpeed: 'Fast',
    pricingPerKwh: 18.5,
    slotsTotal: 4,
    slotsOccupied: 2,
    distanceKm: 2.0,
    openHours: 'Open 24 Hours'
  },
  {
    name: 'Jio-bp pulse Charging Station',
    address: 'Downtown Petrol Pump complex, Main Rd',
    lat: 12.9650,
    lng: 77.6010,
    rating: 4.2,
    reviewsCount: 90,
    chargerTypes: ['CCS2', 'CHAdeMO'],
    chargingSpeed: 'Fast',
    pricingPerKwh: 16.0,
    slotsTotal: 6,
    slotsOccupied: 5,
    distanceKm: 3.5,
    openHours: 'Open 24 Hours'
  },
  {
    name: 'Zeon Charging Station',
    address: 'Tech Park Gate 3 Parking, Ring Road',
    lat: 12.9850,
    lng: 77.5850,
    rating: 4.6,
    reviewsCount: 150,
    chargerTypes: ['CCS2', 'GB/T'],
    chargingSpeed: 'Ultra-Fast',
    pricingPerKwh: 22.0,
    slotsTotal: 4,
    slotsOccupied: 1,
    distanceKm: 5.0,
    openHours: 'Open 24 Hours'
  },
  {
    name: 'Relux Charging Station',
    address: 'Metro Station Level 1 Basement, North End',
    lat: 12.9590,
    lng: 77.5890,
    rating: 3.9,
    reviewsCount: 45,
    chargerTypes: ['Type 2'],
    chargingSpeed: 'Slow',
    pricingPerKwh: 12.5,
    slotsTotal: 2,
    slotsOccupied: 2,
    distanceKm: 1.2,
    openHours: 'Open 24 Hours'
  },
  {
    name: 'Shell Recharge Station',
    address: 'Shell Fuel Station, East Expressway',
    lat: 12.9910,
    lng: 77.6150,
    rating: 4.7,
    reviewsCount: 80,
    chargerTypes: ['CCS2'],
    chargingSpeed: 'Ultra-Fast',
    pricingPerKwh: 24.0,
    slotsTotal: 8,
    slotsOccupied: 4,
    distanceKm: 6.8,
    openHours: 'Open 24 Hours'
  }
];

// Seed Endpoint - Seeds mock stations into DB if empty
router.post('/seed', async (req, res) => {
  try {
    // Delete existing
    await Station.deleteMany({});
    // Insert new
    const stations = await Station.insertMany(mockStations);
    res.status(201).json({ message: 'Stations seeded successfully!', count: stations.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error seeding station data' });
  }
});

// Get all stations (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { search, speed, type } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Speed filter
    if (speed) {
      query.chargingSpeed = speed;
    }

    // Charger Type filter
    if (type) {
      query.chargerTypes = type;
    }

    let stations = await Station.find(query);
    
    // If database is empty, return the mock data directly so frontend works without explicit seeding
    if (stations.length === 0 && !search && !speed && !type) {
      return res.json(mockStations);
    }

    res.json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving stations' });
  }
});

// Get specific station by ID
router.get('/:id', async (req, res) => {
  try {
    // If it's a mock index rather than mongodb ID (for offline mode)
    if (req.params.id.length < 12) {
      const idx = parseInt(req.params.id, 10);
      if (!isNaN(idx) && idx >= 0 && idx < mockStations.length) {
        return res.json(mockStations[idx]);
      }
      return res.status(404).json({ message: 'Station not found' });
    }

    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving station' });
  }
});

module.exports = router;
