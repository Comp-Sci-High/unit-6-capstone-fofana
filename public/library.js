let currentSortBy = 'name'; // Default sort by name
let currentSortOrder = 'asc'; // Default ascending order

// ========================
// MAIN APPLICATION INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginModal();
    initializeResourceFiltering();
    initializeMobileMenu();
    initializeAutocompleteFilters(); // Move this after initializeResourceFiltering
    initializeDescriptionTruncation();
    initializeHeaderScrollEffects();
    initializeSorting();
});

// ========================
// SORTING FUNCTIONALITY
// ========================
function initializeSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const [sortBy, sortOrder] = this.value.split('-');
            currentSortBy = sortBy;
            currentSortOrder = sortOrder;
            applyFilters(); // This will now include sorting
        });
    }
}

function sortResources(resources, sortBy = currentSortBy, sortOrder = currentSortOrder) {
    const sorted = [...resources].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = (a.ProductName || '').toLowerCase();
                bValue = (b.ProductName || '').toLowerCase();
                break;
                
            case 'rating':
                // Try multiple ways to get rating data
                aValue = 0;
                bValue = 0;
                
                // First try from the resource object itself
                if (a.ratingData && a.ratingData.averageRating) {
                    aValue = parseFloat(a.ratingData.averageRating);
                } else if (a.averageRating) {
                    aValue = parseFloat(a.averageRating);
                } else if (a.Rating) {
                    aValue = parseFloat(a.Rating);
                }
                
                if (b.ratingData && b.ratingData.averageRating) {
                    bValue = parseFloat(b.ratingData.averageRating);
                } else if (b.averageRating) {
                    bValue = parseFloat(b.averageRating);
                } else if (b.Rating) {
                    bValue = parseFloat(b.Rating);
                }
                
                // If still no rating data, try to get it from the DOM
                if (aValue === 0 && bValue === 0) {
                    try {
                        const aCard = document.querySelector(`[data-resource*='"_id":"${a._id}"']`);
                        const bCard = document.querySelector(`[data-resource*='"_id":"${b._id}"']`);
                        
                        if (aCard && aCard.dataset.rating) {
                            aValue = parseFloat(aCard.dataset.rating) || 0;
                        }
                        if (bCard && bCard.dataset.rating) {
                            bValue = parseFloat(bCard.dataset.rating) || 0;
                        }
                    } catch (e) {
                        console.warn('Could not get rating from DOM:', e);
                    }
                }
                
                // Ensure we have valid numbers
                aValue = isNaN(aValue) ? 0 : aValue;
                bValue = isNaN(bValue) ? 0 : bValue;
                break;
                
            case 'price':
                // Handle price sorting - Free comes first (0), then numeric values
                const aPrice = a.Price || '';
                const bPrice = b.Price || '';
                
                if (aPrice === 'Free') {
                    aValue = 0;
                } else if (aPrice === '' || aPrice === 'N/A') {
                    aValue = 999999; // Put empty/unknown prices at the end
                } else {
                    // Extract numeric value from price string
                    const numericPrice = aPrice.toString().replace(/[^0-9.-]+/g, '');
                    aValue = parseFloat(numericPrice) || 999999;
                }
                
                if (bPrice === 'Free') {
                    bValue = 0;
                } else if (bPrice === '' || bPrice === 'N/A') {
                    bValue = 999999;
                } else {
                    const numericPrice = bPrice.toString().replace(/[^0-9.-]+/g, '');
                    bValue = parseFloat(numericPrice) || 999999;
                }
                break;
                
            default:
                aValue = (a.ProductName || '').toLowerCase();
                bValue = (b.ProductName || '').toLowerCase();
        }
        
        // Handle comparison based on sort order
        if (sortBy === 'name') {
            // String comparison
            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        } else {
            // Numeric comparison (rating, price)
            if (sortOrder === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        }
    });
    
    return sorted;
}

// ========================
// ENHANCED DISPLAY FUNCTION
// ========================
function displayResources(resources) {
    const resourcesGrid = document.getElementById('resourcesGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!resourcesGrid) {
        console.error('Resources grid element not found');
        return;
    }
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `Showing ${resources.length} approved resource${resources.length !== 1 ? 's' : ''}`;
    }
    
    // Show/hide no results message
    if (noResults) {
        noResults.style.display = resources.length === 0 ? 'block' : 'none';
    }
    
    // Clear existing content
    resourcesGrid.innerHTML = '';
    
    // If no resources, return early
    if (resources.length === 0) {
        resourcesGrid.style.display = 'none';
        return;
    }
    
    resourcesGrid.style.display = 'grid';
    
    // Create and append resource cards
    resources.forEach(resource => {
        const card = createResourceCard(resource);
        if (card) {
            resourcesGrid.appendChild(card);
        }
    });
}

function createResourceCard(resource) {
    try {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.id = resource._id;
        
        // Get rating data
        const ratingData = resource.ratingData || { averageRating: 0, reviewCount: 0 };
        const averageRating = ratingData.averageRating || 0;
        const reviewCount = ratingData.reviewCount || 0;
        
        // Set data attributes
        card.setAttribute('data-resource', JSON.stringify(resource));
        card.setAttribute('data-rating', averageRating.toString());
        card.setAttribute('data-review-count', reviewCount.toString());
        card.setAttribute('data-name', resource.ProductName || '');
        card.setAttribute('data-type', resource.ProductType || '');
        card.setAttribute('data-grade', resource.GradeLevel || '');
        card.setAttribute('data-price', resource.Price || '');
        card.setAttribute('data-languages', resource.SupportedLanguages || '');
        card.setAttribute('data-standards', resource.StandardAlignment || '');
        card.setAttribute('data-topic', resource.Topic || '');
        
        // Create rating stars HTML
        let ratingStarsHtml = '';
        if (reviewCount > 0) {
            for (let i = 1; i <= 5; i++) {
                const starClass = i <= Math.round(averageRating) ? 'rating-star' : 'rating-star empty';
                ratingStarsHtml += `<span class="${starClass}">★</span>`;
            }
        }
        
        // Create supported languages HTML
        let languagesHtml = '';
        if (resource.SupportedLanguages) {
            const languages = resource.SupportedLanguages.split(',');
            languagesHtml = languages.map(lang => `<span class="meta-tag">${lang.trim()}</span>`).join('');
        }
        
        // Build card HTML
        card.innerHTML = `
            <h3 class="resource-title">${resource.ProductName || 'Untitled Resource'}</h3>
            
            <div class="rating-display">
                ${reviewCount > 0 ? `
                    <div class="rating-stars">
                        ${ratingStarsHtml}
                    </div>
                    <span class="rating-text">
                        ${averageRating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})
                    </span>
                ` : `
                    <span class="no-rating">No reviews yet</span>
                `}
            </div>
            
            <p class="description">${resource.Description || 'No description available'}</p>
            
            ${resource.Topic ? `
                <div class="product-topic">
                    <span class="topic-label">Topic:</span>
                    <span class="topic-value">${resource.Topic}</span>
                </div>
            ` : ''}
            
            <div class="resource-meta">
                <span class="meta-tag">${resource.ProductType || 'Unknown Type'}</span>
                <span class="meta-tag">${resource.GradeLevel || 'All Grades'}</span>
                <span class="price-tag">${resource.Price || 'Price Not Available'}</span>
            </div>
            
            ${languagesHtml ? `
                <div class="resource-meta">
                    ${languagesHtml}
                </div>
            ` : ''}
            
            ${resource.StandardAlignment ? `
                <div class="standard-alignment">
                    <strong>Standards:</strong> ${resource.StandardAlignment}
                </div>
            ` : ''}
            
            <div class="card-actions">
                <a href="/indy/${resource._id}" class="btn btn-primary">Learn More</a>
                ${resource.Website ? `
                    <a href="${resource.Website}" target="_blank" class="btn btn-outline">Visit Website</a>
                ` : ''}
            </div>
        `;
        
        return card;
    } catch (error) {
        console.error('Error creating resource card:', error, resource);
        return null;
    }
}

