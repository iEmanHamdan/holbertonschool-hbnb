/* ==========================================================================
   API CONFIGURATION
   ========================================================================== */
const API_BASE_URL = 'http://localhost:5000/api/v1';

/* ==========================================================================
   COOKIE HELPERS
   ========================================================================== */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days = 7) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('place_id');
}

/* ==========================================================================
   INITIALIZATION ROUTER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('token');

    // 1. Index Page Logic
    const placesList = document.getElementById('places-list');
    const loginLink = document.getElementById('login-link');
    const priceFilter = document.getElementById('price-filter');

    if (placesList) {
        if (token && loginLink) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                setCookie('token', '', -1);
                window.location.reload();
            });
        }
        fetchPlaces(token);

        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                filterPlacesByPrice(e.target.value);
            });
        }
    }

    // 2. Login Page Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await handleLogin(email, password);
        });
    }

    // 3. Place Details Page Logic
    const placeDetails = document.getElementById('place-details');
    if (placeDetails) {
        const placeId = getPlaceIdFromURL();
        const addReviewSection = document.getElementById('add-review');
        const addReviewLink = document.getElementById('add-review-link');

        if (!token && addReviewSection) {
            addReviewSection.style.display = 'none';
        } else if (addReviewLink && placeId) {
            addReviewLink.href = `review.html?id=${placeId}`;
        }

        if (placeId) {
            fetchPlaceDetails(token, placeId);
        } else {
            placeDetails.innerHTML = '<p>Error: No Place ID provided.</p>';
        }
    }

    // 4. Add Review Page Logic
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const placeId = getPlaceIdFromURL();
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = document.getElementById('rating').value;
            const text = document.getElementById('review-text').value;
            await submitReview(token, placeId, rating, text);
        });
    }
});

/* ==========================================================================
   API ACTIONS & DOM MANIPULATION
   ========================================================================== */

// --- LOGIN ---
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            setCookie('token', data.access_token);
            window.location.href = 'index.html';
        } else {
            alert('Login failed: Invalid email or password.');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Could not connect to API server.');
    }
}

// --- FETCH ALL PLACES ---
async function fetchPlaces(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/places/`, { headers });
        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        }
    } catch (err) {
        console.error('Failed to fetch places:', err);
    }
}

function displayPlaces(places) {
    const container = document.getElementById('places-list');
    container.innerHTML = '';

    // Array of your custom local images
    const customImages = [
        'images/fam1.png', 
        'images/fam2.png', 
        'images/kh1.png', 
        'images/kh4.png', 
        'images/kha3.png', 
        'images/khe1.png'
    ];

    places.forEach((place, index) => {
        const card = document.createElement('article');
        card.className = 'place-card';
        card.dataset.price = place.price || 0;

        // Cycles through your custom images based on the index
        const imageUrl = customImages[index % customImages.length];

        card.innerHTML = `
            <div class="place-card-image-placeholder" style="background-image: url('${imageUrl}')"></div>
            <h3>${place.title || place.name || 'Untitled Place'}</h3>
            <p class="price">$${place.price} / night</p>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
        `;
        container.appendChild(card);
    });
}

function filterPlacesByPrice(maxPrice) {
    const cards = document.querySelectorAll('.place-card');
    cards.forEach(card => {
        const price = parseFloat(card.dataset.price);
        if (maxPrice === 'all' || price <= parseFloat(maxPrice)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- FETCH PLACE DETAILS & INIT MAP ---
async function fetchPlaceDetails(token, placeId) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/places/${placeId}`, { headers });
        if (response.ok) {
            const place = await response.json();
            renderPlaceDetails(place);
            initMap(place.latitude || 24.7136, place.longitude || 46.6753, place.title || 'Property Location');
            renderReviews(place.reviews || []);
        }
    } catch (err) {
        console.error('Failed to load place details:', err);
    }
}

function renderPlaceDetails(place) {
    const container = document.getElementById('place-details');
    const amenities = place.amenities || [];

    let amenitiesHTML = amenities.map(a => `<span class="amenity-badge">${a.name || a}</span>`).join('');
    if (!amenitiesHTML) amenitiesHTML = '<span>No listed amenities</span>';

    container.innerHTML = `
        <h2 style="color: var(--hbnb-burgundy);">${place.title || 'Place Details'}</h2>
        <div class="place-info">
            <p><strong>Host:</strong> ${place.owner ? `${place.owner.first_name} ${place.owner.last_name}` : 'Unknown'}</p>
            <p><strong>Price per night:</strong> $${place.price}</p>
            <p><strong>Description:</strong> ${place.description || 'No description provided.'}</p>
            <p><strong>Amenities:</strong></p>
            <div class="amenities-list">${amenitiesHTML}</div>
        </div>
    `;
}

function initMap(lat, lng, title) {
    const mapElement = document.getElementById('place-map');
    if (!mapElement || typeof L === 'undefined') return;

    const map = L.map('place-map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${title}</b>`)
        .openPopup();
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-list');
    container.innerHTML = '';

    if (reviews.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No reviews yet.</p>';
        return;
    }

    reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span class="user-name">${r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Anonymous'}</span>
                <span class="rating">Rating: ${r.rating}/5 ★</span>
            </div>
            <p style="color: #333; line-height: 1.4;">${r.text || r.comment}</p>
        `;
        container.appendChild(card);
    });
}

// --- SUBMIT REVIEW ---
async function submitReview(token, placeId, rating, text) {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                place_id: placeId,
                rating: parseFloat(rating),
                text: text
            })
        });

        if (response.ok) {
            alert('Review submitted successfully!');
            window.location.href = `place.html?id=${placeId}`;
        } else {
            const err = await response.json();
            alert(`Failed: ${err.message || 'Could not submit review'}`);
        }
    } catch (err) {
        console.error('Error submitting review:', err);
    }
}