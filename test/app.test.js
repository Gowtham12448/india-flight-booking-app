const request = require('supertest');
const app = require('../src/app');

describe('Domestic Flight Booking API Tests', () => {
  it('GET /health - Should return UP status for container orchestration', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/airports - Should retrieve list of Indian airports', async () => {
    const res = await request(app).get('/api/airports');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(15);
  });

  it('GET /api/flights/search - Should search domestic carrier flights', async () => {
    const res = await request(app).get('/api/flights/search?from=DEL&to=BOM&date=2026-12-01');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(6); // 6 Indian airlines configured
  });

  it('POST /api/bookings - Should create an in-memory PNR booking', async () => {
    const bookingPayload = {
      passengerName: "Aditya Sharma",
      email: "aditya@example.com",
      flightNumber: "6E-101",
      airline: "IndiGo",
      origin: "New Delhi (DEL)",
      destination: "Bengaluru (BLR)",
      date: "2026-12-01",
      priceINR: 4500
    };

    const res = await request(app)
      .post('/api/bookings')
      .send(bookingPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('pnr');
    expect(res.body.data.pnr).toMatch(/^IND-/);
  });
});
