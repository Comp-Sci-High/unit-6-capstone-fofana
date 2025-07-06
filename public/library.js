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
                // Get rating from the resource data - check multiple possible locations
                aValue = parseFloat(a.ratingData?.averageRating || a.averageRating || a.Rating || 0);
                bValue = parseFloat(b.ratingData?.averageRating || b.averageRating || b.Rating || 0);
                
                // If we still don't have rating data, try to get it from the DOM
                if (aValue === 0 && bValue === 0) {
                    const aCard = document.querySelector(`[data-resource*='"_id":"${a._id}"']`);
                    const bCard = document.querySelector(`[data-resource*='"_id":"${b._id}"']`);
                    
                    if (aCard) aValue = parseFloat(aCard.dataset.rating) || 0;
                    if (bCard) bValue = parseFloat(bCard.dataset.rating) || 0;
                }
                break;
            case 'price':
                // Handle price sorting - Free comes first, then numeric values
                aValue = a.Price === 'Free' ? 0 : parseFloat(a.Price?.replace(/[^0-9.-]+/g, '')) || 999999;
                bValue = b.Price === 'Free' ? 0 : parseFloat(b.Price?.replace(/[^0-9.-]+/g, '')) || 999999;
                break;
            default:
                aValue = (a.ProductName || '').toLowerCase();
                bValue = (b.ProductName || '').toLowerCase();
        }
        
        // Handle comparison based on sort order
        if (sortBy === 'rating') {
            // For rating, handle the comparison properly
            if (sortOrder === 'desc') {
                return bValue - aValue; // Higher ratings first
            } else {
                return aValue - bValue; // Lower ratings first
            }
        } else {
            // For text and price sorting
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        }
    });
    
    return sorted;
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
function initializeResourceFiltering() {
    const allResourceElements = document.querySelectorAll('.resource-card');
    const allResources = Array.from(allResourceElements).map(card => {
        try {
            const resourceData = JSON.parse(card.dataset.resource);
            
            // Add rating data from DOM attributes if available
            if (card.dataset.rating) {
                resourceData.averageRating = parseFloat(card.dataset.rating);
            }
            if (card.dataset.reviewCount) {
                resourceData.reviewCount = parseInt(card.dataset.reviewCount);
            }
            
            return resourceData;
        } catch (e) {
            console.error('Error parsing resource data:', e);
            return null;
        }
    }).filter(resource => resource !== null);

    console.log('Initialized with', allResources.length, 'resources');

    // Sort resources by name initially (default sort)
    const sortedResources = sortResources(allResources);
    
    // Store sorted resources globally for filtering
    window.allResources = sortedResources;
    
    // Make filter functions available globally
    window.applyFilters = applyFilters;
    window.clearAllFilters = clearAllFilters;

    // Initialize event listeners for basic filters
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }

    // Display sorted resources initially
    displayResources(sortedResources);
}

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


