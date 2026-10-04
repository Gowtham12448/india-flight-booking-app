// src/data/flightSchedules.js

/**
 * Real-world airline schedules across Indian domestic corridors.
 * Each route pair explicitly defines which airlines operate, their real flight numbers,
 * departure slots, and base operating aircraft.
 */
module.exports = {
  // 1. Visakhapatnam (VTZ) <-> Hyderabad (HYD) [Short Trunk Corridor]
  "VTZ-HYD": [
    { airlineId: "indigo", flightNumber: "6E-243", depTime: "06:15", aircraft: "Airbus A320neo", baseFare: 3200 },
    { airlineId: "indigo", flightNumber: "6E-7128", depTime: "09:40", aircraft: "ATR 72-600", baseFare: 3450 },
    { airlineId: "airindia", flightNumber: "AI-542", depTime: "11:20", aircraft: "Airbus A320neo", baseFare: 3900 },
    { airlineId: "indigo", flightNumber: "6E-621", depTime: "15:10", aircraft: "Airbus A321neo", baseFare: 3100 },
    { airlineId: "airindia", flightNumber: "AI-644", depTime: "18:45", aircraft: "Airbus A320neo", baseFare: 4200 },
    { airlineId: "indigo", flightNumber: "6E-893", depTime: "21:30", aircraft: "Airbus A320neo", baseFare: 2950 }
  ],
  "HYD-VTZ": [
    { airlineId: "indigo", flightNumber: "6E-242", depTime: "07:55", aircraft: "Airbus A320neo", baseFare: 3100 },
    { airlineId: "airindia", flightNumber: "AI-541", depTime: "09:15", aircraft: "Airbus A320neo", baseFare: 3800 },
    { airlineId: "indigo", flightNumber: "6E-7127", depTime: "13:20", aircraft: "ATR 72-600", baseFare: 3300 },
    { airlineId: "indigo", flightNumber: "6E-622", depTime: "16:50", aircraft: "Airbus A321neo", baseFare: 3400 },
    { airlineId: "airindia", flightNumber: "AI-643", depTime: "20:10", aircraft: "Airbus A320neo", baseFare: 4100 },
    { airlineId: "indigo", flightNumber: "6E-894", depTime: "23:05", aircraft: "Airbus A320neo", baseFare: 2850 }
  ],

  // 2. Delhi (DEL) <-> Mumbai (BOM) [India's Busiest Trunk Corridor - 14+ services]
  "DEL-BOM": [
    { airlineId: "indigo", flightNumber: "6E-2004", depTime: "05:00", aircraft: "Airbus A321neo", baseFare: 5200 },
    { airlineId: "vistara", flightNumber: "UK-975", depTime: "06:00", aircraft: "Airbus A321neo", baseFare: 6800 },
    { airlineId: "airindia", flightNumber: "AI-805", depTime: "07:00", aircraft: "Boeing 777-300ER", baseFare: 6400 },
    { airlineId: "akasa", flightNumber: "QP-1102", depTime: "07:30", aircraft: "Boeing 737 MAX 8", baseFare: 4800 },
    { airlineId: "indigo", flightNumber: "6E-5011", depTime: "08:15", aircraft: "Airbus A320neo", baseFare: 6100 },
    { airlineId: "vistara", flightNumber: "UK-993", depTime: "09:10", aircraft: "Airbus A320neo", baseFare: 7200 },
    { airlineId: "airindia", flightNumber: "AI-867", depTime: "11:30", aircraft: "Airbus A320neo", baseFare: 5600 },
    { airlineId: "akasa", flightNumber: "QP-1124", depTime: "13:45", aircraft: "Boeing 737 MAX 8", baseFare: 4600 },
    { airlineId: "indigo", flightNumber: "6E-2055", depTime: "15:20", aircraft: "Airbus A321neo", baseFare: 5400 },
    { airlineId: "vistara", flightNumber: "UK-945", depTime: "17:00", aircraft: "Airbus A321neo", baseFare: 7800 },
    { airlineId: "airindia", flightNumber: "AI-665", depTime: "18:00", aircraft: "Airbus A350-900", baseFare: 7500 },
    { airlineId: "indigo", flightNumber: "6E-5318", depTime: "19:30", aircraft: "Airbus A320neo", baseFare: 7100 },
    { airlineId: "akasa", flightNumber: "QP-1142", depTime: "20:45", aircraft: "Boeing 737 MAX 8", baseFare: 5100 },
    { airlineId: "vistara", flightNumber: "UK-985", depTime: "21:30", aircraft: "Airbus A320neo", baseFare: 6900 }
  ],
  "BOM-DEL": [
    { airlineId: "indigo", flightNumber: "6E-2005", depTime: "06:00", aircraft: "Airbus A321neo", baseFare: 5100 },
    { airlineId: "airindia", flightNumber: "AI-806", depTime: "07:15", aircraft: "Boeing 777-300ER", baseFare: 6200 },
    { airlineId: "vistara", flightNumber: "UK-976", depTime: "08:30", aircraft: "Airbus A321neo", baseFare: 6900 },
    { airlineId: "akasa", flightNumber: "QP-1103", depTime: "09:45", aircraft: "Boeing 737 MAX 8", baseFare: 4900 },
    { airlineId: "indigo", flightNumber: "6E-5012", depTime: "11:00", aircraft: "Airbus A320neo", baseFare: 5400 },
    { airlineId: "vistara", flightNumber: "UK-994", depTime: "13:00", aircraft: "Airbus A320neo", baseFare: 6700 },
    { airlineId: "airindia", flightNumber: "AI-868", depTime: "15:30", aircraft: "Airbus A320neo", baseFare: 5700 },
    { airlineId: "akasa", flightNumber: "QP-1125", depTime: "17:15", aircraft: "Boeing 737 MAX 8", baseFare: 5200 },
    { airlineId: "indigo", flightNumber: "6E-2056", depTime: "18:45", aircraft: "Airbus A321neo", baseFare: 7300 },
    { airlineId: "vistara", flightNumber: "UK-946", depTime: "20:00", aircraft: "Airbus A321neo", baseFare: 7600 },
    { airlineId: "airindia", flightNumber: "AI-666", depTime: "21:15", aircraft: "Airbus A350-900", baseFare: 7200 },
    { airlineId: "indigo", flightNumber: "6E-5319", depTime: "22:30", aircraft: "Airbus A320neo", baseFare: 5300 }
  ],

  // 3. Bengaluru (BLR) <-> Tirupati (TIR) [Regional Route - Star Air & IndiGo only]
  "BLR-TIR": [
    { airlineId: "starair", flightNumber: "S5-115", depTime: "07:10", aircraft: "Embraer E175", baseFare: 2450 },
    { airlineId: "indigo", flightNumber: "6E-7241", depTime: "11:25", aircraft: "ATR 72-600", baseFare: 2800 },
    { airlineId: "starair", flightNumber: "S5-119", depTime: "16:40", aircraft: "Embraer E175", baseFare: 2600 }
  ],
  "TIR-BLR": [
    { airlineId: "starair", flightNumber: "S5-116", depTime: "08:40", aircraft: "Embraer E175", baseFare: 2450 },
    { airlineId: "indigo", flightNumber: "6E-7242", depTime: "12:55", aircraft: "ATR 72-600", baseFare: 2800 },
    { airlineId: "starair", flightNumber: "S5-120", depTime: "18:10", aircraft: "Embraer E175", baseFare: 2600 }
  ],

  // 4. Bengaluru (BLR) <-> Hyderabad (HYD) [South Metro Corridor]
  "BLR-HYD": [
    { airlineId: "indigo", flightNumber: "6E-442", depTime: "06:10", aircraft: "Airbus A320neo", baseFare: 2900 },
    { airlineId: "airindiaexpress", flightNumber: "IX-931", depTime: "08:45", aircraft: "Boeing 737 MAX 8", baseFare: 2600 },
    { airlineId: "vistara", flightNumber: "UK-882", depTime: "11:30", aircraft: "Airbus A320neo", baseFare: 3600 },
    { airlineId: "akasa", flightNumber: "QP-1311", depTime: "14:15", aircraft: "Boeing 737 MAX 8", baseFare: 2750 },
    { airlineId: "indigo", flightNumber: "6E-551", depTime: "17:20", aircraft: "Airbus A321neo", baseFare: 3800 },
    { airlineId: "airindia", flightNumber: "AI-512", depTime: "19:40", aircraft: "Airbus A320neo", baseFare: 3950 },
    { airlineId: "indigo", flightNumber: "6E-779", depTime: "22:00", aircraft: "Airbus A320neo", baseFare: 2700 }
  ],
  "HYD-BLR": [
    { airlineId: "indigo", flightNumber: "6E-443", depTime: "07:45", aircraft: "Airbus A320neo", baseFare: 2900 },
    { airlineId: "airindiaexpress", flightNumber: "IX-932", depTime: "10:20", aircraft: "Boeing 737 MAX 8", baseFare: 2600 },
    { airlineId: "vistara", flightNumber: "UK-883", depTime: "13:10", aircraft: "Airbus A320neo", baseFare: 3600 },
    { airlineId: "akasa", flightNumber: "QP-1312", depTime: "16:00", aircraft: "Boeing 737 MAX 8", baseFare: 2800 },
    { airlineId: "indigo", flightNumber: "6E-552", depTime: "19:05", aircraft: "Airbus A321neo", baseFare: 3900 },
    { airlineId: "airindia", flightNumber: "AI-513", depTime: "21:25", aircraft: "Airbus A320neo", baseFare: 3950 }
  ],

  // 5. Delhi (DEL) <-> Bengaluru (BLR) [Major Cross-Country Trunk]
  "DEL-BLR": [
    { airlineId: "indigo", flightNumber: "6E-2131", depTime: "05:45", aircraft: "Airbus A321neo", baseFare: 6100 },
    { airlineId: "vistara", flightNumber: "UK-807", depTime: "06:45", aircraft: "Airbus A320neo", baseFare: 7400 },
    { airlineId: "akasa", flightNumber: "QP-1322", depTime: "08:15", aircraft: "Boeing 737 MAX 8", baseFare: 5500 },
    { airlineId: "airindia", flightNumber: "AI-506", depTime: "09:30", aircraft: "Airbus A320neo", baseFare: 6900 },
    { airlineId: "indigo", flightNumber: "6E-2415", depTime: "13:00", aircraft: "Airbus A321neo", baseFare: 5800 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1142", depTime: "15:40", aircraft: "Boeing 737 MAX 8", baseFare: 5200 },
    { airlineId: "vistara", flightNumber: "UK-815", depTime: "17:15", aircraft: "Airbus A321neo", baseFare: 8200 },
    { airlineId: "indigo", flightNumber: "6E-6012", depTime: "19:20", aircraft: "Airbus A320neo", baseFare: 7600 },
    { airlineId: "airindia", flightNumber: "AI-504", depTime: "20:50", aircraft: "Boeing 777-200LR", baseFare: 7300 }
  ],
  "BLR-DEL": [
    { airlineId: "indigo", flightNumber: "6E-2132", depTime: "06:15", aircraft: "Airbus A321neo", baseFare: 6100 },
    { airlineId: "vistara", flightNumber: "UK-808", depTime: "07:30", aircraft: "Airbus A320neo", baseFare: 7400 },
    { airlineId: "airindia", flightNumber: "AI-507", depTime: "09:40", aircraft: "Airbus A320neo", baseFare: 6800 },
    { airlineId: "akasa", flightNumber: "QP-1323", depTime: "11:50", aircraft: "Boeing 737 MAX 8", baseFare: 5400 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1143", depTime: "14:10", aircraft: "Boeing 737 MAX 8", baseFare: 5100 },
    { airlineId: "indigo", flightNumber: "6E-2416", depTime: "16:45", aircraft: "Airbus A321neo", baseFare: 6500 },
    { airlineId: "vistara", flightNumber: "UK-816", depTime: "18:30", aircraft: "Airbus A321neo", baseFare: 8100 },
    { airlineId: "indigo", flightNumber: "6E-6013", depTime: "21:00", aircraft: "Airbus A320neo", baseFare: 7200 }
  ],

  // 6. Mumbai (BOM) <-> Goa (GOX / GOI) [High Leisure Demand]
  "BOM-GOX": [
    { airlineId: "akasa", flightNumber: "QP-1381", depTime: "08:10", aircraft: "Boeing 737 MAX 8", baseFare: 2900 },
    { airlineId: "indigo", flightNumber: "6E-6324", depTime: "12:15", aircraft: "Airbus A320neo", baseFare: 3300 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1741", depTime: "17:30", aircraft: "Boeing 737 MAX 8", baseFare: 3100 }
  ],
  "GOX-BOM": [
    { airlineId: "akasa", flightNumber: "QP-1382", depTime: "10:15", aircraft: "Boeing 737 MAX 8", baseFare: 2900 },
    { airlineId: "indigo", flightNumber: "6E-6325", depTime: "14:20", aircraft: "Airbus A320neo", baseFare: 3300 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1742", depTime: "19:40", aircraft: "Boeing 737 MAX 8", baseFare: 3100 }
  ],

  // 7. Delhi (DEL) <-> Ayodhya (AYJ) [Religious Tourism Corridor]
  "DEL-AYJ": [
    { airlineId: "indigo", flightNumber: "6E-219", depTime: "09:00", aircraft: "Airbus A320neo", baseFare: 3600 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1512", depTime: "11:45", aircraft: "Boeing 737 MAX 8", baseFare: 3300 },
    { airlineId: "airindia", flightNumber: "AI-401", depTime: "15:20", aircraft: "Airbus A320neo", baseFare: 4100 }
  ],
  "AYJ-DEL": [
    { airlineId: "indigo", flightNumber: "6E-220", depTime: "11:15", aircraft: "Airbus A320neo", baseFare: 3600 },
    { airlineId: "airindiaexpress", flightNumber: "IX-1513", depTime: "13:55", aircraft: "Boeing 737 MAX 8", baseFare: 3300 },
    { airlineId: "airindia", flightNumber: "AI-402", depTime: "17:35", aircraft: "Airbus A320neo", baseFare: 4100 }
  ]
};
