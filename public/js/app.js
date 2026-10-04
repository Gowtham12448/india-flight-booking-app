document.addEventListener('DOMContentLoaded', async () => {
  const originSelect = document.getElementById('origin-select');
  const destSelect = document.getElementById('dest-select');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('flight-date').value = tomorrow.toISOString().split('T')[0];

  // Fetch Airports
  const res = await fetch('/api/airports');
  const { data: airports } = await res.json();

  const options = airports.map(a => `<option value="${a.code}">${a.city} (${a.code}) - ${a.name}</option>`).join('');
  originSelect.innerHTML = options;
  destSelect.innerHTML = options;
  destSelect.selectedIndex = 1;

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = originSelect.value;
    const to = destSelect.value;
    const date = document.getElementById('flight-date').value;

    resultsContainer.innerHTML = "<p>Searching Indian Carriers...</p>";

    const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
    const resData = await response.json();

    if (!resData.success) {
      resultsContainer.innerHTML = `<p style="color: red;">${resData.message}</p>`;
      return;
    }

    resultsContainer.innerHTML = resData.data.map(f => `
      <div class="flight-card">
        <div class="flight-info">
          <h3>${f.airline} <small>(${f.flightNumber})</small></h3>
          <p><strong>Route:</strong> ${f.origin} ➔ ${f.destination}</p>
          <p><strong>Schedule:</strong> ${f.departureTime} - ${f.arrivalTime} (${f.duration})</p>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #b12704;">₹${f.priceINR}</h2>
          <button class="btn" style="margin-top: 10px;" onclick="bookFlight('${f.flightNumber}', '${f.airline}', '${f.origin}', '${f.destination}', '${f.date}', ${f.priceINR})">Book Now</button>
        </div>
      </div>
    `).join('');
  });
});

async function bookFlight(flightNumber, airline, origin, destination, date, priceINR) {
  const passengerName = prompt("Enter Primary Passenger Full Name:");
  if (!passengerName) return;
  const email = prompt("Enter Contact Email:");
  if (!email) return;

  const payload = { passengerName, email, flightNumber, airline, origin, destination, date, priceINR };

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.success) {
    alert(`Booking Confirmed! Your PNR is: ${data.data.pnr}`);
    window.location.href = '/my-bookings';
  } else {
    alert('Booking failed: ' + data.message);
  }
}