// ========================
// BACKUP SORTING FOR HTML FALLBACK
// ========================
// This runs if the main library.js isn't loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only run if the main sorting function isn't available
    if (typeof window.sortResources === 'undefined') {
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortValue = this.value;
                const resourcesGrid = document.getElementById('resourcesGrid');
                if (!resourcesGrid) return;
                
                const cards = Array.from(resourcesGrid.querySelectorAll('.resource-card'));
                
                cards.sort((a, b) => {
                    let aValue, bValue;
                    
                    switch(sortValue) {
                        case 'name-asc':
                            aValue = (a.getAttribute('data-name') || '').toLowerCase();
                            bValue = (b.getAttribute('data-name') || '').toLowerCase();
                            return aValue.localeCompare(bValue);
                            
                        case 'name-desc':
                            aValue = (a.getAttribute('data-name') || '').toLowerCase();
                            bValue = (b.getAttribute('data-name') || '').toLowerCase();
                            return bValue.localeCompare(aValue);
                            
                        case 'rating-desc':
                            aValue = parseFloat(a.getAttribute('data-rating')) || 0;
                            bValue = parseFloat(b.getAttribute('data-rating')) || 0;
                            return bValue - aValue;
                            
                        case 'rating-asc':
                            aValue = parseFloat(a.getAttribute('data-rating')) || 0;
                            bValue = parseFloat(b.getAttribute('data-rating')) || 0;
                            return aValue - bValue;
                            
                        case 'price-asc':
                            aValue = getPriceValue(a.getAttribute('data-price'));
                            bValue = getPriceValue(b.getAttribute('data-price'));
                            return aValue - bValue;
                            
                        case 'price-desc':
                            aValue = getPriceValue(a.getAttribute('data-price'));
                            bValue = getPriceValue(b.getAttribute('data-price'));
                            return bValue - aValue;
                            
                        default:
                            return 0;
                    }
                });
                
                // Clear and re-append sorted cards
                resourcesGrid.innerHTML = '';
                cards.forEach(card => resourcesGrid.appendChild(card));
            });
        }
    }
});

function getPriceValue(priceString) {
    if (!priceString) return 999999;
    if (priceString === 'Free') return 0;
    if (priceString === 'N/A' || priceString === '') return 999999;
    
    const numericPrice = priceString.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPrice) || 999999;
}
// ========================
// ENHANCED FILTER LOGIC WITH SORTING
// ========================
function initializeAutocompleteFilters() {
    const resourceTypes = [
        'Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 
        'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 
        'Online Course', 'Educational', 'Other'
    ];
    
    const gradeLevels = ['K-5', '6-8', '9-12', 'Higher Ed'];
    
    const languages = [
        'Scratch', 'Python', 'JavaScript', 'Java', 'Block-based', 'HTML/CSS', 
        'C++', 'C#', 'Swift', 'Ruby', 'Go', 'SQL', 'R', 'Shell/Bash', 
        'PowerShell', 'Assembly', 'C', 'Unplugged', 'AI Skills'
    ];
    
    const standards = [
        'CSTA K-12 Computer Science Standards',
        'ISTE Standards for Students',
        'K–12 Computer Science Framework',
        'Next Generation Science Standards (NGSS)',
        'AP Computer Science A Framework',
        'AP Computer Science Principles Framework',
        'Other'
    ];

    // FIXED: Updated topic options to your specified list
    const topics = [
        'Software Engineering',
        'Graphic/UX Design', 
        'Cybersecurity',
        'Data Science',
        'Robotics',
        'Machine Learning/AI',
        'Other'
    ];

    // Initialize resource type autocomplete
    const resourceTypeContainer = document.getElementById('resourceTypeAutocomplete');
    if (resourceTypeContainer) {
        window.resourceTypeFilter = new AutocompleteMultiSelect(resourceTypeContainer, {
            options: resourceTypes,
            placeholder: 'Select resource types...',
            onSelectionChange: (selectedValues) => {
                console.log('Resource type selection changed:', selectedValues);
                applyFilters();
            }
        });
    }
    
    // Initialize grade level autocomplete
    const gradeLevelContainer = document.getElementById('gradeLevelAutocomplete');
    if (gradeLevelContainer) {
        window.gradeLevelFilter = new AutocompleteMultiSelect(gradeLevelContainer, {
            options: gradeLevels,
            placeholder: 'Select grade levels...',
            onSelectionChange: (selectedValues) => {
                console.log('Grade level selection changed:', selectedValues);
                applyFilters();
            }
        });
    }
    
    // Initialize language autocomplete
    const languageContainer = document.getElementById('languageAutocomplete');
    if (languageContainer) {
        window.languageFilter = new AutocompleteMultiSelect(languageContainer, {
            options: languages,
            placeholder: 'Select languages/tools...',
            onSelectionChange: (selectedValues) => {
                console.log('Language selection changed:', selectedValues);
                applyFilters();
            }
        });
    }
    
    // Initialize standards autocomplete
    const standardsContainer = document.getElementById('standardsAutocomplete');
    if (standardsContainer) {
        window.standardsFilter = new AutocompleteMultiSelect(standardsContainer, {
            options: standards,
            placeholder: 'Select standards...',
            onSelectionChange: (selectedValues) => {
                console.log('Standards selection changed:', selectedValues);
                applyFilters();
            }
        });
    }
    
    // FIXED: Initialize topic autocomplete with predefined options
    const topicContainer = document.getElementById('topicAutocomplete');
    if (topicContainer) {
        window.topicFilter = new AutocompleteMultiSelect(topicContainer, {
            options: topics,
            placeholder: 'Select topics...',
            onSelectionChange: (selectedValues) => {
                console.log('Topic selection changed:', selectedValues);
                applyFilters();
            }
        });
    }
}

