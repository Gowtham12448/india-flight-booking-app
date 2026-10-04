document.addEventListener('DOMContentLoaded', async () => {
  const originSelect = document.getElementById('origin-select');
  const destSelect = document.getElementById('dest-select');
  const dateInput = document.getElementById('flight-date');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');

  // Enforce today as the minimum allowable booking date
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  // Default selection to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];

  // Fetch Airports
  try {
    const res = await fetch('/api/airports');
    const { data: airports } = await res.json();

    // Clean, readable label format: "New Delhi (DEL) - Indira Gandhi Intl"
    const options = airports.map(a => {
      const shortName = a.name.replace(/International Airport|Airport/gi, '').trim();
      return `<option value="${a.code}">${a.city} (${a.code}) - ${shortName}</option>`;
    }).join('');

    originSelect.innerHTML = options;
    destSelect.innerHTML = options;
    destSelect.selectedIndex = 1; // Default to Mumbai (BOM)
  } catch (err) {
    resultsContainer.innerHTML = '<p style="color: #dc2626;">Error loading airport directory.</p>';
  }

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = originSelect.value;
    const to = destSelect.value;
    const date = dateInput.value;

    resultsContainer.innerHTML = '<p style="padding: 10px;">Searching domestic carriers...</p>';

    try {
      const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
      const resData = await response.json();

      if (!resData.success) {
        resultsContainer.innerHTML = `<p style="color: #dc2626; padding: 10px;">${resData.message}</p>`;
        return;
      }

      resultsContainer.innerHTML = resData.data.map(f => `
        <div class="flight-card">
          <div class="flight-info">
            <h3>${f.airline} <small style="color: #6b7280; font-size: 0.85rem;">(${f.flightNumber})</small></h3>
            <p style="margin: 4px 0;"><strong>Route:</strong> ${f.origin} ➔ ${f.destination}</p>
            <p style="color: #4b5563; font-size: 0.9rem;"><strong>Schedule:</strong> ${f.departureTime} - ${f.arrivalTime} (${f.duration})</p>
          </div>
          <div style="text-align: right;">
            <h2 style="color: #b12704; font-size: 1.4rem;">₹${f.priceINR}</h2>
            <button class="btn book-btn" style="margin-top: 8px; padding: 8px 16px; font-size: 0.9rem;" data-flight='${JSON.stringify(f).replace(/'/g, "&apos;")}'>Book Now</button>
          </div>
        </div>
      `).join('');

      // Event listener for booking buttons (Fixes DEF-002 string interpolation bug)
      resultsContainer.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          const flightData = JSON.parse(ev.currentTarget.getAttribute('data-flight'));
          executeBooking(flightData);
        });
      });
    } catch (err) {
      resultsContainer.innerHTML = '<p style="color: #dc2626; padding: 10px;">Failed to retrieve flight data.</p>';
    }
  });
});

async function executeBooking(flight) {
  const passengerName = prompt("Enter Primary Passenger Full Name:");
  if (!passengerName || !passengerName.trim()) return;

  const email = prompt("Enter Contact Email Address:");
  if (!email || !email.trim()) return;

  const payload = {
    passengerName: passengerName.trim(),
    email: email.trim(),
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    origin: flight.origin,
    destination: flight.destination,
    date: flight.date,
    priceINR: flight.priceINR
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert(`Booking Confirmed!\nPassenger: ${data.data.passengerName}\nPNR: ${data.data.pnr}`);
      window.location.href = '/my-bookings';
    } else {
      alert('Booking Failed: ' + data.message);
    }
  } catch (err) {
    alert('Communication error with server.');
  }
}
