// test/app.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Domestic Flight Booking API Tests', () => {
  it('GET /health - Verifies healthcheck probe', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/airports - Confirms Indian airport database', async () => {
    const res = await request(app).get('/api/airports');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(25);
  });

  it('GET /api/flights/search - High density metro trunk (DEL -> BOM) returns large frequency', async () => {
    const res = await request(app).get('/api/flights/search?from=DEL&to=BOM&date=2026-11-20');
    expect(res.statusCode).toEqual(200);
    // Metros have 10+ flights across carriers
    expect(res.body.count).toBeGreaterThanOrEqual(10);
    expect(res.body.data[0].distanceKm).toBeGreaterThan(1000);
  });

  it('GET /api/flights/search - Tier-2 / Regional route (VTZ -> HYD) returns moderate frequency', async () => {
    const res = await request(app).get('/api/flights/search?from=VTZ&to=HYD&date=2026-11-20');
    expect(res.statusCode).toEqual(200);
    // VTZ to HYD returns between 3 and 7 flights
    expect(res.body.count).toBeGreaterThanOrEqual(3);
    expect(res.body.count).toBeLessThanOrEqual(8);
  });

  it('GET /api/flights/search - Regional route (BLR -> TIR) includes regional carriers', async () => {
    const res = await request(app).get('/api/flights/search?from=BLR&to=TIR&date=2026-11-20');
    expect(res.statusCode).toEqual(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data[0].distanceKm).toBeLessThan(350);
  });

  it('POST /api/bookings - Verifies booking ticket generation', async () => {
    const bookingPayload = {
      passengerName: "Rohan Varma",
      email: "rohan@example.com",
      flightNumber: "6E-2104",
      airline: "IndiGo",
      origin: "New Delhi (DEL)",
      destination: "Mumbai (BOM)",
      date: "2026-11-20",
      priceINR: 5400
    };

    const res = await request(app).post('/api/bookings').send(bookingPayload);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.pnr).toMatch(/^IND-/);
  });
});