// ========================
// ENHANCED FILTER LOGIC WITH FIXED TOPIC AND STANDARDS (UPDATED)
// ========================
function applyFilters() {
    console.log('Applying filters and sorting...');
    
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    
    // Get current filter values
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const priceFilterValue = priceFilter ? priceFilter.value : '';
    
    // Get autocomplete selections
    const selectedResourceTypes = window.resourceTypeFilter ? window.resourceTypeFilter.getSelectedValues() : [];
    const selectedGrades = window.gradeLevelFilter ? window.gradeLevelFilter.getSelectedValues() : [];
    const selectedLanguages = window.languageFilter ? window.languageFilter.getSelectedValues() : [];
    const selectedStandards = window.standardsFilter ? window.standardsFilter.getSelectedValues() : [];
    const selectedTopics = window.topicFilter ? window.topicFilter.getSelectedValues() : [];

    console.log('Filter values:', {
        searchTerm,
        priceFilterValue,
        selectedResourceTypes,
        selectedGrades,
        selectedLanguages,
        selectedStandards,
        selectedTopics,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
    });

    // Filter resources using AND logic
    const filteredResources = window.allResources.filter(resource => {
        // Search filter - must match if search term exists
        if (searchTerm) {
            const productName = (resource.ProductName || '').toLowerCase();
            const description = (resource.Description || '').toLowerCase();
            const productNameMatch = productName.includes(searchTerm);
            const descriptionMatch = description.includes(searchTerm);
            
            if (!productNameMatch && !descriptionMatch) {
                return false;
            }
        }

        // Price filter - must match if price filter is set
        if (priceFilterValue) {
            const resourcePrice = resource.Price || '';
            
            if (priceFilterValue === 'Free') {
                if (resourcePrice !== 'Free') {
                    return false;
                }
            } else if (priceFilterValue === 'Paid') {
                if (resourcePrice === 'Free' || resourcePrice === '') {
                    return false;
                }
            }
        }

        // Resource type filter - must match ALL selected types
        if (selectedResourceTypes.length > 0) {
            const resourceTypes = parseCommaSeparatedValues(resource.ProductType);
            
            for (const selectedType of selectedResourceTypes) {
                if (selectedType === 'Other') {
                    // Check if resource has only non-standard types
                    const validTypes = ['Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 
                                     'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 
                                     'Online Course', 'Educational'];
                    const hasValidType = resourceTypes.some(type => validTypes.includes(type));
                    if (hasValidType) {
                        return false;
                    }
                } else {
                    // Must have this specific type
                    if (!resourceTypes.includes(selectedType)) {
                        return false;
                    }
                }
            }
        }

        // Grade level filter - must match ALL selected grades
        if (selectedGrades.length > 0) {
            const resourceGrades = parseCommaSeparatedValues(resource.GradeLevel);
            
            for (const selectedGrade of selectedGrades) {
                if (!resourceGrades.includes(selectedGrade)) {
                    return false;
                }
            }
        }

        // Language filter - must match ALL selected languages
        if (selectedLanguages.length > 0) {
            const resourceLanguages = parseCommaSeparatedValues(resource.SupportedLanguages);
            
            for (const selectedLanguage of selectedLanguages) {
                if (!resourceLanguages.includes(selectedLanguage)) {
                    return false;
                }
            }
        }

        // Replace your standards filter section with this more robust version:

// Standards filter - must match ALL selected standards
if (selectedStandards.length > 0) {
    const resourceStandards = parseCommaSeparatedValues(resource.StandardAlignment);
    
    // If no standards data, only match if "Other" is selected
    if (resourceStandards.length === 0) {
        if (!selectedStandards.includes('Other')) {
            return false;
        }
    } else {
        // Check each selected standard
        for (const selectedStandard of selectedStandards) {
            if (selectedStandard === 'Other') {
                // For "Other", check if resource has standards that are NOT in our predefined list
                const validStandardKeywords = [
                    'csta', 'iste', 'k-12 computer science framework', 'k–12 computer science framework',
                    'ngss', 'next generation science', 'ap computer science'
                ];
                
                const hasKnownStandard = resourceStandards.some(standard => 
                    validStandardKeywords.some(keyword => 
                        standard.toLowerCase().includes(keyword)
                    )
                );
                
                // If it has a known standard, it doesn't match "Other"
                if (hasKnownStandard) {
                    return false;
                }
            } else {
                // For specific standards, use more flexible matching
                const standardKeywords = {
                    'CSTA K-12 Computer Science Standards': ['csta'],
                    'ISTE Standards for Students': ['iste'],
                    'K–12 Computer Science Framework': ['k-12 computer science framework', 'k–12 computer science framework'],
                    'Next Generation Science Standards (NGSS)': ['ngss', 'next generation science'],
                    'AP Computer Science A Framework': ['ap computer science a'],
                    'AP Computer Science Principles Framework': ['ap computer science principles']
                };
                
                const keywords = standardKeywords[selectedStandard] || [selectedStandard.toLowerCase()];
                
                const hasStandard = resourceStandards.some(standard => 
                    keywords.some(keyword => 
                        standard.toLowerCase().includes(keyword)
                    )
                );
                
                if (!hasStandard) {
                    return false;
                }
            }
        }
    }
}

// Also, make sure your parseCommaSeparatedValues function handles different separators:


        // FIXED: Topic filter - must match ALL selected topics with proper AND logic
        if (selectedTopics.length > 0) {
            const resourceTopic = (resource.Topic || '').trim();
            
            for (const selectedTopic of selectedTopics) {
                if (selectedTopic === 'Other') {
                    // For "Other", check if resource has a topic that's NOT in our predefined list
                    const validTopics = [
                        'Software Engineering',
                        'Graphic/UX Design', 
                        'Cybersecurity',
                        'Data Science',
                        'Robotics',
                        'Machine Learning/AI'
                    ];
                    
                    const hasValidTopic = validTopics.some(validTopic => 
                        resourceTopic.toLowerCase().includes(validTopic.toLowerCase())
                    );
                    
                    if (hasValidTopic) {
                        return false;
                    }
                } else {
                    // Must have this specific topic (case-insensitive partial match)
                    if (!resourceTopic.toLowerCase().includes(selectedTopic.toLowerCase())) {
                        return false;
                    }
                }
            }
        }

        return true;
    });


    
    // Apply sorting to filtered resources
    const sortedResources = sortResources(filteredResources);

    console.log(`Filtered and sorted ${sortedResources.length} resources from ${window.allResources.length} total`);
    displayResources(sortedResources);
}

function parseCommaSeparatedValues(value) {
    if (!value || typeof value !== 'string') {
        return [];
    }
    
    // Try multiple separators
    let items = [];
    if (value.includes(',')) {
        items = value.split(',');
    } else if (value.includes(';')) {
        items = value.split(';');
    } else if (value.includes('|')) {
        items = value.split('|');
    } else {
        // Single value
        items = [value];
    }
    
    return items.map(item => item.trim()).filter(item => item.length > 0);
}
// ========================
// RESOURCE FILTERING FUNCTIONALITY (UPDATED)
// ========================


// ========================
// CLEAR FILTERS FUNCTION (UPDATED)
// ========================
function clearAllFilters() {
    console.log('Clearing all filters...');
    
    // Clear basic filters
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const sortSelect = document.getElementById('sortBy');
    
    if (searchInput) searchInput.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortSelect) {
        sortSelect.value = 'name-asc'; // Reset to default sort
        currentSortBy = 'name';
        currentSortOrder = 'asc';
    }
    
    // Clear autocomplete filters
    if (window.resourceTypeFilter) {
        window.resourceTypeFilter.clearSelections();
    }
    if (window.gradeLevelFilter) {
        window.gradeLevelFilter.clearSelections();
    }
    if (window.languageFilter) {
        window.languageFilter.clearSelections();
    }
    if (window.standardsFilter) {
        window.standardsFilter.clearSelections();
    }
    if (window.topicFilter) {
    window.topicFilter.clearSelections();
}
    
    // Reapply filters (should show all resources sorted by name)
    applyFilters();
}

// ========================
// HELPER FUNCTIONS
// ========================

// Helper function to parse comma-separated values consistently

// ========================
// DEBUG RESOURCE INITIALIZATION (ENHANCED)
// ========================
function initializeResourceFiltering() {
    console.log('=== DEBUGGING RESOURCE INITIALIZATION ===');
    
    const allResourceElements = document.querySelectorAll('.resource-card');
    console.log(`Found ${allResourceElements.length} resource card elements in DOM`);
    
    const allResources = [];
    const failedResources = [];
    
    // First create a map of DOM elements by their visible product names
    const domElementsMap = {};
    Array.from(allResourceElements).forEach((card, index) => {
        const productName = card.querySelector('h3')?.textContent.trim();
        if (productName) {
            domElementsMap[productName] = card;
        }
    });
    
    // Now process the server-side rendered data
    Array.from(allResourceElements).forEach((card, index) => {
        try {
            let resourceData;
            
            // Try to parse the resource data from dataset
            if (card.dataset.resource) {
                try {
                    resourceData = JSON.parse(card.dataset.resource);
                } catch (e) {
                    console.warn(`Failed to parse resource ${index} from dataset:`, e);
                    // Fallback to creating from DOM
                    const productName = card.querySelector('h3')?.textContent.trim();
                    resourceData = {
                        _id: `dom_${index}`,
                        ProductName: productName || `Resource ${index}`,
                        ProductType: card.querySelector('.resource-meta .meta-tag:nth-child(1)')?.textContent || '',
                        GradeLevel: card.querySelector('.resource-meta .meta-tag:nth-child(2)')?.textContent || '',
                        Price: card.querySelector('.price-tag')?.textContent || '',
                        Description: card.querySelector('.description')?.textContent || '',
                        SupportedLanguages: Array.from(card.querySelectorAll('.resource-meta:nth-child(4) .meta-tag')).map(tag => tag.textContent).join(', '),
                        StandardAlignment: card.querySelector('.standard-alignment')?.textContent.replace('Standards:', '').trim() || '',
                        Topic: card.querySelector('.topic-value')?.textContent || '',
                        Website: card.querySelector('.card-actions a[target="_blank"]')?.href || ''
                    };
                }
            } else {
                // Create minimal resource from DOM
                const productName = card.querySelector('h3')?.textContent.trim();
                resourceData = {
                    _id: `dom_${index}`,
                    ProductName: productName || `Resource ${index}`,
                    // Add other minimal required fields
                    ProductType: '',
                    GradeLevel: '',
                    Price: '',
                    Description: '',
                    SupportedLanguages: '',
                    StandardAlignment: '',
                    Topic: ''
                };
            }
            
            // Add rating data from DOM attributes if available
            if (card.dataset.rating) {
                resourceData.averageRating = parseFloat(card.dataset.rating);
            }
            if (card.dataset.reviewCount) {
                resourceData.reviewCount = parseInt(card.dataset.reviewCount);
            }
            
            console.log(`✓ Resource ${index} processed:`, {
                id: resourceData._id,
                name: resourceData.ProductName
            });
            
            allResources.push(resourceData);
            
        } catch (e) {
            console.error(`✗ Error processing resource card ${index}:`, e);
            failedResources.push({ index, reason: 'Processing Error', error: e });
        }
    });

    console.log(`=== RESOURCE PARSING RESULTS ===`);
    console.log(`✓ Successfully processed: ${allResources.length} resources`);
    console.log(`✗ Failed to process: ${failedResources.length} resources`);
    
    if (failedResources.length > 0) {
        console.log('Failed resources details:', failedResources);
    }

    // Store resources globally for filtering
    window.allResources = allResources;
    window.domElementsMap = domElementsMap;
    
    // Initialize event listeners for basic filters
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }

    // Display all resources initially
    console.log('Displaying initial resources...');
    displayResources(allResources);
    
    console.log('=== INITIALIZATION COMPLETE ===');
}

