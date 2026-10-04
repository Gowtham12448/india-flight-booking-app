// public/js/app.js
document.addEventListener('DOMContentLoaded', async () => {
  const originSelect = document.getElementById('origin-select');
  const destSelect = document.getElementById('dest-select');
  const dateInput = document.getElementById('flight-date');
  const swapBtn = document.getElementById('swap-airports');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');
  const routeSummary = document.getElementById('route-summary');

  // Checkout Modal Elements
  const modal = document.getElementById('checkout-modal');
  const modalClose = document.getElementById('modal-close');
  const paymentForm = document.getElementById('booking-payment-form');
  const seatGrid = document.getElementById('seat-grid');
  const selectedSeatText = document.getElementById('selected-seat-text');
  const payBtn = document.getElementById('pay-confirm-btn');

  // Confirmation Modal Elements
  const confModal = document.getElementById('confirmation-modal');
  const confDoneBtn = document.getElementById('conf-done-btn');

  // Airline Logos Registry (High quality CDN brand marks)
  const AIRLINE_LOGOS = {
    "indigo": "https://images.seeklogo.com/logo-png/43/1/indigo-airlines-logo-png_seeklogo-431804.png",
    "airindia": "https://images.seeklogo.com/logo-png/1/2/air-india-logo-png_seeklogo-19195.png",
    "airindiaexpress": "https://images.seeklogo.com/logo-png/44/1/air-india-express-logo-png_seeklogo-446733.png",
    "vistara": "https://images.seeklogo.com/logo-png/29/1/vistara-logo-png_seeklogo-299307.png",
    "akasa": "https://images.seeklogo.com/logo-png/43/1/akasa-air-logo-png_seeklogo-431806.png",
    "starair": "https://images.seeklogo.com/logo-png/43/1/star-air-india-logo-png_seeklogo-431805.png"
  };

  // State Tracking
  let selectedFlight = null;
  let selectedSeat = { id: "3B", price: 0 };
  let selectedMeal = { name: "No Meal Service", price: 0 };

  // Set min allowable booking date
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
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
    destSelect.selectedIndex = 1; // Default to BOM
  } catch (err) {
    resultsContainer.innerHTML = '<p style="color: #fff; text-align: center;">Error loading airport directory.</p>';
  }

  // 2. Swap Origin / Destination
  swapBtn.addEventListener('click', () => {
    const temp = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = temp;
  });

  // Helper to map airline to logo
  function getAirlineLogo(name) {
    const n = name.toLowerCase();
    if (n.includes('express')) return AIRLINE_LOGOS.airindiaexpress;
    if (n.includes('air india')) return AIRLINE_LOGOS.airindia;
    if (n.includes('indigo')) return AIRLINE_LOGOS.indigo;
    if (n.includes('vistara')) return AIRLINE_LOGOS.vistara;
    if (n.includes('akasa')) return AIRLINE_LOGOS.akasa;
    if (n.includes('star')) return AIRLINE_LOGOS.starair;
    return AIRLINE_LOGOS.indigo;
  }

  // 3. Search Flights
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = originSelect.value;
    const to = destSelect.value;
    const date = dateInput.value;

    resultsContainer.innerHTML = '<p style="color: #fff; text-align: center; padding: 24px;">Fetching live schedules from domestic carriers...</p>';
    routeSummary.style.display = 'none';

    try {
      const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
      const resData = await response.json();

      if (!resData.success) {
        resultsContainer.innerHTML = `<p style="color: #fee2e2; text-align: center; padding: 20px;">${resData.message}</p>`;
        return;
      }

      routeSummary.style.display = 'flex';
      routeSummary.innerHTML = `
        <span><strong>${resData.route.origin} ➔ ${resData.route.destination}</strong></span>
        <span>Distance: ${resData.route.distance} &bull; Non-stop: ~${resData.route.duration} &bull; ${resData.count} flights found</span>
      `;

      resultsContainer.innerHTML = resData.data.map(f => {
        const logoUrl = getAirlineLogo(f.airline);
        return `
          <div class="flight-card">
            <div class="carrier-info">
              <div class="airline-logo-box">
                <img src="${logoUrl}" alt="${f.airline}" onerror="this.src='https://placehold.co/52x52?text=${f.airlineCode}'">
              </div>
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

      // Wire Book Now buttons to open Modal
      resultsContainer.querySelectorAll('.btn-book').forEach(button => {
        button.addEventListener('click', (ev) => {
          selectedFlight = JSON.parse(ev.currentTarget.getAttribute('data-flight'));
          openCheckoutModal(selectedFlight);
        });
      });
    } catch (err) {
      resultsContainer.innerHTML = '<p style="color: #fee2e2; text-align: center;">Error retrieving flight results.</p>';
    }
  });

  // 4. Build Aircraft Cabin Seat Map
  function renderSeatMap() {
    seatGrid.innerHTML = '';
    const rows = 6;
    const occupiedSeats = ["1A", "2D", "3F", "4B", "5C"]; // Simulated booked seats

    for (let r = 1; r <= rows; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      const seatsLeft = ['A', 'B', 'C'];
      const seatsRight = ['D', 'E', 'F'];

      // Left seats
      seatsLeft.forEach(col => {
        rowDiv.appendChild(createSeatElement(r, col, occupiedSeats));
      });

      // Aisle indicator
      const aisle = document.createElement('div');
      aisle.className = 'seat-aisle';
      aisle.textContent = r;
      rowDiv.appendChild(aisle);

      // Right seats
      seatsRight.forEach(col => {
        rowDiv.appendChild(createSeatElement(r, col, occupiedSeats));
      });

      seatGrid.appendChild(rowDiv);
    }
  }

  function createSeatElement(row, col, occupiedSeats) {
    const seatId = `${row}${col}`;
    const seatDiv = document.createElement('div');
    const isPremium = (row === 1); // Row 1 is XL Extra legroom
    const isOccupied = occupiedSeats.includes(seatId);

    seatDiv.className = `seat ${isPremium ? 'premium' : ''} ${isOccupied ? 'occupied' : ''}`;
    seatDiv.textContent = seatId;

    if (!isOccupied) {
      if (selectedSeat && selectedSeat.id === seatId) {
        seatDiv.classList.add('selected');
      }

      seatDiv.addEventListener('click', () => {
        document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
        seatDiv.classList.add('selected');
        selectedSeat = {
          id: seatId,
          price: isPremium ? 450 : 0
        };
        selectedSeatText.innerHTML = `Selected Seat: <strong>${seatId}</strong> ${isPremium ? '(Extra Legroom +₹450)' : '(Standard Free)'}`;
        updatePayableTotal();
      });
    }

    return seatDiv;
  }

  // 5. Open Checkout Modal
  function openCheckoutModal(flight) {
    document.getElementById('modal-flight-title').textContent = `${flight.airline} (${flight.flightNumber})`;
    document.getElementById('modal-route-sub').textContent = `${flight.origin} ➔ ${flight.destination} on ${flight.date}`;
    document.getElementById('modal-airline-logo').src = getAirlineLogo(flight.airline);
    document.getElementById('itin-flight-num').textContent = flight.flightNumber;
    document.getElementById('itin-schedule').textContent = `${flight.departureTime} - ${flight.arrivalTime}`;

    // Reset Defaults
    selectedSeat = { id: "2B", price: 0 };
    selectedMeal = { name: "No Meal Service", price: 0 };
    document.querySelector('input[name="meal-choice"][value="None"]').checked = true;
    document.querySelectorAll('.meal-card').forEach(m => m.classList.remove('selected'));
    document.querySelector('.meal-card').classList.add('selected');

    renderSeatMap();
    selectedSeatText.innerHTML = `Selected Seat: <strong>${selectedSeat.id}</strong> (Standard Free)`;
    updatePayableTotal();

    modal.style.display = 'flex';
  }

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Meal Choice Click Handlers
  document.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.meal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input');
      radio.checked = true;

      selectedMeal = {
        name: radio.value,
        price: parseInt(radio.getAttribute('data-price'), 10)
      };
      updatePayableTotal();
    });
  });

  // Update Dynamic Total (Base + Seat + Meal)
  function updatePayableTotal() {
    if (!selectedFlight) return;
    const total = selectedFlight.priceINR + selectedSeat.price + selectedMeal.price;
    document.getElementById('itin-addons').textContent = `${selectedSeat.id} | ${selectedMeal.name.split(' ')[0]}`;
    document.getElementById('itin-fare').textContent = `₹${total}`;
    payBtn.textContent = `Pay ₹${total} & Confirm Booking`;
  }

  // Payment Method Tabs Selection
  document.querySelectorAll('.payment-option').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(t => t.classList.remove('selected'));
      tab.classList.add('selected');
      const radio = tab.querySelector('input');
      radio.checked = true;

      document.getElementById('upi-details').style.display = 'none';
      document.getElementById('card-details').style.display = 'none';
      document.getElementById('netbanking-details').style.display = 'none';

      if (radio.value === 'UPI') document.getElementById('upi-details').style.display = 'block';
      if (radio.value === 'Card') document.getElementById('card-details').style.display = 'block';
      if (radio.value === 'NetBanking') document.getElementById('netbanking-details').style.display = 'block';
    });
  });

  // 6. Submit Payment & Show In-App Confirmation Card
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFlight) return;

    const passengerName = document.getElementById('passenger-name').value;
    const email = document.getElementById('passenger-email').value;
    const phone = document.getElementById('passenger-phone').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const totalAmount = selectedFlight.priceINR + selectedSeat.price + selectedMeal.price;

    payBtn.disabled = true;
    payBtn.textContent = `Authorizing ₹${totalAmount} via ${paymentMethod}...`;

    const payload = {
      passengerName,
      email,
      phone,
      flightNumber: selectedFlight.flightNumber,
      airline: selectedFlight.airline,
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      date: selectedFlight.date,
      priceINR: totalAmount,
      allocatedSeat: selectedSeat.id,
      selectedMeal: selectedMeal.name,
      paymentMethod
    };

    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate gateway latency

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        modal.style.display = 'none'; // Close payment form

        // Display In-App Confirmation Card
        document.getElementById('conf-pnr').textContent = data.data.pnr;
        document.getElementById('conf-name').textContent = data.data.passengerName;
        document.getElementById('conf-flight').textContent = `${data.data.airline} (${data.data.flightNumber})`;
        document.getElementById('conf-seat').textContent = selectedSeat.id;
        document.getElementById('conf-meal').textContent = selectedMeal.name;
        document.getElementById('conf-amount').textContent = `₹${totalAmount}`;

        confModal.style.display = 'flex';
      } else {
        alert('Booking Transaction Failed: ' + data.message);
        payBtn.disabled = false;
      }
    } catch (err) {
      alert('Communication error with server.');
      payBtn.disabled = false;
    }
  });

  confDoneBtn.addEventListener('click', () => {
    window.location.href = '/my-bookings';
  });
});
