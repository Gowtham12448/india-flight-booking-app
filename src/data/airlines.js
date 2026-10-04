// src/data/airlines.js
module.exports = [
  {
    id: "indigo",
    name: "IndiGo",
    code: "6E",
    ratePerKm: 4.2,
    baseFare: 1600,
    type: "LCC",
    isPanIndia: true
  },
  {
    id: "airindia",
    name: "Air India",
    code: "AI",
    ratePerKm: 5.1,
    baseFare: 2200,
    type: "FSC",
    isPanIndia: true
  },
  {
    id: "airindiaexpress",
    name: "Air India Express",
    code: "IX",
    ratePerKm: 3.9,
    baseFare: 1400,
    type: "LCC",
    isPanIndia: false,
    preferredHubs: ["DEL", "BOM", "COK", "CCJ", "TRV", "BLR", "VTZ", "LKO", "VNS", "AYJ"]
  },
  {
    id: "vistara",
    name: "Vistara",
    code: "UK",
    ratePerKm: 5.4,
    baseFare: 2400,
    type: "FSC",
    isPanIndia: false,
    preferredHubs: ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU", "PNQ", "GOI", "AMD"]
  },
  {
    id: "akasa",
    name: "Akasa Air",
    code: "QP",
    ratePerKm: 3.8,
    baseFare: 1500,
    type: "LCC",
    isPanIndia: false,
    preferredHubs: ["BOM", "BLR", "DEL", "HYD", "AMD", "COK", "GOX", "PNQ", "VNS", "LKO"]
  },
  {
    id: "starair",
    name: "Star Air",
    code: "S5",
    ratePerKm: 4.8,
    baseFare: 1800,
    type: "Regional",
    isPanIndia: false,
    preferredHubs: ["BLR", "HYD", "TIR", "IXE", "PNQ", "AMD", "IDR", "BHO"]
  }
];
