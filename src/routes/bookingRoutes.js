// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let bookings = [];

// Create a new booking
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

  bookings.unshift(newBooking); // Add to beginning of array
  res.status(201).json({ success: true, message: 'Ticket booked successfully', data: newBooking });
});

// Get all bookings
router.get('/', (req, res) => {
  res.json({ success: true, count: bookings.length, data: bookings });
});

// Retrieve booking by PNR
router.get('/:pnr', (req, res) => {
  const booking = bookings.find(b => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (!booking) {
    return res.status(404).json({ success: false, message: 'PNR record not found' });
  }
  res.json({ success: true, data: booking });
});

// Cancel a booking (Change status to CANCELLED)
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

// Delete a single booking permanently from history
router.delete('/:pnr', (req, res) => {
  const targetPnr = req.params.pnr.toUpperCase();
  const initialLength = bookings.length;
  
  bookings = bookings.filter(b => b.pnr.toUpperCase() !== targetPnr);

  if (bookings.length === initialLength) {
    return res.status(404).json({ success: false, message: 'PNR not found in history' });
  }

  res.json({ success: true, message: `Booking record ${targetPnr} deleted permanently from history` });
});

// Purge all booking history
router.delete('/', (req, res) => {
  const totalPurged = bookings.length;
  bookings = [];
  res.json({ success: true, message: `Cleared all ${totalPurged} booking records from history` });
});

module.exports = router;
