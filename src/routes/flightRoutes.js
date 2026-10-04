const express = require('express');
const router = express.Router();
const airports = require('../data/airports');
const airlines = require('../data/airlines');

router.get('/search', (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide from, to, and date query parameters'
    });
  }

  if (from.toUpperCase() === to.toUpperCase()) {
    return res.status(400).json({
      success: false,
      message: 'Departure and arrival airports cannot be the same'
    });
  }

  const origin = airports.find(a => a.code === from.toUpperCase());
  const destination = airports.find(a => a.code === to.toUpperCase());

  if (!origin || !destination) {
    return res.status(404).json({
      success: false,
      message: 'Invalid origin or destination airport code'
    });
  }

  // Generate simulated dynamic flights for all airlines
  const flights = airlines.map((airline, idx) => {
    const flightNum = `${airline.code}-${100 + (idx * 115) + (origin.code.charCodeAt(0) % 50)}`;
    const departureHour = 6 + (idx * 3);
    const departureTime = `${String(departureHour).padStart(2, '0')}:30`;
    const arrivalTime = `${String((departureHour + 2) % 24).padStart(2, '0')}:45`;
    
    // Slight variance in price calculation
    const distanceModifier = Math.abs(origin.code.charCodeAt(0) - destination.code.charCodeAt(0)) * 25;
    const finalPrice = airline.baseFare + distanceModifier;

    return {
      flightNumber: flightNum,
      airline: airline.name,
      airlineCode: airline.code,
      origin: origin.city + ` (${origin.code})`,
      destination: destination.city + ` (${destination.code})`,
      date,
      departureTime,
      arrivalTime,
      duration: "2h 15m",
      priceINR: finalPrice,
      availableSeats: 12 + (idx * 4)
    };
  });

  res.json({ success: true, count: flights.length, data: flights });
});

module.exports = router;