function displayResources(resources) {
    console.log('=== DISPLAYING RESOURCES ===');
    console.log(`Attempting to display ${resources.length} resources`);
    
    const grid = document.getElementById('resourcesGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!grid || !noResults || !resultsCount) {
        console.error('Required elements not found');
        return;
    }

    // Hide all resource cards first
    const allResourceElements = document.querySelectorAll('.resource-card');
    allResourceElements.forEach(card => {
        card.style.display = 'none';
    });

    // Show filtered resources
    let visibleCount = 0;
    
    resources.forEach((resource, index) => {
        // Try to find matching DOM element by product name
        const matchingCard = window.domElementsMap[resource.ProductName];
        
        if (matchingCard) {
            matchingCard.style.display = 'block';
            visibleCount++;
            console.log(`✓ Displayed resource ${index}: ${resource.ProductName}`);
        } else {
            console.warn(`✗ Could not find DOM element for resource: ${resource.ProductName || 'Unknown'} (ID: ${resource._id || 'none'})`);
        }
    });

    console.log(`=== DISPLAY RESULTS ===`);
    console.log(`✓ Successfully displayed: ${visibleCount} resources`);
    console.log(`✗ Could not find DOM elements for: ${resources.length - visibleCount} resources`);
    
    // Update UI
    resultsCount.textContent = `Showing ${visibleCount} resource${visibleCount !== 1 ? 's' : ''}`;
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    
    console.log('=== DISPLAY COMPLETE ===');
}

// ========================
// ENHANCED DISPLAY FUNCTION WITH DEBUGGING
// ========================

// ========================
// DEBUG HELPER FUNCTIONS
// ========================

// Function to check resource-DOM alignment
function debugResourceAlignment() {
    console.log('=== DEBUGGING RESOURCE-DOM ALIGNMENT ===');
    
    const allResourceElements = document.querySelectorAll('.resource-card');
    const domResourceIds = [];
    
    allResourceElements.forEach((card, index) => {
        try {
            const resourceData = JSON.parse(card.dataset.resource);
            domResourceIds.push(resourceData._id);
        } catch (e) {
            console.error(`Failed to parse resource ${index}:`, e);
        }
    });
    
    const memoryResourceIds = window.allResources ? window.allResources.map(r => r._id) : [];
    
    console.log('DOM Resource IDs:', domResourceIds);
    console.log('Memory Resource IDs:', memoryResourceIds);
    
    const inDOMNotMemory = domResourceIds.filter(id => !memoryResourceIds.includes(id));
    const inMemoryNotDOM = memoryResourceIds.filter(id => !domResourceIds.includes(id));
    
    console.log('In DOM but not in memory:', inDOMNotMemory);
    console.log('In memory but not in DOM:', inMemoryNotDOM);
    
    return {
        domCount: domResourceIds.length,
        memoryCount: memoryResourceIds.length,
        inDOMNotMemory,
        inMemoryNotDOM
    };
}

// Function to get current display state
function getDisplayState() {
    const allCards = document.querySelectorAll('.resource-card');
    const visibleCards = document.querySelectorAll('.resource-card[style*="display: block"], .resource-card:not([style*="display: none"])');
    
    console.log('=== CURRENT DISPLAY STATE ===');
    console.log(`Total cards: ${allCards.length}`);
    console.log(`Visible cards: ${visibleCards.length}`);
    
    return {
        totalCards: allCards.length,
        visibleCards: visibleCards.length,
        hiddenCards: allCards.length - visibleCards.length
    };
}


debugResourceAlignment()

// Check current display state
getDisplayState()

// Get full debug info
window.debugInfo

// Export debug functions to window
window.debugResourceDisplay = {
    debugResourceAlignment,
    getDisplayState,
    getDebugInfo: () => window.debugInfo
};


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================
// REST OF THE ORIGINAL CODE (UNCHANGED)
// ========================

// LOGIN MODAL FUNCTIONALITY
function initializeLoginModal() {
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.modal-close');
    const loginForm = document.getElementById('login-form');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.classList.add('active');
        });
    }

    if (closeModal && loginModal) {
        closeModal.addEventListener('click', function() {
            loginModal.classList.remove('active');
        });
    }

    if (loginModal) {
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    const ADMIN_CREDENTIALS = {
        username: "admin",
        password: "bobanafofana"
    };

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('error-message');

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                window.authState = { isAuthenticated: true };
                window.location.href = '/admin';
            } else {
                if (errorElement) {
                    errorElement.textContent = 'Invalid username or password';
                }
            }
        });
    }

    window.addEventListener('DOMContentLoaded', function () {
        if (window.authState && window.authState.isAuthenticated) {
            window.location.href = '/admin';
        }
    });
}

// AUTOCOMPLETE FILTERS INITIALIZATION


// MOBILE MENU FUNCTIONALITY
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }

    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    if (mobileMenu && mobileMenuBtn) {
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

// HEADER SCROLL EFFECTS
function initializeHeaderScrollEffects() {
    let ticking = false;

    function updateHeader() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}
// DESCRIPTION TRUNCATION - FIXED VERSION
function truncateDescription(text, maxLength = 120) {
    if (!text) {
        return text;
    }
    
    // Clean up any existing ellipses or truncation indicators, but keep the original length intent
    const cleanText = text.replace(/\s*\.{2,}\s*.*$/, '').trim();
    
    // If the original text was longer than maxLength, we should still truncate
    // even if the cleaned version is shorter
    const shouldTruncate = text.length > maxLength || cleanText.length > maxLength;
    
    if (!shouldTruncate) {
        return cleanText;
    }
    
    // If cleanText is still too long, truncate it
    if (cleanText.length > maxLength) {
        const truncated = cleanText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > 0) {
            return cleanText.substring(0, lastSpace) + ' ... <span class="read-more-link"><strong>Read More</strong></span>';
        }
        
        return truncated + ' ... <span class="read-more-link"><strong>Read More</strong></span>';
    }
    
    // If cleanText is short enough but original was long, add ellipses
    return cleanText + ' ... <span class="read-more-link"><strong>Read More</strong></span>';
}

function initializeDescriptionTruncation() {
    const descriptionElements = document.querySelectorAll('.resource-description, .description');
    
    descriptionElements.forEach(element => {
        const originalText = element.textContent || element.innerText;
        const truncatedText = truncateDescription(originalText, 120);
        
        if (truncatedText !== originalText) {
            const resourceCard = element.closest('.resource-card');
            const learnMoreLink = resourceCard ? resourceCard.querySelector('.learn-more-btn, .btn-primary, a[href*="learn"], a[href*="more"]') : null;
            
            element.innerHTML = truncatedText;
            element.setAttribute('data-full-text', originalText);
            
            if (learnMoreLink) {
                element.addEventListener('click', function(e) {
                    if (e.target.classList.contains('read-more-link')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (learnMoreLink.href) {
                            window.open(learnMoreLink.href, '_blank');
                        } else {
                            learnMoreLink.click();
                        }
                    }
                });
            }
        }
    });
}

// Alternative approach - more robust cleaning
function truncateDescriptionAdvanced(text, maxLength = 120) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    // Remove various truncation patterns that might already exist
    const cleanText = text
        .replace(/\s*\.{2,}.*$/, '')  // Remove existing ellipses and everything after
        .replace(/\s*….*$/, '')       // Remove unicode ellipsis and everything after
        .replace(/\s*\[.*?\].*$/, '') // Remove bracketed content like [Read More]
        .replace(/\s*<.*?>.*$/, '')   // Remove HTML tags and content after
        .trim();
    
    if (cleanText.length <= maxLength) {
        return cleanText;
    }
    
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPunctuation = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
    );
    
    // Try to break at punctuation first, then space
    let breakPoint = lastPunctuation > maxLength - 20 ? lastPunctuation + 1 : lastSpace;
    
    if (breakPoint > 0) {
        return cleanText.substring(0, breakPoint).trim() + ' ... <span class="read-more-link"><strong>Read More</strong></span>';
    }
    
    return truncated + ' ... <span class="read-more-link"><strong>Read More</strong></span>';
}


