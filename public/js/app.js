// public/js/app.js

document.addEventListener('DOMContentLoaded', async () => {
  // DOM References: Main Search
  const originSelect = document.getElementById('origin-select');
  const destSelect = document.getElementById('dest-select');
  const dateInput = document.getElementById('flight-date');
  const swapBtn = document.getElementById('swap-airports');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');
  const routeSummary = document.getElementById('route-summary');

  // DOM References: Checkout Modal
  const modal = document.getElementById('checkout-modal');
  const modalClose = document.getElementById('modal-close');
  const paymentForm = document.getElementById('booking-payment-form');
  const seatGrid = document.getElementById('seat-grid');
  const selectedSeatText = document.getElementById('selected-seat-text');
  const payBtn = document.getElementById('pay-confirm-btn');

  // DOM References: Confirmation Modal
  const confModal = document.getElementById('confirmation-modal');
  const confDoneBtn = document.getElementById('conf-done-btn');

  // Primary High-Resolution Vector CDN Logos
  const AIRLINE_LOGOS = {
    airindia: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Air_India_2023.svg",
    airindiaexpress: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmquX8qTvbJIS5MxxkXTegeiAApF2qxT62PJodsMueRg&s=10",
    akasa: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Akasa_Air_Logo.svg",
    indigo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/IndiGo_Airlines_logo.svg",
    vistara: "https://upload.wikimedia.org/wikipedia/en/2/22/Vistara_logo.svg",
    starair: "https://upload.wikimedia.org/wikipedia/commons/4/45/Star_Air_India_Logo.png"
  };

  // Secondary Fallback CDN Mirrors
  const AIRLINE_FALLBACKS = {
    airindia: "https://images.seeklogo.com/logo-png/1/2/air-india-logo-png_seeklogo-19195.png",
    airindiaexpress: "https://images.seeklogo.com/logo-png/44/1/air-india-express-logo-png_seeklogo-446733.png",
    akasa: "https://images.seeklogo.com/logo-png/43/1/akasa-air-logo-png_seeklogo-431806.png",
    indigo: "https://images.seeklogo.com/logo-png/43/1/indigo-airlines-logo-png_seeklogo-431804.png",
    vistara: "https://images.seeklogo.com/logo-png/29/1/vistara-logo-png_seeklogo-299307.png",
    starair: "https://images.seeklogo.com/logo-png/43/1/star-air-india-logo-png_seeklogo-431805.png"
  };

  // State Management
  let selectedFlight = null;
  let selectedSeat = { id: "2B", price: 0 };
  let selectedMeal = { name: "No Meal Service", price: 0 };

  // Set date constraints: Minimum date is today, default is tomorrow
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];

  // Helper: Extract normalized airline key
  function getAirlineKey(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('express')) return 'airindiaexpress';
    if (n.includes('air india')) return 'airindia';
    if (n.includes('akasa')) return 'akasa';
    if (n.includes('indigo')) return 'indigo';
    if (n.includes('vistara')) return 'vistara';
    if (n.includes('star')) return 'starair';
    return 'indigo';
  }

  // 1. Fetch & Populate Airport Directory
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

  // 3. Search Flights & Render Results
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

      // Display Route Summary Header
      routeSummary.style.display = 'flex';
      routeSummary.innerHTML = `
        <span><strong>${resData.route.origin} ➔ ${resData.route.destination}</strong></span>
        <span>Distance: ${resData.route.distance} &bull; Non-stop: ~${resData.route.duration} &bull; ${resData.count} flights found</span>
      `;

      // Render Dynamic Flight Cards with Official Logos & Fallbacks
      resultsContainer.innerHTML = resData.data.map(f => {
        const key = getAirlineKey(f.airline);
        const primaryLogo = AIRLINE_LOGOS[key];
        const secondaryLogo = AIRLINE_FALLBACKS[key];

        return `
          <div class="flight-card">
            <div class="carrier-info">
              <div class="airline-logo-box">
                <img 
                  src="${primaryLogo}" 
                  alt="${f.airline}" 
                  loading="lazy"
                  onerror="this.onerror=null; this.src='${secondaryLogo}';"
                >
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

      // Wire Book Now buttons to open the Checkout Modal
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

      seatsLeft.forEach(col => {
        rowDiv.appendChild(createSeatElement(r, col, occupiedSeats));
      });

      const aisle = document.createElement('div');
      aisle.className = 'seat-aisle';
      aisle.textContent = r;
      rowDiv.appendChild(aisle);

      seatsRight.forEach(col => {
        rowDiv.appendChild(createSeatElement(r, col, occupiedSeats));
      });

      seatGrid.appendChild(rowDiv);
    }
  }

  function createSeatElement(row, col, occupiedSeats) {
    const seatId = `${row}${col}`;
    const seatDiv = document.createElement('div');
    const isPremium = (row === 1); // Row 1: Extra Legroom
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
    const key = getAirlineKey(flight.airline);
    const modalLogo = document.getElementById('modal-airline-logo');
    
    modalLogo.src = AIRLINE_LOGOS[key];
    modalLogo.onerror = function() {
      this.onerror = null;
      this.src = AIRLINE_FALLBACKS[key];
    };

    document.getElementById('modal-flight-title').textContent = `${flight.airline} (${flight.flightNumber})`;
    document.getElementById('modal-route-sub').textContent = `${flight.origin} ➔ ${flight.destination} on ${flight.date}`;
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

  // 6. Meal Card Selection Handlers
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

  // 7. Dynamic Fare Recalculation (Base Fare + Seat Surcharge + Meal)
  function updatePayableTotal() {
    if (!selectedFlight) return;
    const total = selectedFlight.priceINR + selectedSeat.price + selectedMeal.price;
    document.getElementById('itin-addons').textContent = `${selectedSeat.id} | ${selectedMeal.name.split(' ')[0]}`;
    document.getElementById('itin-fare').textContent = `₹${total}`;
    payBtn.textContent = `Pay ₹${total} & Confirm Booking`;
  }

  // 8. Payment Method Tabs Switching
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

  // 9. Payment Submission & In-App Confirmation Card
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
      // Simulate real-time payment gateway handshake latency
      await new Promise(r => setTimeout(r, 800));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        modal.style.display = 'none'; // Close payment form

        // Populate and display In-App Confirmation Card (No browser alerts)
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
        payBtn.textContent = `Pay ₹${totalAmount} & Confirm Booking`;
      }
    } catch (err) {
      alert('Network error connecting to payment gateway.');
      payBtn.disabled = false;
      payBtn.textContent = `Pay ₹${totalAmount} & Confirm Booking`;
    }
  });

  confDoneBtn.addEventListener('click', () => {
    window.location.href = '/my-bookings';
  });
});
