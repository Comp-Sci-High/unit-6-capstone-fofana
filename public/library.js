
        // Get all resources from the rendered page
        const allResourceElements = document.querySelectorAll('.resource-card');
        const allResources = Array.from(allResourceElements).map(card => {
            return JSON.parse(card.dataset.resource);
        });

        let filteredResources = [...allResources];

        function displayResources(resources) {
            const grid = document.getElementById('resourcesGrid');
            const noResults = document.getElementById('noResults');
            const resultsCount = document.getElementById('resultsCount');

            // Hide all cards first
            allResourceElements.forEach(card => {
                card.style.display = 'none';
            });

            // Show matching cards
            let visibleCount = 0;
            resources.forEach(resource => {
                const matchingCard = Array.from(allResourceElements).find(card => {
                    const cardData = JSON.parse(card.dataset.resource);
                    return cardData._id === resource._id;
                });
                if (matchingCard) {
                    matchingCard.style.display = 'block';
                    visibleCount++;
                }
            });

            resultsCount.textContent = `Showing ${visibleCount} resource${visibleCount !== 1 ? 's' : ''}`;

            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const productType = document.getElementById('productTypeFilter').value;
            const priceFilter = document.getElementById('priceFilter').value;
            
            // Get selected grade levels
            const selectedGrades = [];
            document.querySelectorAll('input[type="checkbox"][id^="grade"]:checked').forEach(cb => {
                selectedGrades.push(cb.value);
            });
            
            // Get selected languages
            const selectedLanguages = [];
            document.querySelectorAll('input[type="checkbox"][id^="lang"]:checked').forEach(cb => {
                selectedLanguages.push(cb.value);
            });

            filteredResources = allResources.filter(resource => {
                // Search filter
                if (searchTerm && !resource.ProductName.toLowerCase().includes(searchTerm) && 
                    !resource.Description.toLowerCase().includes(searchTerm)) {
                    return false;
                }
                
                // Product type filter
                if (productType && resource.ProductType !== productType) {
                    return false;
                }
                
                // Price filter
                if (priceFilter && resource.Price !== priceFilter) {
                    return false;
                }
                
                // Grade level filter
                if (selectedGrades.length > 0) {
                    const resourceGrades = resource.GradeLevel.split(',').map(g => g.trim());
                    const hasMatchingGrade = selectedGrades.some(grade => 
                        resourceGrades.includes(grade)
                    );
                    if (!hasMatchingGrade) return false;
                }
                
                // Language filter
                if (selectedLanguages.length > 0 && resource.SupportedLanguages) {
                    const resourceLanguages = resource.SupportedLanguages.split(',').map(l => l.trim());
                    const hasMatchingLanguage = selectedLanguages.some(lang => 
                        resourceLanguages.includes(lang)
                    );
                    if (!hasMatchingLanguage) return false;
                }
                
                return true;
            });
            
            displayResources(filteredResources);
        }

        function clearAllFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('productTypeFilter').value = '';
            document.getElementById('priceFilter').value = '';
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            applyFilters();
        }

        // Add event listeners
        document.getElementById('searchInput').addEventListener('input', applyFilters);
        document.getElementById('productTypeFilter').addEventListener('change', applyFilters);
        document.getElementById('priceFilter').addEventListener('change', applyFilters);
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', applyFilters);
        });

        // Initial load - show all resources
        displayResources(allResources);
