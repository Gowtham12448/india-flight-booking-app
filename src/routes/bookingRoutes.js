// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let bookings = [];

// 1. Create a booking
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

  bookings.unshift(newBooking);
  res.status(201).json({ success: true, message: 'Ticket booked successfully', data: newBooking });
});

// 2. Fetch all bookings
router.get('/', (req, res) => {
  res.json({ success: true, count: bookings.length, data: bookings });
});

// 3. Clear ALL booking history (Must be above /:pnr or matched explicitly)
router.delete('/', (req, res) => {
  const total = bookings.length;
  bookings = [];
  res.json({ success: true, message: `Purged ${total} booking records successfully` });
});

// 4. Retrieve single booking by PNR
router.get('/:pnr', (req, res) => {
  const booking = bookings.find(b => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (!booking) {
    return res.status(404).json({ success: false, message: 'PNR record not found' });
  }
  res.json({ success: true, data: booking });
});

// 5. Cancel a booking
router.patch('/:pnr/cancel', (req, res) => {
  const targetPnr = req.params.pnr.toUpperCase();
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === targetPnr);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'PNR not found' });
  }

  if (bookings[index].status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  }

  bookings[index].status = 'CANCELLED';
  res.json({ success: true, message: `Booking ${targetPnr} cancelled successfully`, data: bookings[index] });
});

// 6. Delete single booking record
router.delete('/:pnr', (req, res) => {
  const targetPnr = req.params.pnr.toUpperCase();
  const originalLength = bookings.length;

  bookings = bookings.filter(b => b.pnr.toUpperCase() !== targetPnr);

  if (bookings.length === originalLength) {
    return res.status(404).json({ success: false, message: 'PNR record not found' });
  }

  res.json({ success: true, message: `Record ${targetPnr} deleted permanently` });
});

module.exports = router;
