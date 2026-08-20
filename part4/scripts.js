const API_URL = 'http://localhost:5000/api/v1';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    // Shared Authentication Check
    const loginLink = document.getElementById('login-link');
    const token = getCookie('token');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
        }
    }

    // --- Task 2: Login Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/`;
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: Check your credentials.');
                }
            } catch (error) {
                console.error("Error during login:", error);
            }
        });
    }

    // --- Task 3: Index Page (List Places & Filter) ---
    const placesList = document.getElementById('places-list');
    if (placesList) {
        fetchPlaces(token);

        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (event) => {
                const selectedPrice = event.target.value;
                const cards = document.querySelectorAll('.place-card');
                
                cards.forEach(card => {
                    const price = parseFloat(card.dataset.price);
                    if (selectedPrice === 'All' || price <= parseFloat(selectedPrice)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }

    // --- Task 4: Place Details Page ---
    const placeDetails = document.getElementById('place-details');
    if (placeDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const placeId = urlParams.get('id');
        
        const addReviewSection = document.getElementById('add-review');
        if (!token) {
            addReviewSection.style.display = 'none';
        } else {
            addReviewSection.style.display = 'block';
            document.getElementById('add-review-link').href = `add_review.html?id=${placeId}`;
        }
        
        if (placeId) {
            fetchPlaceDetails(token, placeId);
        }
    }

    // --- Task 5: Add Review Page ---
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        if (!token) {
            window.location.href = 'index.html';
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const placeId = urlParams.get('id');
            
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const reviewText = document.getElementById('review-text').value;
                
                try {
                    const response = await fetch(`${API_URL}/reviews/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ text: reviewText, place_id: placeId, rating: 5 }) // Note: Adding default rating if backend requires it
                    });

                    if (response.ok) {
                        alert('Review submitted successfully!');
                        window.location.href = `place.html?id=${placeId}`;
                    } else {
                        alert('Failed to submit review');
                    }
                } catch (error) {
                    console.error("Error submitting review:", error);
                }
            });
        }
    }
});

// --- HELPER FUNCTIONS ---

async function fetchPlaces(token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_URL}/places/`, { headers });
        if (response.ok) {
            const places = await response.json();
            const container = document.getElementById('places-list');
            container.innerHTML = '';

            places.forEach(place => {
                const card = document.createElement('article');
                card.className = 'place-card';
                card.dataset.price = place.price;
                card.innerHTML = `
                    <h3>${place.title || place.name}</h3>
                    <p>Price: $${place.price} per night</p>
                    <a href="place.html?id=${place.id}" class="details-button">View Details</a>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error fetching places:", error);
    }
}

async function fetchPlaceDetails(token, placeId) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_URL}/places/${placeId}`, { headers });
        if (response.ok) {
            const place = await response.json();
            const detailsContainer = document.getElementById('place-details');
            
            detailsContainer.innerHTML = `
                <div class="place-info">
                    <h2>${place.title || place.name}</h2>
                    <p><strong>Host:</strong> ${place.owner ? place.owner.first_name : 'Unknown'}</p>
                    <p><strong>Price:</strong> $${place.price} per night</p>
                    <p><strong>Description:</strong> ${place.description}</p>
                </div>
            `;

            const reviewsContainer = document.getElementById('reviews-list');
            if (place.reviews && place.reviews.length > 0) {
                place.reviews.forEach(review => {
                    const rCard = document.createElement('div');
                    rCard.className = 'review-card';
                    rCard.innerHTML = `
                        <p><strong>${review.user ? review.user.first_name : 'Anonymous'}:</strong></p>
                        <p>${review.text}</p>
                    `;
                    reviewsContainer.appendChild(rCard);
                });
            } else {
                reviewsContainer.innerHTML += '<p>No reviews yet.</p>';
            }
        }
    } catch (error) {
        console.error("Error fetching place details:", error);
    }
}