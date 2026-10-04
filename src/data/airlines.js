// src/data/airlines.js
module.exports = [
  {
    id: "indigo",
    name: "IndiGo",
    code: "6E",
    ratePerKm: 4.1,
    baseFare: 1600,
    type: "LCC",
    flightNumberBase: 2000,
    flightNumberRange: 4000,
    aircraft: ["Airbus A320neo", "Airbus A321neo", "ATR 72-600"],
    networkTier: "PAN_INDIA", // Operates virtually all routes
    hubFactor: 1.0
  },
  {
    id: "airindia",
    name: "Air India",
    code: "AI",
    ratePerKm: 5.2,
    baseFare: 2200,
    type: "FSC",
    flightNumberBase: 400,
    flightNumberRange: 500,
    aircraft: ["Airbus A320neo", "Airbus A321neo", "Airbus A350-900", "Boeing 777-300ER"],
    networkTier: "MAJOR_AND_CAPITALS", // Focuses on Metros, State Capitals & Pilgrimage
    hubFactor: 0.8
  },
  {
    id: "airindiaexpress",
    name: "Air India Express",
    code: "IX",
    ratePerKm: 3.8,
    baseFare: 1400,
    type: "LCC",
    flightNumberBase: 1100,
    flightNumberRange: 800,
    aircraft: ["Boeing 737 MAX 8", "Airbus A320neo"],
    networkTier: "TIER2_AND_SOUTH",
    preferredHubs: ["DEL", "BOM", "BLR", "HYD", "COK", "CCJ", "TRV", "MAA", "VTZ", "LKO", "VNS", "AYJ", "IXE", "GAU", "BBI"],
    hubFactor: 0.6
  },
  {
    id: "vistara",
    name: "Vistara",
    code: "UK",
    ratePerKm: 5.5,
    baseFare: 2400,
    type: "FSC",
    flightNumberBase: 700,
    flightNumberRange: 290,
    aircraft: ["Airbus A320neo", "Airbus A321neo", "Boeing 787-9 Dreamliner"],
    networkTier: "METRO_PREMIUM",
    preferredHubs: ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU", "PNQ", "GOI", "GOX", "AMD", "COK", "DED", "IXC"],
    hubFactor: 0.5
  },
  {
    id: "akasa",
    name: "Akasa Air",
    code: "QP",
    ratePerKm: 3.9,
    baseFare: 1500,
    type: "LCC",
    flightNumberBase: 1300,
    flightNumberRange: 300,
    aircraft: ["Boeing 737 MAX 8"],
    networkTier: "METRO_AND_GROWTH",
    preferredHubs: ["BOM", "BLR", "DEL", "HYD", "AMD", "COK", "GOX", "PNQ", "VNS", "LKO", "GAU", "ATQ"],
    hubFactor: 0.5
  },
  {
    id: "starair",
    name: "Star Air",
    code: "S5",
    ratePerKm: 4.9,
    baseFare: 1900,
    type: "Regional",
    flightNumberBase: 100,
    flightNumberRange: 150,
    aircraft: ["Embraer E175", "Embraer E145"],
    networkTier: "REGIONAL_SHORT_HOP",
    preferredHubs: ["BLR", "HYD", "TIR", "IXE", "PNQ", "AMD", "IDR", "BHO", "JAI"],
    hubFactor: 0.35
  }
];
