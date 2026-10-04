// src/routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const airports = require('../data/airports');
const airlines = require('../data/airlines');

// Haversine formula: Nautical distance in kilometers
function getGreatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

// Deterministic seed based on Origin, Destination, and Travel Date
function getRouteSeed(from, to, date) {
  const key = `${from}:${to}:${date}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pseudo-random generator using the seed
function createPrng(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

router.get('/search', (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ success: false, message: 'Please provide from, to, and date query parameters' });
  }

  const originCode = from.toUpperCase();
  const destCode = to.toUpperCase();

  if (originCode === destCode) {
    return res.status(400).json({ success: false, message: 'Origin and destination airport cannot be identical' });
  }

  const origin = airports.find(a => a.code === originCode);
  const destination = airports.find(a => a.code === destCode);

  if (!origin || !destination) {
    return res.status(404).json({ success: false, message: 'Invalid airport code specified' });
  }

  const distanceKm = getGreatCircleDistance(origin.lat, origin.lon, destination.lat, destination.lon);

  // Realistic flight block duration: 35 min ground taxi/climb + 720 km/h cruise
  const durationMinutesTotal = Math.round(35 + (distanceKm / 720) * 60);
  const durHours = Math.floor(durationMinutesTotal / 60);
  const durMinutes = durationMinutesTotal % 60;
  const durationText = `${durHours}h ${durMinutes}m`;

  // Route Tier Classification
  const isBothMetros = origin.isMetro && destination.isMetro;
  const isOneMetro = origin.isMetro || destination.isMetro;
  const isShortRegional = distanceKm < 850;

  const routeSeed = getRouteSeed(originCode, destCode, date);
  const rng = createPrng(routeSeed);

  const dayOfWeek = new Date(date).getDay();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6); // Fri, Sat, Sun demand
  const weekendSurge = isWeekend ? 1.15 : 1.0;

  const flights = [];

  airlines.forEach((airline, aIdx) => {
    let operatesRoute = false;
    let frequency = 0;

    // 1. Determine Airline Route Eligibility & Dynamic Frequencies
    if (airline.networkTier === "PAN_INDIA") {
      // IndiGo operates nationwide: Metros get 4-6, Tier-1 get 2-4, Regional gets 1-2
      operatesRoute = true;
      if (isBothMetros) {
        frequency = 4 + Math.floor(rng() * 3); // 4 to 6 flights
      } else if (isOneMetro) {
        frequency = 2 + Math.floor(rng() * 3); // 2 to 4 flights
      } else {
        frequency = 1 + (rng() > 0.4 ? 1 : 0); // 1 or 2 flights
      }
    } 
    else if (airline.networkTier === "MAJOR_AND_CAPITALS") {
      // Air India: High on Metros, present on State capitals / long sectors
      if (isBothMetros) {
        operatesRoute = true;
        frequency = 3 + Math.floor(rng() * 2); // 3 to 4 flights
      } else if (isOneMetro && distanceKm > 400) {
        operatesRoute = rng() > 0.25;
        frequency = operatesRoute ? (1 + (rng() > 0.5 ? 1 : 0)) : 0;
      }
    } 
    else if (airline.networkTier === "TIER2_AND_SOUTH") {
      // Air India Express: Connects its preferred hubs
      const inHub = airline.preferredHubs.includes(originCode) && airline.preferredHubs.includes(destCode);
      if (inHub) {
        operatesRoute = true;
        frequency = isBothMetros ? 2 : 1;
      }
    } 
    else if (airline.networkTier === "METRO_PREMIUM") {
      // Vistara: Exclusively connects premium metro and leisure hubs
      const inHub = airline.preferredHubs.includes(originCode) && airline.preferredHubs.includes(destCode);
      if (inHub) {
        operatesRoute = true;
        frequency = isBothMetros ? (3 + (rng() > 0.5 ? 1 : 0)) : 1;
      }
    } 
    else if (airline.networkTier === "METRO_AND_GROWTH") {
      // Akasa Air: Rapidly expanding network between base hubs
      const inHub = airline.preferredHubs.includes(originCode) && airline.preferredHubs.includes(destCode);
      if (inHub) {
        operatesRoute = true;
        frequency = isBothMetros ? 2 : 1;
      }
    } 
    else if (airline.networkTier === "REGIONAL_SHORT_HOP") {
      // Star Air: Regional routes (< 1000 km), never on metro-metro trunk corridors
      const inHub = airline.preferredHubs.includes(originCode) || airline.preferredHubs.includes(destCode);
      if (inHub && isShortRegional && !isBothMetros) {
        operatesRoute = true;
        frequency = 1 + (rng() > 0.6 ? 1 : 0);
      }
    }

    if (!operatesRoute || frequency === 0) {
      return;
    }

    // 2. Generate Realistic Timing Spreads & Dynamic Fares per Flight
    // Distribute flights throughout the day (Morning, Afternoon, Evening, Night)
    const slotInterval = Math.floor(960 / frequency); // Operational day window = 16 hours (06:00 to 22:00)

    for (let f = 0; f < frequency; f++) {
      // Generate departure minute between 05:30 (330m) and 22:30 (1350m)
      const baseDepMinute = 345 + (f * slotInterval) + Math.floor((rng() * 40) - 20);
      const safeDepMinute = Math.min(Math.max(baseDepMinute, 330), 1360);
      const arrMinuteTotal = (safeDepMinute + durationMinutesTotal) % 1440;

      const depHH = String(Math.floor(safeDepMinute / 60)).padStart(2, '0');
      const depMM = String(safeDepMinute % 60).padStart(2, '0');
      const arrHH = String(Math.floor(arrMinuteTotal / 60)).padStart(2, '0');
      const arrMM = String(arrMinuteTotal % 60).padStart(2, '0');

      // Realistic Dynamic Pricing Surge:
      // Peak morning (07:00 - 09:30) & evening (17:30 - 20:30) slots cost +25%
      let slotMultiplier = 1.0;
      if ((safeDepMinute >= 420 && safeDepMinute <= 570) || (safeDepMinute >= 1050 && safeDepMinute <= 1230)) {
        slotMultiplier = 1.25;
      } else if (safeDepMinute >= 1300 || safeDepMinute <= 360) {
        slotMultiplier = 0.88; // Red-eye / late night discount
      }

      // Distance & Fuel rate fare
      const calculatedFare = (airline.baseFare + (distanceKm * airline.ratePerKm)) * slotMultiplier * weekendSurge;
      const roundedFare = Math.round(calculatedFare / 50) * 50;

      // Realistic flight number generation based on airline's range
      const flightNumOffset = Math.floor(rng() * airline.flightNumberRange);
      const flightNumber = `${airline.code}-${airline.flightNumberBase + flightNumOffset}`;

      // Pick aircraft based on fleet type
      const chosenAircraft = airline.aircraft[Math.floor(rng() * airline.aircraft.length)];

      // Seat availability
      const availableSeats = 2 + Math.floor(rng() * 26);

      flights.push({
        flightNumber,
        airline: airline.name,
        airlineCode: airline.code,
        carrierType: airline.type,
        aircraft: chosenAircraft,
        origin: `${origin.city} (${origin.code})`,
        destination: `${destination.city} (${destination.code})`,
        date,
        departureTime: `${depHH}:${depMM}`,
        arrivalTime: `${arrHH}:${arrMM}`,
        duration: durationText,
        distanceKm,
        priceINR: roundedFare,
        availableSeats
      });
    }
  });

  // Sort chronological by departure time
  flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  res.json({
    success: true,
    route: {
      origin: origin.city,
      destination: destination.city,
      distance: `${distanceKm} km`,
      duration: durationText
    },
    count: flights.length,
    data: flights
  });
});

module.exports = router;
