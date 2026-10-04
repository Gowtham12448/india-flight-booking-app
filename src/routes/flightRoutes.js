// src/routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const airports = require('../data/airports');
const airlines = require('../data/airlines');
const routeSchedules = require('../data/flightSchedules');

// Haversine calculation for exact nautical distance
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

// Deterministic Pseudo-Random Generator based on Travel Date
function getDailySeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

router.get('/search', (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ success: false, message: 'Missing parameters: from, to, and date are required.' });
  }

  const originCode = from.toUpperCase();
  const destCode = to.toUpperCase();

  if (originCode === destCode) {
    return res.status(400).json({ success: false, message: 'Origin and destination airport cannot be identical.' });
  }

  const origin = airports.find(a => a.code === originCode);
  const destination = airports.find(a => a.code === destCode);

  if (!origin || !destination) {
    return res.status(404).json({ success: false, message: 'Airport code not recognized.' });
  }

  const distanceKm = getGreatCircleDistance(origin.lat, origin.lon, destination.lat, destination.lon);
  
  // Real flight duration = Taxi/Climb/Approach buffer (35 mins) + Cruise at 720 km/h
  const flightDurationMins = Math.round(35 + (distanceKm / 720) * 60);
  const durHours = Math.floor(flightDurationMins / 60);
  const durMinutes = flightDurationMins % 60;
  const durationText = `${durHours}h ${durMinutes}m`;

  const routeKey = `${originCode}-${destCode}`;
  const dayOfWeek = new Date(date).getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6);
  const dateSeed = getDailySeed(date);

  let rawScheduledFlights = routeSchedules[routeKey];

  // If no static schedule exists for this pair, dynamically synthesize a realistic schedule
  // based strictly on airline operational hubs and route distance
  if (!rawScheduledFlights) {
    rawScheduledFlights = [];
    const isBothMetros = origin.isMetro && destination.isMetro;

    airlines.forEach((airline, idx) => {
      let isEligible = false;

      if (airline.isPanIndia) {
        isEligible = true;
      } else if (airline.type === "Regional" && distanceKm < 1000) {
        isEligible = airline.preferredHubs.includes(originCode) || airline.preferredHubs.includes(destCode);
      } else if (airline.preferredHubs) {
        isEligible = airline.preferredHubs.includes(originCode) && airline.preferredHubs.includes(destCode);
      }

      if (isEligible) {
        // High density route = 2 to 3 flights, sparse = 1 flight
        const frequencies = isBothMetros ? (idx % 2 === 0 ? 3 : 2) : 1;
        
        for (let i = 0; i < frequencies; i++) {
          const hour = (6 + (i * 5) + (idx * 2)) % 22;
          const depMinutes = (idx * 15 + i * 20) % 60;
          const depTime = `${String(hour).padStart(2, '0')}:${String(depMinutes).padStart(2, '0')}`;
          const flightNumSuffix = 100 + ((dateSeed + idx * 77 + i * 33) % 899);

          rawScheduledFlights.push({
            airlineId: airline.id,
            flightNumber: `${airline.code}-${flightNumSuffix}`,
            depTime,
            aircraft: airline.type === "Regional" ? "Embraer E175" : "Airbus A320neo",
            baseFare: Math.round((airline.baseFare + (distanceKm * airline.ratePerKm)) / 50) * 50
          });
        }
      }
    });
  }

  // Construct real-time response with dynamic pricing and seat loads
  const flights = rawScheduledFlights.map((item, index) => {
    const airline = airlines.find(a => a.id === item.airlineId) || { name: item.airlineId, code: "FL" };
    
    // Calculate Arrival Time
    const [depH, depM] = item.depTime.split(':').map(Number);
    const totalDepMin = depH * 60 + depM;
    const totalArrMin = (totalDepMin + flightDurationMins) % 1440;
    const arrH = String(Math.floor(totalArrMin / 60)).padStart(2, '0');
    const arrM = String(totalArrMin % 60).padStart(2, '0');

    // Dynamic Pricing Surge Engine:
    // Peak Morning (07:00-09:30) & Evening (17:30-20:30) cost 20-30% more
    let timeSurge = 1.0;
    if ((totalDepMin >= 420 && totalDepMin <= 570) || (totalDepMin >= 1050 && totalDepMin <= 1230)) {
      timeSurge = 1.25;
    } else if (totalDepMin >= 1320 || totalDepMin <= 360) {
      timeSurge = 0.88; // Red-eye / late night discount
    }

    const weekendSurge = isWeekend ? 1.15 : 1.0;
    const finalPrice = Math.round((item.baseFare * timeSurge * weekendSurge) / 50) * 50;

    // Remaining seats fluctuate deterministically per date and flight index
    const seatsRemaining = 3 + ((dateSeed + index * 17) % 28);

    return {
      flightNumber: item.flightNumber,
      airline: airline.name,
      airlineCode: airline.code,
      aircraft: item.aircraft,
      origin: `${origin.city} (${origin.code})`,
      destination: `${destination.city} (${destination.code})`,
      date,
      departureTime: item.depTime,
      arrivalTime: `${arrH}:${arrM}`,
      duration: durationText,
      distanceKm,
      priceINR: finalPrice,
      availableSeats: seatsRemaining
    };
  });

  // Chronologically sort flights by departure time
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
