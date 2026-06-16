document.addEventListener('DOMContentLoaded', () => {
    const plantsGrid = document.getElementById('plants-grid');
    const searchInput = document.getElementById('search-input');

    const fetchPlants = (searchQuery = '') => {
        plantsGrid.innerHTML = '<div aria-busy="true" class="loading-state">Loading plants...</div>';
        
        const url = searchQuery ? `/api/plants?search=${encodeURIComponent(searchQuery)}` : '/api/plants';
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(plants => {
                plantsGrid.innerHTML = '';
                
                if (plants.length === 0) {
                    plantsGrid.innerHTML = `<p class="loading-state">No matching plants found. Try another search!</p>`;
                    return;
                }

                plants.forEach(plant => {
                    const card = document.createElement('article');
                    card.className = 'plant-card';
                    
                    card.addEventListener('click', () => {
                        window.location.href = `/plants/${plant.id}`;
                    });

                    let badgeClass = 'difficulty-easy';
                    if (plant.difficulty.toLowerCase().includes('medium')) badgeClass = 'difficulty-medium';
                    if (plant.difficulty.toLowerCase().includes('hard')) badgeClass = 'difficulty-hard';

                    card.innerHTML = `
                        <div class="plant-image-wrapper">
                            <img src="${plant.image}" alt="${plant.name}" loading="lazy">
                        </div>
                        <div class="card-content">
                            <h3>${plant.name}</h3>
                            <em>${plant.scientificName}</em>
                            <p>${plant.description.substring(0, 100)}...</p>
                            <div>
                                <span class="difficulty-badge ${badgeClass}">${plant.difficulty}</span>
                            </div>
                        </div>
                    `;
                    
                    plantsGrid.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error fetching plants:', error);
                plantsGrid.innerHTML = `<p class="error">Failed to load plants. Please try again later.</p>`;
            });
    };

    // Initial load
    fetchPlants();

    // Live search listener with simple debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchPlants(e.target.value.trim());
        }, 300);
    });
});
