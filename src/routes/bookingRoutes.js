// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let bookings = [];

router.post('/', (req, res) => {
  const {
    passengerName,
    email,
    phone,
    flightNumber,
    airline,
    origin,
    destination,
    date,
    priceINR,
    allocatedSeat,
    selectedMeal,
    paymentMethod
  } = req.body;

  if (!passengerName?.trim() || !email?.trim() || !flightNumber?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing mandatory booking details (passengerName, email, flightNumber)'
    });
  }

  const newBooking = {
    pnr: `IND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    bookingId: uuidv4(),
    passengerName: passengerName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || "N/A",
    flightNumber,
    airline,
    origin,
    destination,
    date,
    priceINR: Number(priceINR),
    allocatedSeat: allocatedSeat || "12B",
    selectedMeal: selectedMeal || "None",
    paymentMethod: paymentMethod || "Card",
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  res.status(201).json({ success: true, message: 'Ticket booked successfully', data: newBooking });
});

router.get('/', (req, res) => {
  res.json({ success: true, count: bookings.length, data: bookings });
});

router.get('/:pnr', (req, res) => {
  const booking = bookings.find(b => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (!booking) {
    return res.status(404).json({ success: false, message: 'PNR record not found' });
  }
  res.json({ success: true, data: booking });
});

module.exports = router;
