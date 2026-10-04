// src/data/airports.js
module.exports = [
  // Metro / Major Hubs
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport", state: "Delhi", lat: 28.5562, lon: 77.1000, isMetro: true },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", state: "Maharashtra", lat: 19.0896, lon: 72.8656, isMetro: true },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International Airport", state: "Karnataka", lat: 13.1986, lon: 77.7066, isMetro: true },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport", state: "Telangana", lat: 17.2403, lon: 78.4294, isMetro: true },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport", state: "Tamil Nadu", lat: 12.9941, lon: 80.1709, isMetro: true },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose International Airport", state: "West Bengal", lat: 22.6547, lon: 88.4467, isMetro: true },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport", state: "Gujarat", lat: 23.0734, lon: 72.6347, isMetro: false },
  { code: "PNQ", city: "Pune", name: "Pune International Airport", state: "Maharashtra", lat: 18.5821, lon: 73.9197, isMetro: false },
  { code: "COK", city: "Kochi", name: "Cochin International Airport", state: "Kerala", lat: 10.1556, lon: 76.3917, isMetro: false },
  { code: "GOI", city: "Goa (Dabolim)", name: "Dabolim Airport", state: "Goa", lat: 15.3800, lon: 73.8314, isMetro: false },
  { code: "GOX", city: "Goa (Mopa)", name: "Manohar International Airport", state: "Goa", lat: 15.7667, lon: 73.8667, isMetro: false },

  // North & Central
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee International Airport", state: "Punjab", lat: 31.7096, lon: 74.7973, isMetro: false },
  { code: "IXC", city: "Chandigarh", name: "Shaheed Bhagat Singh International Airport", state: "Chandigarh", lat: 30.6735, lon: 76.7885, isMetro: false },
  { code: "JAI", city: "Jaipur", name: "Jaipur International Airport", state: "Rajasthan", lat: 26.8242, lon: 75.8122, isMetro: false },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International Airport", state: "Uttar Pradesh", lat: 26.7606, lon: 80.8893, isMetro: false },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri International Airport", state: "Uttar Pradesh", lat: 25.4524, lon: 82.8593, isMetro: false },
  { code: "AYJ", city: "Ayodhya", name: "Maharishi Valmiki International Airport", state: "Uttar Pradesh", lat: 26.7460, lon: 82.1550, isMetro: false },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International Airport", state: "Jammu and Kashmir", lat: 33.9871, lon: 74.7741, isMetro: false },
  { code: "IXJ", city: "Jammu", name: "Jammu Airport", state: "Jammu and Kashmir", lat: 32.6891, lon: 74.8374, isMetro: false },
  { code: "IXL", city: "Leh", name: "Kushok Bakula Rimpochee Airport", state: "Ladakh", lat: 34.1359, lon: 77.5465, isMetro: false },
  { code: "DED", city: "Dehradun", name: "Jolly Grant Airport", state: "Uttarakhand", lat: 30.1897, lon: 78.1803, isMetro: false },
  { code: "BHO", city: "Bhopal", name: "Raja Bhoj Airport", state: "Madhya Pradesh", lat: 23.2875, lon: 77.3378, isMetro: false },
  { code: "IDR", city: "Indore", name: "Devi Ahilya Bai Holkar Airport", state: "Madhya Pradesh", lat: 22.7217, lon: 75.8011, isMetro: false },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda Airport", state: "Chhattisgarh", lat: 21.1804, lon: 81.7388, isMetro: false },

  // East & North-East
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan Airport", state: "Bihar", lat: 25.5913, lon: 85.0880, isMetro: false },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International Airport", state: "Odisha", lat: 20.2444, lon: 85.8178, isMetro: false },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International Airport", state: "Assam", lat: 26.1061, lon: 91.5859, isMetro: false },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra International Airport", state: "West Bengal", lat: 26.6812, lon: 88.3286, isMetro: false },
  { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram Airport", state: "Tripura", lat: 23.8869, lon: 91.2405, isMetro: false },
  { code: "IMF", city: "Imphal", name: "Bir Tikendrajit International Airport", state: "Manipur", lat: 24.7600, lon: 93.8967, isMetro: false },

  // South
  { code: "TRV", city: "Thiruvananthapuram", name: "Thiruvananthapuram International Airport", state: "Kerala", lat: 8.4821, lon: 76.9200, isMetro: false },
  { code: "CCJ", city: "Kozhikode", name: "Calicut International Airport", state: "Kerala", lat: 11.1368, lon: 75.9553, isMetro: false },
  { code: "CJB", city: "Coimbatore", name: "Coimbatore International Airport", state: "Tamil Nadu", lat: 11.0300, lon: 77.0434, isMetro: false },
  { code: "TRZ", city: "Tiruchirappalli", name: "Tiruchirappalli International Airport", state: "Tamil Nadu", lat: 10.7654, lon: 78.7097, isMetro: false },
  { code: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam International Airport", state: "Andhra Pradesh", lat: 17.7212, lon: 83.2245, isMetro: false },
  { code: "VGA", city: "Vijayawada", name: "Vijayawada International Airport", state: "Andhra Pradesh", lat: 16.5304, lon: 80.7968, isMetro: false },
  { code: "TIR", city: "Tirupati", name: "Tirupati Airport", state: "Andhra Pradesh", lat: 13.6325, lon: 79.5434, isMetro: false },
  { code: "IXE", city: "Mangaluru", name: "Mangaluru International Airport", state: "Karnataka", lat: 12.9613, lon: 74.8901, isMetro: false }
];