// AutocompleteMultiSelect class (keeping the original)
class AutocompleteMultiSelect {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options.options || [];
        this.selectedValues = new Set();
        this.filteredOptions = [];
        this.highlightedIndex = -1;
        this.isOpen = false;
        
        this.onSelectionChange = options.onSelectionChange || (() => {});
        this.placeholder = options.placeholder || 'Type to search...';
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = this.createHTML();
        this.bindEvents();
        this.updateFilteredOptions();
    }
    
    createHTML() {
        return `
            <div class="autocomplete-input-container">
                <input type="text" class="autocomplete-input" placeholder="${this.placeholder}">
            </div>
            <div class="autocomplete-dropdown" style="display: none;"></div>
        `;
    }
    
    bindEvents() {
        this.inputContainer = this.container.querySelector('.autocomplete-input-container');
        this.input = this.container.querySelector('.autocomplete-input');
        this.dropdown = this.container.querySelector('.autocomplete-dropdown');
        
        this.input.addEventListener('focus', () => this.handleFocus());
        this.input.addEventListener('blur', (e) => this.handleBlur(e));
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        this.inputContainer.addEventListener('click', () => this.input.focus());
        
        this.dropdown.addEventListener('mousedown', (e) => e.preventDefault());
        this.dropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
    }
    
    handleFocus() {
        this.inputContainer.classList.add('focused');
        this.openDropdown();
    }
    
    handleBlur(e) {
        setTimeout(() => {
            this.inputContainer.classList.remove('focused');
            this.closeDropdown();
        }, 150);
    }
    
    handleInput(e) {
        const query = e.target.value.toLowerCase();
        this.updateFilteredOptions(query);
        this.renderDropdown();
        this.highlightedIndex = -1;
    }
    
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightNext();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightPrevious();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0) {
                    this.selectOption(this.filteredOptions[this.highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                this.input.blur();
                break;
            case 'Backspace':
                if (this.input.value === '' && this.selectedValues.size > 0) {
                    const lastValue = Array.from(this.selectedValues).pop();
                    this.removeSelection(lastValue);
                }
                break;
        }
    }
    
    handleDropdownClick(e) {
        const option = e.target.closest('.autocomplete-option');
        if (option) {
            const value = option.dataset.value;
            this.selectOption(value);
        }
    }
    
    updateFilteredOptions(query = '') {
        this.filteredOptions = this.options.filter(option => 
            option.toLowerCase().includes(query) && !this.selectedValues.has(option)
        );
    }
    
    openDropdown() {
        this.isOpen = true;
        this.dropdown.style.display = 'block';
        this.renderDropdown();
    }
    
    closeDropdown() {
        this.isOpen = false;
        this.dropdown.style.display = 'none';
        this.highlightedIndex = -1;
    }
    
    renderDropdown() {
        if (this.filteredOptions.length === 0) {
            this.dropdown.innerHTML = '<div class="autocomplete-no-results">No options found</div>';
            return;
        }
        
        this.dropdown.innerHTML = this.filteredOptions.map((option, index) => `
            <div class="autocomplete-option ${index === this.highlightedIndex ? 'highlighted' : ''}" 
                 data-value="${option}">
                ${option}
            </div>
        `).join('');
    }
    
    highlightNext() {
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1);
        this.updateHighlight();
    }
    
    highlightPrevious() {
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        this.updateHighlight();
    }
    
    updateHighlight() {
        const options = this.dropdown.querySelectorAll('.autocomplete-option');
        options.forEach((option, index) => {
            option.classList.toggle('highlighted', index === this.highlightedIndex);
        });
        
        if (this.highlightedIndex >= 0) {
            options[this.highlightedIndex].scrollIntoView({ 
                block: 'nearest', 
                behavior: 'smooth' 
            });
        }
    }
    
    selectOption(value) {
        if (this.selectedValues.has(value)) return;
        
        this.selectedValues.add(value);
        this.input.value = '';
        this.updateFilteredOptions();
        this.renderChips();
        this.renderDropdown();
        this.onSelectionChange(Array.from(this.selectedValues));
    }
    
    removeSelection(value) {
        this.selectedValues.delete(value);
        this.updateFilteredOptions(this.input.value.toLowerCase());
        this.renderChips();
        this.renderDropdown();
        this.onSelectionChange(Array.from(this.selectedValues));
    }
    
    renderChips() {
        const existingChips = this.inputContainer.querySelectorAll('.autocomplete-chip');
        existingChips.forEach(chip => chip.remove());
        
        Array.from(this.selectedValues).forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'autocomplete-chip';
            chip.innerHTML = `
                ${value}
                <button type="button" class="autocomplete-chip-remove" data-value="${value}">×</button>
            `;
            
            chip.querySelector('.autocomplete-chip-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSelection(value);
            });
            
            this.inputContainer.insertBefore(chip, this.input);
        });
    }
    
    getSelectedValues() {
        return Array.from(this.selectedValues);
    }
    
    setSelectedValues(values) {
        this.selectedValues = new Set(values);
        this.renderChips();
        this.updateFilteredOptions(this.input.value.toLowerCase());
        this.renderDropdown();
    }
    
    clearSelections() {
        this.selectedValues.clear();
        this.renderChips();
        this.updateFilteredOptions(this.input.value.toLowerCase());
        this.renderDropdown();
        this.onSelectionChange([]);
    }
}


// Add this to your existing library.js file
// Enhanced function to convert text to proper title case with special handling for acronyms


// Enhanced function to properly parse and separate comma-separated values
function parseCommaSeparatedValues(value) {
    if (!value || typeof value !== 'string') {
        return [];
    }
    
    // Try multiple separators
    let items = [];
    if (value.includes(',')) {
        items = value.split(',');
    } else if (value.includes(';')) {
        items = value.split(';');
    } else if (value.includes('|')) {
        items = value.split('|');
    } else {
        // Single value
        items = [value];
    }
    
    return items.map(item => item.trim()).filter(item => item.length > 0);
}

// Enhanced function to rebuild resource cards with properly separated tags