function displayResources(resources) {
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

    // Show filtered resources in the correct order
    let visibleCount = 0;
    const gridContainer = grid;
    
    // Clear the grid and re-append cards in sorted order
    resources.forEach(resource => {
        const matchingCard = Array.from(allResourceElements).find(card => {
            try {
                const cardData = JSON.parse(card.dataset.resource);
                return cardData._id === resource._id;
            } catch (e) {
                return false;
            }
        });
        
        if (matchingCard) {
            matchingCard.style.display = 'block';
            // Re-append to maintain sort order
            gridContainer.appendChild(matchingCard);
            visibleCount++;
        }
    });

    // Update UI
    resultsCount.textContent = `Showing ${visibleCount} resource${visibleCount !== 1 ? 's' : ''}`;

    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
    
    // Reinitialize description truncation for visible cards
    initializeDescriptionTruncation();
}

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
        return cleanText.substring(0, breakPoint).trim() + ' ...<span class="read-more-link"><strong>Read More</strong></span>';
    }
    
    return truncated + ' ...<span class="read-more-link"><strong>Read More</strong></span>';
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
            const resourceData = JSON.parse(card.dataset.resource);
           
            // Find existing meta containers
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
           
            // Handle topic display with proper capitalization and N/A fallback - ENHANCED FOR AI/UX
            const topicValues = card.querySelectorAll('.topic-value');
            topicValues.forEach(topicValue => {
                const topicText = resourceData.Topic || topicValue.textContent.trim();
               
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


// The rest of your existing code remains the same...
const TAG_COLORS = {
    resourceType: '#2c2c2c',    // Black
    gradeLevel: '#3b82f6',      // Blue
    cost: '#10b981',            // Green
    language: '#f59e0b',        // Orange
    standards: '#8b5cf6',       // Purple
    topic: '#ef4444'            // Red
};

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

function getTagColor(tagText) {
    const normalizedText = tagText.toLowerCase();
   
    if (RESOURCE_TYPES.some(type => type.toLowerCase() === normalizedText)) {
        return TAG_COLORS.resourceType;
    }
   
    if (GRADE_LEVELS.some(grade => grade.toLowerCase() === normalizedText)) {
        return TAG_COLORS.gradeLevel;
    }
   
    if (COST_OPTIONS.some(cost => cost.toLowerCase() === normalizedText)) {
        return TAG_COLORS.cost;
    }
   
    if (LANGUAGES.some(lang => lang.toLowerCase() === normalizedText)) {
        return TAG_COLORS.language;
    }
   
    return TAG_COLORS.resourceType;
}


function initializeTagColors() {
    applyTagColors();
    rebuildResourceCardTags();
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
    initializeTagColors,
    rebuildResourceCardTags,
    toCamelCase,
    parseCommaSeparatedValues,
    TAG_COLORS
};
// Function to determine tag type and return appropriate color


// Function to apply colors to resource tags


// Function to convert text to proper title case (first letter of each word capitalized)



// Function to create colored tag element
// Enhanced function to convert text to proper title case with special handling for acronyms




// Enhanced CSS to ensure proper tag separation and spacing with SMALLER tags
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
       
        /* SMALLER tag bubbles with proportional font */
        .colored-tag {
            transition: all 0.2s ease;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 32px !important;
            padding: 6px 12px !important;
            border-radius: 16px !important;
            font-size: 10px !important;
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
            font-size: 10px !important;
            font-weight: 600 !important;
            padding: 6px 12px !important;
            border-radius: 16px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1.2 !important;
            min-height: 32px !important;
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
            min-height: 32px !important;
            padding: 6px 12px !important;
            border-radius: 16px !important;
            font-size: 10px !important;
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
            min-height: 32px !important;
            padding: 6px 12px !important;
            border-radius: 16px !important;
            font-size: 10px !important;
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
                font-size: 8px !important;
                padding: 3px 8px !important;
                min-height: 24px !important;
                margin: 2px 4px 2px 0 !important;
                border-radius: 12px !important;
            }
            
            .topic-value span {
                font-size: 8px !important;
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
                font-size: 7px !important;
                padding: 2px 6px !important;
                min-height: 20px !important;
                margin: 1px 3px 1px 0 !important;
                border-radius: 10px !important;
            }
            
            .topic-value span {
                font-size: 7px !important;
                padding: 2px 6px !important;
                min-height: 20px !important;
                max-width: 80px !important;
                border-radius: 10px !important;
            }
        }
    `;
   
    document.head.appendChild(style);
}

// Updated createColoredTag function with smaller sizing
function createColoredTag(text, type) {
    const tag = document.createElement('span');
    tag.className = 'meta-tag colored-tag';
    tag.textContent = toCamelCase(text);
    tag.style.backgroundColor = TAG_COLORS[type] || TAG_COLORS.resourceType;
    tag.style.color = '#ffffff';
    tag.style.padding = '6px 12px';
    tag.style.borderRadius = '16px';
    tag.style.fontSize = '10px';
    tag.style.fontWeight = '600';
    tag.style.margin = '3px 6px 3px 0';
    tag.style.display = 'inline-flex';
    tag.style.alignItems = 'center';
    tag.style.justifyContent = 'center';
    tag.style.textAlign = 'center';
    tag.style.lineHeight = '1.2';
    tag.style.minHeight = '32px';
    tag.style.whiteSpace = 'nowrap';
    tag.style.flexShrink = '0';
    tag.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
   
    return tag;
}
// Enhanced function to rebuild resource cards with proper color coding



// Initialize tag colors when DOM is ready






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
   
    // Wait for the main initialization to complete
    setTimeout(() => {
        initializeTagColors();
    }, 100);
});


// Export functions for use in other parts of the application
window.tagColorUtils = {
    applyTagColors,
    createColoredTag,
    getTagColor,
    initializeTagColors,
    TAG_COLORS
};



