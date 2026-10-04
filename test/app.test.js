// test/app.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Domestic Flight Booking API & Lifecycle Tests', () => {
  let createdPnr = '';

  it('GET /health - Verifies container health probe', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('POST /api/bookings - Creates a booking with seat and meal', async () => {
    const payload = {
      passengerName: "Vikram Rathore",
      email: "vikram@example.com",
      flightNumber: "6E-2004",
      airline: "IndiGo",
      origin: "New Delhi (DEL)",
      destination: "Mumbai (BOM)",
      date: "2026-11-20",
      priceINR: 5200,
      allocatedSeat: "1A",
      selectedMeal: "South Indian Tiffin",
      paymentMethod: "UPI"
    };

    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('pnr');
    expect(res.body.data.status).toBe('CONFIRMED');
    createdPnr = res.body.data.pnr;
  });

  it('PATCH /api/bookings/:pnr/cancel - Successfully cancels an active booking', async () => {
    const res = await request(app).patch(`/api/bookings/${createdPnr}/cancel`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('DELETE /api/bookings/:pnr - Permanently deletes booking from history', async () => {
    const res = await request(app).delete(`/api/bookings/${createdPnr}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