// Enhanced function to apply colors to existing tags with proper separation
// Enhanced function to convert text to proper title case with special handling for acronyms
function toCamelCase(text) {
    if (!text) return '';
   
    // Handle special cases that should remain as-is or have specific capitalization
    const specialCases = {
        'html/css': 'HTML/CSS',
        'c++': 'C++',
        'c#': 'C#',
        'k-5': 'K-5',
        '6-8': '6-8',
        '9-12': '9-12',
        'ai skills': 'AI Skills',
        'higher ed': 'Higher Ed',
        'shell/bash': 'Shell/Bash',
        'powershell': 'PowerShell',
        'javascript': 'JavaScript',
        'block-based': 'Block-Based',
        'n/a': 'N/A',
        'python': 'Python',
        'java': 'Java',
        'scratch': 'Scratch',
        'swift': 'Swift',
        'ruby': 'Ruby',
        'assembly': 'Assembly',
        'unplugged': 'Unplugged',
        'free': 'Free',
        'paid': 'Paid',
        // Topic-specific cases - Enhanced AI/UX handling
        'graphic/ux design': 'Graphic/UX Design',
        'ux design': 'UX Design',
        'ui design': 'UI Design',
        'machine learning/ai': 'Machine Learning/AI',
        'artificial intelligence': 'Artificial Intelligence',
        'ai': 'AI',
        'ux': 'UX',
        'ui': 'UI',
        'data science': 'Data Science',
        'software engineering': 'Software Engineering',
        'cybersecurity': 'Cybersecurity',
        'robotics': 'Robotics',
        // Additional micro:bit specific cases
        'micro:bit': 'micro:bit',
        'microbit': 'micro:bit'
    };
   
    const lowerText = text.toLowerCase().trim();
    if (specialCases[lowerText]) {
        return specialCases[lowerText];
    }
   
    // Apply title case first
    let result = text.split(/\s+/).map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    // Then handle AI/UX patterns with word boundaries to avoid partial matches
    result = result.replace(/\bai\b/gi, 'AI');
    result = result.replace(/\bux\b/gi, 'UX');
    result = result.replace(/\bui\b/gi, 'UI');
    result = result.replace(/\bmicro:bit\b/gi, 'micro:bit');
    result = result.replace(/\bmicrobit\b/gi, 'micro:bit');
   
    // Handle slash-separated combinations
    result = result.replace(/\bai\//gi, 'AI/');
    result = result.replace(/\/ai\b/gi, '/AI');
    result = result.replace(/\bux\//gi, 'UX/');
    result = result.replace(/\/ux\b/gi, '/UX');
    result = result.replace(/\bui\//gi, 'UI/');
    result = result.replace(/\/ui\b/gi, '/UI');
   
    return result;
}

// Enhanced function to handle topic display with better AI/UX capitalization
function rebuildResourceCardTags() {
    const resourceCards = document.querySelectorAll('.resource-card');
   
    resourceCards.forEach(card => {
        try {
            let resourceData;
            
            // Try to parse the resource data
            try {
                resourceData = JSON.parse(card.dataset.resource);
            } catch (e) {
                // If parsing fails, create a minimal resource object from the visible DOM
                resourceData = {
                    ProductName: card.querySelector('h3')?.textContent || 'Unknown Resource',
                    ProductType: card.querySelector('.resource-meta .meta-tag:nth-child(1)')?.textContent || '',
                    GradeLevel: card.querySelector('.resource-meta .meta-tag:nth-child(2)')?.textContent || '',
                    Price: card.querySelector('.price-tag')?.textContent || '',
                    SupportedLanguages: Array.from(card.querySelectorAll('.resource-meta:nth-child(4) .meta-tag')).map(tag => tag.textContent).join(', '),
                    Topic: card.querySelector('.topic-value')?.textContent || ''
                };
            }
           
            // Rest of the function remains the same...
            const metaContainers = card.querySelectorAll('.resource-meta');
           
            // Clear existing meta tags but keep the structure
            metaContainers.forEach(container => {
                const tags = container.querySelectorAll('.meta-tag');
                tags.forEach(tag => tag.remove());
            });
           
            // Get the first meta container for main tags
            const mainMetaContainer = metaContainers[0];
            if (mainMetaContainer) {
                // Add resource type tags - SEPARATE EACH TYPE
                if (resourceData.ProductType) {
                    const resourceTypes = parseCommaSeparatedValues(resourceData.ProductType);
                    resourceTypes.forEach(type => {
                        const typeTag = createColoredTag(type, 'resourceType');
                        mainMetaContainer.appendChild(typeTag);
                    });
                }
               
                // Add grade level tags - SEPARATE EACH GRADE LEVEL
                if (resourceData.GradeLevel) {
                    const gradeLevels = parseCommaSeparatedValues(resourceData.GradeLevel);
                    gradeLevels.forEach(grade => {
                        const gradeTag = createColoredTag(grade, 'gradeLevel');
                        mainMetaContainer.appendChild(gradeTag);
                    });
                }
               
                // Find and update price tag
                const priceTag = card.querySelector('.price-tag');
                if (priceTag) {
                    priceTag.style.backgroundColor = TAG_COLORS.cost;
                    priceTag.style.color = '#ffffff';
                    priceTag.textContent = toCamelCase(priceTag.textContent);
                }
            }
           
            // Handle language tags in second meta container - SEPARATE EACH LANGUAGE
            const languageContainer = metaContainers[1];
            if (languageContainer && resourceData.SupportedLanguages) {
                const languages = parseCommaSeparatedValues(resourceData.SupportedLanguages);
                languages.forEach(lang => {
                    const langTag = createColoredTag(lang.trim(), 'language');
                    languageContainer.appendChild(langTag);
                });
            }
           
            // Handle topic display
            const topicValues = card.querySelectorAll('.topic-value');
            topicValues.forEach(topicValue => {
                const topicText = resourceData.Topic || topicValue.textContent.trim();
                const displayText = (topicText && topicText !== '') ? toCamelCase(topicText) : 'N/A';
               
                const topicSpan = document.createElement('span');
                topicSpan.textContent = displayText;
                topicSpan.style.backgroundColor = TAG_COLORS.topic;
                topicSpan.style.color = '#ffffff';
                topicSpan.style.padding = '8px 16px';
                topicSpan.style.borderRadius = '20px';
                topicSpan.style.fontSize = '14px';
                topicSpan.style.fontWeight = '600';
                topicSpan.style.display = 'inline-flex';
                topicSpan.style.alignItems = 'center';
                topicSpan.style.justifyContent = 'center';
                topicSpan.style.textAlign = 'center';
                topicSpan.style.lineHeight = '1';
                topicSpan.style.minHeight = '32px';
               
                topicValue.innerHTML = '';
                topicValue.appendChild(topicSpan);
            });
           
        } catch (error) {
            console.error('Error processing resource card:', error);
        }
    });
}

// Enhanced function to apply colors to existing tags with proper AI/UX capitalization
function applyTagColors() {
    // Color meta tags in resource cards
    const metaTags = document.querySelectorAll('.resource-card .meta-tag');
    metaTags.forEach(tag => {
        const tagText = tag.textContent.trim();
        const color = getTagColor(tagText);
        tag.style.backgroundColor = color;
        tag.style.color = '#ffffff';
        tag.style.display = 'inline-flex';
        tag.style.alignItems = 'center';
        tag.style.justifyContent = 'center';
        tag.style.textAlign = 'center';
        tag.style.lineHeight = '1';
        tag.style.minHeight = '32px';
        tag.style.padding = '8px 16px';
        tag.style.borderRadius = '20px';
        tag.style.margin = '3px 6px 3px 0';
       
        // Format the text for better readability with proper camel casing
        tag.textContent = toCamelCase(tagText);
    });
   
    // Color price tags specifically
    const priceTags = document.querySelectorAll('.resource-card .price-tag');
    priceTags.forEach(tag => {
        tag.style.backgroundColor = TAG_COLORS.cost;
        tag.style.color = '#ffffff';
        tag.style.display = 'inline-flex';
        tag.style.alignItems = 'center';
        tag.style.justifyContent = 'center';
        tag.style.textAlign = 'center';
        tag.style.lineHeight = '1';
        tag.style.minHeight = '32px';
        tag.style.padding = '8px 16px';
        tag.style.borderRadius = '20px';
        tag.textContent = toCamelCase(tag.textContent);
    });
   
    // Fix topic display - ENHANCED FOR AI/UX
    const topicValues = document.querySelectorAll('.resource-card .topic-value');
    topicValues.forEach(topicValue => {
        const topicText = topicValue.textContent.trim();
       
        // Use "N/A" if no topic is provided, otherwise apply proper capitalization
        const displayText = (topicText && topicText !== '') ? toCamelCase(topicText) : 'N/A';
       
        // Create a styled span for the topic
        const topicSpan = document.createElement('span');
        topicSpan.textContent = displayText;
        topicSpan.style.backgroundColor = TAG_COLORS.topic;
        topicSpan.style.color = '#ffffff';
        topicSpan.style.padding = '8px 16px';
        topicSpan.style.borderRadius = '20px';
        topicSpan.style.fontSize = '14px';
        topicSpan.style.fontWeight = '600';
        topicSpan.style.display = 'inline-flex';
        topicSpan.style.alignItems = 'center';
        topicSpan.style.justifyContent = 'center';
        topicSpan.style.textAlign = 'center';
        topicSpan.style.lineHeight = '1';
        topicSpan.style.minHeight = '32px';
       
        // Replace the content
        topicValue.innerHTML = '';
        topicValue.appendChild(topicSpan);
    });
}
// Test the function to verify it works correctly
console.log('Testing AI/UX capitalization:');
console.log('ai ->', toCamelCase('ai')); // Should output: AI
console.log('ux ->', toCamelCase('ux')); // Should output: UX
console.log('machine learning/ai ->', toCamelCase('machine learning/ai')); // Should output: Machine Learning/AI
console.log('graphic/ux design ->', toCamelCase('graphic/ux design')); // Should output: Graphic/UX Design
console.log('data science ->', toCamelCase('data science')); // Should output: Data Science
console.log('software engineering ->', toCamelCase('software engineering')); // Should output: Software Engineering
// Enhanced CSS to ensure proper tag separation and spacing


function parseCommaSeparatedValues(text) {
    if (!text) return [];
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

// Tag color configuration
const TAG_COLORS = {
    resourceType: '#2c2c2c',    // Black
    gradeLevel: '#3b82f6',      // Blue
    cost: '#10b981',            // Green
    language: '#f59e0b',        // Orange
    standards: '#8b5cf6',       // Purple
    topic: '#ef4444'            // Red
};

// Category definitions
const RESOURCE_TYPES = [
    'Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity',
    'Lesson Plans', 'Professional Development', 'Hardware/Robotics',
    'Online Course', 'Educational', 'Other'
];

const GRADE_LEVELS = ['K-5', '6-8', '9-12', 'Higher Ed'];
const COST_OPTIONS = ['Free', 'Paid'];

const LANGUAGES = [
    'Scratch', 'Python', 'JavaScript', 'Java', 'Block-Based', 'HTML/CSS',
    'C++', 'C#', 'Swift', 'Ruby', 'Go', 'SQL', 'R', 'Shell/Bash',
    'PowerShell', 'Assembly', 'C', 'Unplugged', 'AI Skills'
];

const STANDARDS = [
    'CSTA', 'Common Core', 'NGSS', 'State Standards', 'AP CS A', 'AP CS Principles'
];

// Enhanced function to determine tag color based on content


// Enhanced function to create colored tag element
// Enhanced function to determine tag color based on content
function getTagColor(tagText) {
    const normalizedText = tagText.toLowerCase().trim();
    
    // Check resource types
    if (RESOURCE_TYPES.some(type => type.toLowerCase() === normalizedText)) {
        return TAG_COLORS.resourceType;
    }
    
    // Enhanced grade level checking - handle multiple grades
    if (GRADE_LEVELS.some(grade => normalizedText.includes(grade.toLowerCase())) || 
        normalizedText.match(/^[k\d\-\s,]+$/)) { // Matches patterns like "K-5, 6-8" or "K-5"
        return TAG_COLORS.gradeLevel;
    }
    
    // Check cost options
    if (COST_OPTIONS.some(cost => cost.toLowerCase() === normalizedText)) {
        return TAG_COLORS.cost;
    }
    
    // Check languages
    if (LANGUAGES.some(lang => lang.toLowerCase() === normalizedText)) {
        return TAG_COLORS.language;
    }
    
    // Check standards
    if (STANDARDS.some(standard => standard.toLowerCase().includes(normalizedText) || 
                     normalizedText.includes(standard.toLowerCase()))) {
        return TAG_COLORS.standards;
    }
    
    // Default to resource type color
    return TAG_COLORS.resourceType;
}

// Enhanced function to determine tag type based on context
function getTagType(tagText, context = '') {
    const normalizedText = tagText.toLowerCase().trim();
    const normalizedContext = context.toLowerCase();
    
    // Check by context first
    if (normalizedContext.includes('grade') || normalizedContext.includes('level')) {
        return 'gradeLevel';
    }
    if (normalizedContext.includes('price') || normalizedContext.includes('cost')) {
        return 'cost';
    }
    if (normalizedContext.includes('language') || normalizedContext.includes('tool')) {
        return 'language';
    }
    if (normalizedContext.includes('standard') || normalizedContext.includes('alignment')) {
        return 'standards';
    }
    if (normalizedContext.includes('topic')) {
        return 'topic';
    }
    
    // Enhanced grade level checking - handle multiple grades
    if (GRADE_LEVELS.some(grade => normalizedText.includes(grade.toLowerCase())) || 
        normalizedText.match(/^[k\d\-\s,]+$/)) {
        return 'gradeLevel';
    }
    
    // Then check by content
    if (COST_OPTIONS.some(cost => cost.toLowerCase() === normalizedText)) {
        return 'cost';
    }
    if (LANGUAGES.some(lang => lang.toLowerCase() === normalizedText)) {
        return 'language';
    }
    if (STANDARDS.some(standard => standard.toLowerCase().includes(normalizedText) || 
                     normalizedText.includes(standard.toLowerCase()))) {
        return 'standards';
    }
    if (RESOURCE_TYPES.some(type => type.toLowerCase() === normalizedText)) {
        return 'resourceType';
    }
    
    // Default
    return 'resourceType';
}

// Enhanced CSS with smaller font size
function addTagColorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Make cards much bigger */
        .resource-card {
            min-width: 500px !important;
            max-width: 600px !important;
            width: 100% !important;
            min-height: 350px !important;
            padding: 24px !important;
        }
       
        /* Ensure proper spacing for meta containers */
        .resource-meta {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            margin: 10px 0 !important;
            align-items: center !important;
        }
       
        /* SMALLER tag bubbles with smaller font */
        .colored-tag {
            transition: all 0.2s ease;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 28px !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
            font-size: 8px !important;
            font-weight: 600 !important;
            margin: 3px 6px 3px 0 !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
        }
       
        .colored-tag:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
       
        .resource-card .meta-tag {
            margin: 3px 6px 3px 0 !important;
            font-size: 8px !important;
            font-weight: 600 !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 28px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
       
        .resource-card .price-tag {
            background-color: ${TAG_COLORS.cost} !important;
            color: #ffffff !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 28px !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
            font-size: 8px !important;
            font-weight: 600 !important;
            margin: 3px 6px 3px 0 !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
       
        .topic-value span {
            background-color: ${TAG_COLORS.topic} !important;
            color: #ffffff !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 28px !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
            font-size: 8px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
       
        .product-topic {
            margin: 10px 0;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }
       
        .topic-label {
            font-weight: 600;
            color: #374151;
            flex-shrink: 0;
            font-size: 14px;
        }
       
        .topic-value {
            display: inline-flex;
            align-items: center;
        }
       
        .standard-alignment {
            margin: 10px 0;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }
       
        .standard-alignment strong {
            font-weight: 600;
            color: #374151;
            flex-shrink: 0;
            font-size: 14px;
            margin-right: 8px;
        }
       
        /* BOLD "Read More" link with better styling */
        .read-more-link {
            color: #3b82f6 !important;
            font-weight: 700 !important;
            font-size: 14px !important;
            text-decoration: underline !important;
            cursor: pointer !important;
            display: inline-block !important;
            margin-left: 6px !important;
        }
        
        .read-more-link:hover {
            color: #2563eb !important;
            text-decoration: none !important;
        }
        
        .read-more-link strong {
            font-weight: 700 !important;
        }
       
        /* Ensure cards grid adapts to bigger cards */
        .resources-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)) !important;
            gap: 30px !important;
            padding: 30px 0;
        }
       
        /* Prevent text overflow in tags but allow for appropriate text */
        .resource-card .meta-tag,
        .resource-card .price-tag,
        .colored-tag {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
       
        /* Responsive adjustments */
        @media (max-width: 1200px) {
            .resource-card {
                min-width: 450px !important;
                max-width: 550px !important;
            }
           
            .resources-grid {
                grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)) !important;
            }
        }
       
        @media (max-width: 768px) {
            .resource-card {
                min-width: 280px !important;
                max-width: 100% !important;
                min-height: 300px !important;
                padding: 16px !important;
            }
           
            .resources-grid {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
                padding: 16px 0;
            }
            
            /* Much smaller tags on mobile */
            .resource-card .meta-tag,
            .resource-card .price-tag,
            .colored-tag {
                max-width: 100px !important;
                font-size: 7px !important;
                padding: 3px 8px !important;
                min-height: 24px !important;
                margin: 2px 4px 2px 0 !important;
                border-radius: 12px !important;
            }
            
            .topic-value span {
                font-size: 7px !important;
                padding: 3px 8px !important;
                min-height: 24px !important;
                max-width: 100px !important;
                border-radius: 12px !important;
            }
            
            .topic-label {
                font-size: 12px !important;
            }
            
            .product-topic {
                gap: 4px !important;
            }
        }
        
        @media (max-width: 480px) {
            .resource-card {
                min-width: 250px !important;
                padding: 12px !important;
            }
            
            /* Even smaller tags for very small screens */
            .resource-card .meta-tag,
            .resource-card .price-tag,
            .colored-tag {
                max-width: 80px !important;
                font-size: 6px !important;
                padding: 2px 6px !important;
                min-height: 20px !important;
                margin: 1px 3px 1px 0 !important;
                border-radius: 10px !important;
            }
            
            .topic-value span {
                font-size: 6px !important;
                padding: 2px 6px !important;
                min-height: 20px !important;
                max-width: 80px !important;
                border-radius: 10px !important;
            }
        }
    `;
   
    document.head.appendChild(style);
}

// Enhanced function to create colored tag element
function createColoredTag(text, type = null, context = '') {
    const tag = document.createElement('span');
    tag.className = 'meta-tag colored-tag';
    
    // Determine tag type if not provided
    const tagType = type || getTagType(text, context);
    const formattedText = toCamelCase(text);
    
    tag.textContent = formattedText;
    tag.style.backgroundColor = TAG_COLORS[tagType] || TAG_COLORS.resourceType;
    tag.style.color = '#ffffff';
    tag.style.padding = '4px 10px';
    tag.style.borderRadius = '14px';
    tag.style.fontSize = '8px';
    tag.style.fontWeight = '600';
    tag.style.margin = '3px 6px 3px 0';
    tag.style.display = 'inline-flex';
    tag.style.alignItems = 'center';
    tag.style.justifyContent = 'center';
    tag.style.textAlign = 'center';
    tag.style.lineHeight = '1.2';
    tag.style.minHeight = '28px';
    tag.style.whiteSpace = 'nowrap';
    tag.style.flexShrink = '0';
    tag.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    return tag;
} 

// Enhanced function to rebuild resource cards with proper color coding
function rebuildResourceCardTags() {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        // Get the resource data
        const resourceData = JSON.parse(card.getAttribute('data-resource') || '{}');
        
        // Find existing meta containers or create them
        let metaContainers = card.querySelectorAll('.resource-meta');
        
        // Clear existing meta tags but keep structure
        metaContainers.forEach(container => {
            container.innerHTML = '';
        });
        
        // If no meta containers exist, create them
        if (metaContainers.length === 0) {
            const metaContainer = document.createElement('div');
            metaContainer.className = 'resource-meta';
            
            // Insert after description or topic
            const description = card.querySelector('.description');
            const topic = card.querySelector('.product-topic');
            const insertAfter = topic || description;
            
            if (insertAfter) {
                insertAfter.parentNode.insertBefore(metaContainer, insertAfter.nextSibling);
            } else {
                card.appendChild(metaContainer);
            }
            
            metaContainers = [metaContainer];
        }
        
        const mainMetaContainer = metaContainers[0];
        
        // Add main tags (Type, Grade, Price)
        if (resourceData.ProductType) {
            const typeTag = createColoredTag(resourceData.ProductType, 'resourceType', 'type');
            mainMetaContainer.appendChild(typeTag);
        }
        
        if (resourceData.GradeLevel) {
            const gradeTag = createColoredTag(resourceData.GradeLevel, 'gradeLevel', 'grade');
            mainMetaContainer.appendChild(gradeTag);
        }
        
        if (resourceData.Price) {
            const priceTag = createColoredTag(resourceData.Price, 'cost', 'price');
            mainMetaContainer.appendChild(priceTag);
        }
        
        // Add language tags in a separate container if they exist
        if (resourceData.SupportedLanguages) {
            let languageContainer = metaContainers[1];
            if (!languageContainer) {
                languageContainer = document.createElement('div');
                languageContainer.className = 'resource-meta';
                mainMetaContainer.parentNode.insertBefore(languageContainer, mainMetaContainer.nextSibling);
            }
            
            const languages = parseCommaSeparatedValues(resourceData.SupportedLanguages);
            languages.forEach(lang => {
                const langTag = createColoredTag(lang, 'language', 'language');
                languageContainer.appendChild(langTag);
            });
        }
        
        // Add standards tags if they exist
        if (resourceData.StandardAlignment) {
            let standardsContainer = document.querySelector('.standard-alignment');
            if (!standardsContainer) {
                standardsContainer = document.createElement('div');
                standardsContainer.className = 'standard-alignment';
                card.appendChild(standardsContainer);
            }
            
            // Clear existing content
            standardsContainer.innerHTML = '<strong>Standards:</strong> ';
            
            const standards = parseCommaSeparatedValues(resourceData.StandardAlignment);
            standards.forEach(standard => {
                const standardTag = createColoredTag(standard, 'standards', 'standard');
                standardsContainer.appendChild(standardTag);
            });
        }
    });
}

// Enhanced function to apply colors to existing tags with proper AI/UX capitalization
function applyTagColors() {
    // Color meta tags in resource cards
    const metaTags = document.querySelectorAll('.resource-card .meta-tag');
    metaTags.forEach(tag => {
        const tagText = tag.textContent.trim();
        const color = getTagColor(tagText);
        tag.style.backgroundColor = color;
        tag.style.color = '#ffffff';
        tag.style.display = 'inline-flex';
        tag.style.alignItems = 'center';
        tag.style.justifyContent = 'center';
        tag.style.textAlign = 'center';
        tag.style.lineHeight = '1.2';
        tag.style.minHeight = '32px';
        tag.style.padding = '6px 12px';
        tag.style.borderRadius = '16px';
        tag.style.fontSize = '10px';
        tag.style.fontWeight = '600';
        tag.style.margin = '3px 6px 3px 0';
        tag.style.whiteSpace = 'nowrap';
        tag.style.flexShrink = '0';
        tag.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
       
        // Format the text for better readability with proper camel casing
        tag.textContent = toCamelCase(tagText);
    });
   
    // Color price tags specifically
    const priceTags = document.querySelectorAll('.resource-card .price-tag');
    priceTags.forEach(tag => {
        tag.style.backgroundColor = TAG_COLORS.cost;
        tag.style.color = '#ffffff';
        tag.style.display = 'inline-flex';
        tag.style.alignItems = 'center';
        tag.style.justifyContent = 'center';
        tag.style.textAlign = 'center';
        tag.style.lineHeight = '1.2';
        tag.style.minHeight = '32px';
        tag.style.padding = '6px 12px';
        tag.style.borderRadius = '16px';
        tag.style.fontSize = '10px';
        tag.style.fontWeight = '600';
        tag.style.margin = '3px 6px 3px 0';
        tag.style.whiteSpace = 'nowrap';
        tag.style.flexShrink = '0';
        tag.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        tag.textContent = toCamelCase(tag.textContent);
    });
   
    // Fix topic display - ENHANCED FOR AI/UX
    const topicValues = document.querySelectorAll('.resource-card .topic-value');
    topicValues.forEach(topicValue => {
        const topicText = topicValue.textContent.trim();
       
        // Use "N/A" if no topic is provided, otherwise apply proper capitalization
        const displayText = (topicText && topicText !== '') ? toCamelCase(topicText) : 'N/A';
       
        // Create a styled span for the topic
        const topicSpan = document.createElement('span');
        topicSpan.textContent = displayText;
        topicSpan.style.backgroundColor = TAG_COLORS.topic;
        topicSpan.style.color = '#ffffff';
        topicSpan.style.padding = '6px 12px';
        topicSpan.style.borderRadius = '16px';
        topicSpan.style.fontSize = '10px';
        topicSpan.style.fontWeight = '600';
        topicSpan.style.display = 'inline-flex';
        topicSpan.style.alignItems = 'center';
        topicSpan.style.justifyContent = 'center';
        topicSpan.style.textAlign = 'center';
        topicSpan.style.lineHeight = '1.2';
        topicSpan.style.minHeight = '32px';
        topicSpan.style.whiteSpace = 'nowrap';
        topicSpan.style.flexShrink = '0';
        topicSpan.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
       
        // Replace the content
        topicValue.innerHTML = '';
        topicValue.appendChild(topicSpan);
    });
}

// Enhanced CSS to ensure proper tag separation and spacing with SMALLER tags


// Function to initialize tag colors
function initializeTagColors() {
    applyTagColors();
    rebuildResourceCardTags();
}

// Override the displayResources function to apply colors after filtering
const originalDisplayResources = window.displayResources;
if (originalDisplayResources) {
    window.displayResources = function(resources) {
        // Call original function
        originalDisplayResources.call(this, resources);
       
        // Apply colors to newly displayed resources
        setTimeout(() => {
            applyTagColors();
            rebuildResourceCardTags();
        }, 0);
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addTagColorStyles();
    setTimeout(() => {
        initializeTagColors();
    }, 100);
});

// Export functions for use in other parts of the application
window.tagColorUtils = {
    applyTagColors,
    createColoredTag,
    getTagColor,
    getTagType,
    initializeTagColors,
    rebuildResourceCardTags,
    toCamelCase,
    parseCommaSeparatedValues,
    TAG_COLORS
};

// Test the function to verify it works correctly
console.log('Testing AI/UX capitalization:');
console.log('ai ->', toCamelCase('ai')); // Should output: AI
console.log('ux ->', toCamelCase('ux')); // Should output: UX
console.log('machine learning/ai ->', toCamelCase('machine learning/ai')); // Should output: Machine Learning/AI
console.log('graphic/ux design ->', toCamelCase('graphic/ux design')); // Should output: Graphic/UX Design
console.log('data science ->', toCamelCase('data science')); // Should output: Data Science
console.log('software engineering ->', toCamelCase('software engineering')); // Should output: Software Engineering