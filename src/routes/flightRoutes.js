// src/routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const airports = require('../data/airports');
const airlines = require('../data/airlines');

// Haversine formula to compute great-circle distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Pseudo-random deterministic generator seeded by route and date
function createSeededRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash / 233280);
  };
}

// Typical commercial domestic departure slots across Indian operations
const TIME_SLOTS = [
  { name: "Early Morning", depMin: 330,  multiplier: 0.90 }, // 05:30
  { name: "Morning Peak",  depMin: 465,  multiplier: 1.25 }, // 07:45
  { name: "Mid Day",       depMin: 690,  multiplier: 0.95 }, // 11:30
  { name: "Afternoon",     depMin: 870,  multiplier: 1.00 }, // 14:30
  { name: "Evening Peak",  depMin: 1110, multiplier: 1.30 }, // 18:30
  { name: "Late Evening",  depMin: 1290, multiplier: 1.10 }, // 21:30
  { name: "Night Owl",     depMin: 1395, multiplier: 0.85 }  // 23:15
];

router.get('/search', (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide from, to, and date parameters'
    });
  }

  const originCode = from.toUpperCase();
  const destCode = to.toUpperCase();

  if (originCode === destCode) {
    return res.status(400).json({
      success: false,
      message: 'Origin and destination airports cannot be the same'
    });
  }

  const origin = airports.find(a => a.code === originCode);
  const destination = airports.find(a => a.code === destCode);

  if (!origin || !destination) {
    return res.status(404).json({
      success: false,
      message: 'Airport code not recognized'
    });
  }

  // 1. Calculate true nautical distance
  const distanceKm = calculateDistanceKm(origin.lat, origin.lon, destination.lat, destination.lon);

  // 2. Compute flight duration (Average speed 680 km/h + 30 mins ground taxi/climb/descent)
  const durationMinutesTotal = Math.round(30 + (distanceKm / 680) * 60);
  const durHours = Math.floor(durationMinutesTotal / 60);
  const durMinutes = durationMinutesTotal % 60;
  const durationFormatted = `${durHours}h ${durMinutes}m`;

  // 3. Determine Route Profile & Carrier Eligibility
  const isHighDensityMetro = origin.isMetro && destination.isMetro;
  const rng = createSeededRandom(`${originCode}-${destCode}-${date}`);

  const flights = [];

  airlines.forEach(airline => {
    // Check if the airline operates on this sector
    let operatesOnRoute = false;

    if (airline.isPanIndia) {
      operatesOnRoute = true;
    } else if (airline.type === "Regional") {
      // Star Air operates predominantly on regional / non-metro sectors or specific hubs
      const touchesHub = airline.preferredHubs.includes(originCode) || airline.preferredHubs.includes(destCode);
      const isShortHop = distanceKm < 1100;
      operatesOnRoute = touchesHub && isShortHop && !isHighDensityMetro;
    } else {
      // Akasa, Vistara, AI Express operate if either airport is in their network
      operatesOnRoute = airline.preferredHubs.includes(originCode) && airline.preferredHubs.includes(destCode);
    }

    if (!operatesOnRoute) {
      return; // Skip carrier for this specific route
    }

    // Determine how many services this airline runs on this route today
    let dailyFrequencies = 1;
    if (isHighDensityMetro) {
      dailyFrequencies = airline.type === "LCC" ? Math.floor(rng() * 2) + 2 : 2; // 2-3 services
    } else {
      // Low-density routes have 1 service, occasionally 2
      dailyFrequencies = rng() > 0.45 ? 1 : 2;
    }

    // Select distinct time slots for this airline
    const chosenSlots = [];
    for (let f = 0; f < dailyFrequencies; f++) {
      const slotIndex = Math.floor(rng() * TIME_SLOTS.length);
      const baseSlot = TIME_SLOTS[slotIndex];

      // Add a small jitter (e.g. +/- 15 mins) to make schedules authentic
      const jitterMin = Math.floor((rng() * 30) - 15);
      const depTotalMin = (baseSlot.depMin + jitterMin + 1440) % 1440;
      const arrTotalMin = (depTotalMin + durationMinutesTotal) % 1440;

      const depHH = String(Math.floor(depTotalMin / 60)).padStart(2, '0');
      const depMM = String(depTotalMin % 60).padStart(2, '0');
      const arrHH = String(Math.floor(arrTotalMin / 60)).padStart(2, '0');
      const arrMM = String(arrTotalMin % 60).padStart(2, '0');

      // 4. Calculate realistic dynamic fare:
      // Base Fare + (Distance * Rate) * (Time-of-day surge) * (Weekend modifier)
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6); // Fri, Sat, Sun
      const weekendSurge = isWeekend ? 1.18 : 1.0;

      const rawFare = (airline.baseFare + (distanceKm * airline.ratePerKm)) * baseSlot.multiplier * weekendSurge;
      // Round to nearest 50 INR
      const finalPrice = Math.round(rawFare / 50) * 50;

      // Unique realistic flight number
      const flightNumDigits = 100 + Math.floor(rng() * 899);

      chosenSlots.push({
        flightNumber: `${airline.code}-${flightNumDigits}`,
        airline: airline.name,
        airlineCode: airline.code,
        carrierType: airline.type,
        origin: `${origin.city} (${origin.code})`,
        destination: `${destination.city} (${destination.code})`,
        distanceKm: distanceKm,
        date,
        departureTime: `${depHH}:${depMM}`,
        arrivalTime: `${arrHH}:${arrMM}`,
        duration: durationFormatted,
        priceINR: finalPrice,
        availableSeats: Math.floor(rng() * 25) + 3,
        aircraft: airline.type === "Regional" ? "Embraer E175" : "Airbus A320neo / Boeing 737 MAX"
      });
    }

    flights.push(...chosenSlots);
  });

  // Sort by departure time ascending
  flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  res.json({
    success: true,
    route: {
      origin: origin.city,
      destination: destination.city,
      distanceKm: `${distanceKm} km`,
      duration: durationFormatted
    },
    count: flights.length,
    data: flights
  });
});

module.exports = router;
