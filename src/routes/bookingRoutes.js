const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-Memory store (No Database dependency)
let bookings = [];

// Create a new booking
router.post('/', (req, res) => {
  const { passengerName, email, phone, flightNumber, airline, origin, destination, date, priceINR } = req.body;

  if (!passengerName || !email || !flightNumber) {
    return res.status(400).json({
      success: false,
      message: 'Missing mandatory booking details (passengerName, email, flightNumber)'
    });
  }

  const newBooking = {
    pnr: `IND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    bookingId: uuidv4(),
    passengerName,
    email,
    phone: phone || "N/A",
    flightNumber,
    airline,
    origin,
    destination,
    date,
    priceINR,
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString()
  };

  bookings.push(newBooking);
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

// Cancel booking
router.delete('/:pnr', (req, res) => {
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'PNR not found' });
  }
  bookings[index].status = 'CANCELLED';
  res.json({ success: true, message: 'Booking cancelled successfully', data: bookings[index] });
});

module.exports = router;
