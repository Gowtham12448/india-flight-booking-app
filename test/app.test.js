// test/app.test.js
const request = require('supertest');
const app = require('../src/app');

describe('AirBharat Domestic Flight Booking Engine Test Suite', () => {
  let createdPnr = '';

  // 1. Healthcheck & Orchestration Probe
  describe('Health Check Endpoint', () => {
    it('GET /health - Should return UP status for container monitoring', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'UP');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // 2. Airport Directory Verification
  describe('Airports API', () => {
    it('GET /api/airports - Should retrieve list of Indian airports with coordinates', async () => {
      const res = await request(app).get('/api/airports');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(20);

      // Verify essential airport attributes for flight calculations
      const sampleAirport = res.body.data[0];
      expect(sampleAirport).toHaveProperty('code');
      expect(sampleAirport).toHaveProperty('city');
      expect(sampleAirport).toHaveProperty('lat');
      expect(sampleAirport).toHaveProperty('lon');
      expect(sampleAirport).toHaveProperty('isMetro');
    });
  });

  // 3. Dynamic Real-Time Flight Scheduling Engine
  describe('Flight Search & Routing API', () => {
    it('GET /api/flights/search - Metro Trunk (DEL -> BOM) returns high frequency schedule', async () => {
      const res = await request(app).get('/api/flights/search?from=DEL&to=BOM&date=2026-11-20');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(8);
      expect(res.body.route.origin).toBe('New Delhi');
      expect(res.body.route.destination).toBe('Mumbai');

      const firstFlight = res.body.data[0];
      expect(firstFlight).toHaveProperty('flightNumber');
      expect(firstFlight).toHaveProperty('airline');
      expect(firstFlight).toHaveProperty('departureTime');
      expect(firstFlight).toHaveProperty('arrivalTime');
      expect(firstFlight).toHaveProperty('priceINR');
      expect(firstFlight.priceINR).toBeGreaterThan(2500);
    });

    it('GET /api/flights/search - Tier-2 Corridor (VTZ -> HYD) returns moderate frequency', async () => {
      const res = await request(app).get('/api/flights/search?from=VTZ&to=HYD&date=2026-11-20');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(3);
      expect(res.body.count).toBeLessThanOrEqual(10);
    });

    it('GET /api/flights/search - Regional sector (BLR -> TIR) validates regional travel', async () => {
      const res = await request(app).get('/api/flights/search?from=BLR&to=TIR&date=2026-11-20');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body.data[0].distanceKm).toBeLessThan(400);
    });

    it('GET /api/flights/search - Fails when origin and destination are identical', async () => {
      const res = await request(app).get('/api/flights/search?from=DEL&to=DEL&date=2026-11-20');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/flights/search - Fails when query parameters are missing', async () => {
      const res = await request(app).get('/api/flights/search?from=DEL');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 4. Booking Lifecycle (Create, Query, Cancel, Delete, Purge)
  describe('Bookings CRUD & Lifecycle API', () => {
    it('POST /api/bookings - Rejects invalid booking with empty whitespace name', async () => {
      const invalidPayload = {
        passengerName: "   ",
        email: "test@airbharat.in",
        flightNumber: "6E-2004",
        airline: "IndiGo",
        origin: "New Delhi (DEL)",
        destination: "Mumbai (BOM)",
        date: "2026-11-20",
        priceINR: 5200
      };

      const res = await request(app).post('/api/bookings').send(invalidPayload);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/bookings - Creates confirmed ticket with seat and meal selection', async () => {
      const bookingPayload = {
        passengerName: "Gowtham Naidu",
        email: "gowtham@example.com",
        phone: "9876543210",
        flightNumber: "6E-2004",
        airline: "IndiGo",
        origin: "New Delhi (DEL)",
        destination: "Mumbai (BOM)",
        date: "2026-11-20",
        priceINR: 5650,
        allocatedSeat: "1A",
        selectedMeal: "Paneer Tikka Meal",
        paymentMethod: "UPI"
      };

      const res = await request(app).post('/api/bookings').send(bookingPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pnr');
      expect(res.body.data.pnr).toMatch(/^IND-[A-Z0-9]{6}$/);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.allocatedSeat).toBe('1A');
      expect(res.body.data.selectedMeal).toBe('Paneer Tikka Meal');

      createdPnr = res.body.data.pnr;
    });

    it('GET /api/bookings - Lists all current active and historical bookings', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body.data.some(b => b.pnr === createdPnr)).toBe(true);
    });

    it('GET /api/bookings/:pnr - Retrieves single booking by PNR', async () => {
      const res = await request(app).get(`/api/bookings/${createdPnr}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pnr).toBe(createdPnr);
      expect(res.body.data.passengerName).toBe('Gowtham Naidu');
    });

    it('PATCH /api/bookings/:pnr/cancel - Successfully cancels an active ticket', async () => {
      const res = await request(app).patch(`/api/bookings/${createdPnr}/cancel`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('PATCH /api/bookings/:pnr/cancel - Fails when cancelling already cancelled ticket', async () => {
      const res = await request(app).patch(`/api/bookings/${createdPnr}/cancel`);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/bookings/:pnr - Permanently deletes single record from history', async () => {
      const res = await request(app).delete(`/api/bookings/${createdPnr}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it no longer exists
      const fetchRes = await request(app).get(`/api/bookings/${createdPnr}`);
      expect(fetchRes.statusCode).toBe(404);
    });

    it('DELETE /api/bookings - Purges all booking history', async () => {
      const res = await request(app).delete('/api/bookings');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const checkList = await request(app).get('/api/bookings');
      expect(checkList.body.count).toBe(0);
    });
  });
});
