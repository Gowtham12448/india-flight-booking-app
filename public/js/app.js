// public/js/app.js
document.addEventListener('DOMContentLoaded', async () => {
  const originSelect = document.getElementById('origin-select');
  const destSelect = document.getElementById('dest-select');
  const dateInput = document.getElementById('flight-date');
  const swapBtn = document.getElementById('swap-airports');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');
  const routeSummary = document.getElementById('route-summary');

  // Modal elements
  const modal = document.getElementById('checkout-modal');
  const modalClose = document.getElementById('modal-close');
  const paymentForm = document.getElementById('booking-payment-form');
  const paymentTabs = document.querySelectorAll('.payment-option');

  // Active flight payload tracking
  let selectedFlight = null;

  // Set minimum travel date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];

  // 1. Fetch Airport Directory
  try {
    const res = await fetch('/api/airports');
    const { data: airports } = await res.json();

    const options = airports.map(a => {
      const shortName = a.name.replace(/International Airport|Airport/gi, '').trim();
      return `<option value="${a.code}">${a.city} (${a.code}) - ${shortName}</option>`;
    }).join('');

    originSelect.innerHTML = options;
    destSelect.innerHTML = options;
    destSelect.selectedIndex = 1; // Default destination to BOM
  } catch (err) {
    resultsContainer.innerHTML = '<p style="color: #fff; text-align: center;">Error loading airport directory.</p>';
  }

  // 2. Swap Origin & Destination
  swapBtn.addEventListener('click', () => {
    const temp = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = temp;
  });

  // 3. Search Flights
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = originSelect.value;
    const to = destSelect.value;
    const date = dateInput.value;

    resultsContainer.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px;">Fetching direct airline schedules...</p>';
    routeSummary.style.display = 'none';

    try {
      const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
      const resData = await response.json();

      if (!resData.success) {
        resultsContainer.innerHTML = `<p style="color: #fee2e2; text-align: center; padding: 20px;">${resData.message}</p>`;
        return;
      }

      // Display Route Information
      routeSummary.style.display = 'flex';
      routeSummary.innerHTML = `
        <span><strong>${resData.route.origin} ➔ ${resData.route.destination}</strong></span>
        <span>Distance: ${resData.route.distance} &bull; Non-stop: ~${resData.route.duration} &bull; ${resData.count} flights found</span>
      `;

      // Render Dynamic Flight Cards
      resultsContainer.innerHTML = resData.data.map(f => {
        const badgeClass = `badge-${f.airlineCode.toLowerCase()}`.replace(/[^a-z0-9-]/g, '') || 'badge-indigo';
        return `
          <div class="flight-card">
            <div class="carrier-info">
              <div class="airline-badge ${getBadgeClass(f.airline)}">${f.airlineCode}</div>
              <div class="carrier-text">
                <h3>${f.airline} <small style="color: #64748b; font-size: 0.85rem;">(${f.flightNumber})</small></h3>
                <span class="meta">${f.aircraft} &bull; ${f.availableSeats} seats left</span>
              </div>
            </div>

            <div class="flight-timing">
              <div class="time-range">${f.departureTime} ➔ ${f.arrivalTime}</div>
              <div class="duration-line">${f.duration} (Direct)</div>
            </div>

            <div class="fare-action">
              <div class="price">₹${f.priceINR}</div>
              <button class="btn btn-book" data-flight='${JSON.stringify(f).replace(/'/g, "&apos;")}'>Book Now</button>
            </div>
          </div>
        `;
      }).join('');

      // Wire Book Now buttons to Open Modal (No more prompt popup!)
      resultsContainer.querySelectorAll('.btn-book').forEach(button => {
        button.addEventListener('click', (ev) => {
          selectedFlight = JSON.parse(ev.currentTarget.getAttribute('data-flight'));
          openCheckoutModal(selectedFlight);
        });
      });
    } catch (err) {
      resultsContainer.innerHTML = '<p style="color: #fee2e2; text-align: center;">Network error while fetching schedules.</p>';
    }
  });

  // Map Airline Name to CSS Badge Colors
  function getBadgeClass(name) {
    const n = name.toLowerCase();
    if (n.includes('indigo')) return 'badge-indigo';
    if (n.includes('express')) return 'badge-airindiaexpress';
    if (n.includes('air india')) return 'badge-airindia';
    if (n.includes('vistara')) return 'badge-vistara';
    if (n.includes('akasa')) return 'badge-akasa';
    if (n.includes('star')) return 'badge-starair';
    return 'badge-indigo';
  }

  // 4. Modal Flow & Form Handlers
  function openCheckoutModal(flight) {
    document.getElementById('modal-flight-title').textContent = `${flight.airline} (${flight.flightNumber})`;
    document.getElementById('modal-route-sub').textContent = `${flight.origin} ➔ ${flight.destination} on ${flight.date}`;
    document.getElementById('itin-flight-num').textContent = flight.flightNumber;
    document.getElementById('itin-schedule').textContent = `${flight.departureTime} - ${flight.arrivalTime}`;
    document.getElementById('itin-aircraft').textContent = flight.aircraft;
    document.getElementById('itin-fare').textContent = `₹${flight.priceINR}`;

    modal.style.display = 'flex';
  }

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Toggle Payment Methods Tabs
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => t.classList.remove('selected'));
      tab.classList.add('selected');

      const radio = tab.querySelector('input');
      radio.checked = true;

      // Hide all dynamic payment detail forms
      document.getElementById('upi-details').style.display = 'none';
      document.getElementById('card-details').style.display = 'none';
      document.getElementById('netbanking-details').style.display = 'none';

      // Show selected method fields
      if (radio.value === 'UPI') document.getElementById('upi-details').style.display = 'block';
      if (radio.value === 'Card') document.getElementById('card-details').style.display = 'block';
      if (radio.value === 'NetBanking') document.getElementById('netbanking-details').style.display = 'block';
    });
  });

  // 5. Submit Payment & Create Confirmed PNR Booking
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFlight) return;

    const passengerName = document.getElementById('passenger-name').value;
    const email = document.getElementById('passenger-email').value;
    const phone = document.getElementById('passenger-phone').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const payBtn = document.getElementById('pay-confirm-btn');

    payBtn.disabled = true;
    payBtn.textContent = `Processing ${paymentMethod} Payment...`;

    const payload = {
      passengerName,
      email,
      phone,
      flightNumber: selectedFlight.flightNumber,
      airline: selectedFlight.airline,
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      date: selectedFlight.date,
      priceINR: selectedFlight.priceINR,
      paymentMethod
    };

    try {
      // Simulate real-time payment gateway latency
      await new Promise(resolve => setTimeout(resolve, 800));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Payment Successful via ${paymentMethod}!\n\nBooking Confirmed.\nPassenger: ${data.data.passengerName}\nPNR: ${data.data.pnr}`);
        window.location.href = '/my-bookings';
      } else {
        alert('Booking Transaction Failed: ' + data.message);
        payBtn.disabled = false;
        payBtn.textContent = 'Pay & Confirm Booking';
      }
    } catch (err) {
      alert('Network error connecting to payment gateway.');
      payBtn.disabled = false;
      payBtn.textContent = 'Pay & Confirm Booking';
    }
  });
});
