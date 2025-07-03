// AUTOCOMPLETE MULTI-SELECT CLASS
// ========================
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
        
        // Input events
        this.input.addEventListener('focus', () => this.handleFocus());
        this.input.addEventListener('blur', (e) => this.handleBlur(e));
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Container click
        this.inputContainer.addEventListener('click', () => this.input.focus());
        
        // Dropdown events
        this.dropdown.addEventListener('mousedown', (e) => e.preventDefault());
        this.dropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
    }
    
    handleFocus() {
        this.inputContainer.classList.add('focused');
        this.openDropdown();
    }
    
    handleBlur(e) {
        // Delay to allow dropdown clicks to register
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
        
        // Scroll highlighted option into view
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
        // Remove existing chips
        const existingChips = this.inputContainer.querySelectorAll('.autocomplete-chip');
        existingChips.forEach(chip => chip.remove());
        
        // Add new chips before the input
        Array.from(this.selectedValues).forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'autocomplete-chip';
            chip.innerHTML = `
                ${value}
                <button type="button" class="autocomplete-chip-remove" data-value="${value}">×</button>
            `;
            
            // Add remove event
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

// ========================
// AUTOCOMPLETE INITIALIZATION FUNCTIONS
// ========================
function initializeAutocompleteFilters() {
    const resourceTypes = [
        'Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 
        'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 
        'Online Course', 'Other'
    ];
    
    const gradeLevels = ['K-5', '6-8', '9-12', 'Higher Ed'];
    
    const languages = [
        'Scratch', 'Python', 'JavaScript', 'Java', 'Block-based', 'HTML/CSS', 
        'C++', 'C#', 'Swift', 'Ruby', 'Go', 'SQL', 'R', 'Shell/Bash', 
        'PowerShell', 'Assembly', 'C', 'Unplugged', 'AI Skills'
    ];
    
    // Initialize Resource Type Autocomplete
    const resourceTypeContainer = document.getElementById('resourceTypeAutocomplete');
    if (resourceTypeContainer) {
        window.resourceTypeFilter = new AutocompleteMultiSelect(resourceTypeContainer, {
            options: resourceTypes,
            placeholder: 'Select resource types...',
            onSelectionChange: (selectedValues) => {
                // Trigger the existing filter function
                if (typeof applyFilters === 'function') {
                    applyFilters();
                }
            }
        });
    }
    
    // Initialize Grade Level Autocomplete
    const gradeLevelContainer = document.getElementById('gradeLevelAutocomplete');
    if (gradeLevelContainer) {
        window.gradeLevelFilter = new AutocompleteMultiSelect(gradeLevelContainer, {
            options: gradeLevels,
            placeholder: 'Select grade levels...',
            onSelectionChange: (selectedValues) => {
                // Trigger the existing filter function
                if (typeof applyFilters === 'function') {
                    applyFilters();
                }
            }
        });
    }
    
    // Initialize Language Autocomplete
    const languageContainer = document.getElementById('languageAutocomplete');
    if (languageContainer) {
        window.languageFilter = new AutocompleteMultiSelect(languageContainer, {
            options: languages,
            placeholder: 'Select languages/tools...',
            onSelectionChange: (selectedValues) => {
                // Trigger the existing filter function
                if (typeof applyFilters === 'function') {
                    applyFilters();
                }
            }
        });
    }
}

function clearAutocompleteFilters() {
    if (window.resourceTypeFilter) {
        window.resourceTypeFilter.clearSelections();
    }
    if (window.gradeLevelFilter) {
        window.gradeLevelFilter.clearSelections();
    }
    if (window.languageFilter) {
        window.languageFilter.clearSelections();
    }
}

// ========================
// MAIN APPLICATION INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeLoginModal();
    initializeResourceFiltering();
    initializeMobileMenu();
    initializeAutocompleteFilters();
    initializeTagCategorization();
});

// ========================
// LOGIN MODAL FUNCTIONALITY
// ========================
function initializeLoginModal() {
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.modal-close');

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

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('error-message');

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                // Using in-memory storage instead of sessionStorage
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

// ========================
// RESOURCE FILTERING FUNCTIONALITY
// ========================
function initializeResourceFiltering() {
    // Get all resources from the rendered page
    const allResourceElements = document.querySelectorAll('.resource-card');
    const allResources = Array.from(allResourceElements).map(card => {
        try {
            return JSON.parse(card.dataset.resource);
        } catch (e) {
            console.error('Error parsing resource data:', e);
            return null;
        }
    }).filter(resource => resource !== null);

    let filteredResources = [...allResources];

    function displayResources(resources) {
        const grid = document.getElementById('resourcesGrid');
        const noResults = document.getElementById('noResults');
        const resultsCount = document.getElementById('resultsCount');

        if (!grid || !noResults || !resultsCount) {
            console.error('Required elements not found');
            return;
        }

        // Hide all cards first
        allResourceElements.forEach(card => {
            card.style.display = 'none';
        });

        // Show matching cards
        let visibleCount = 0;
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

    function getSelectedOptions(selectElement) {
        if (!selectElement) return [];
        return Array.from(selectElement.selectedOptions).map(option => option.value);
    }

    function getAutocompleteSelections() {
        const resourceTypes = window.resourceTypeFilter ? window.resourceTypeFilter.getSelectedValues() : [];
        const gradeLevels = window.gradeLevelFilter ? window.gradeLevelFilter.getSelectedValues() : [];
        const languages = window.languageFilter ? window.languageFilter.getSelectedValues() : [];
        return { resourceTypes, gradeLevels, languages };
    }

}
function applyFilters() {
    console.log('Applying filters...'); // Debug log
    
    const searchInput = document.getElementById('searchInput');
    const productTypeFilter = document.getElementById('productTypeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const gradeLevelFilter = document.getElementById('gradeLevelFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const productType = productTypeFilter ? productTypeFilter.value : '';
    const priceFilterValue = priceFilter ? priceFilter.value : '';
    
    // Get selected values from both old dropdowns and new autocomplete
    let selectedResourceTypes = getSelectedOptions(productTypeFilter);
    let selectedGrades = getSelectedOptions(gradeLevelFilter);
    let selectedLanguages = getSelectedOptions(languageFilter);
    
    // If autocomplete filters are available, use those instead
    const autocompleteSelections = getAutocompleteSelections();
    if (autocompleteSelections.resourceTypes.length > 0) {
        selectedResourceTypes = autocompleteSelections.resourceTypes;
    }
    if (autocompleteSelections.gradeLevels.length > 0) {
        selectedGrades = autocompleteSelections.gradeLevels;
    }
    if (autocompleteSelections.languages.length > 0) {
        selectedLanguages = autocompleteSelections.languages;
    }

    // Debug logs
    console.log('Selected Resource Types:', selectedResourceTypes);
    console.log('Selected Grades:', selectedGrades);
    console.log('Selected Languages:', selectedLanguages);
    console.log('Search Term:', searchTerm);
    console.log('Price Filter:', priceFilterValue);

    // Get all resources from the page
    const allResourceElements = document.querySelectorAll('.resource-card');
    const allResources = Array.from(allResourceElements).map(card => {
        try {
            return JSON.parse(card.dataset.resource);
        } catch (e) {
            console.error('Error parsing resource data:', e);
            return null;
        }
    }).filter(resource => resource !== null);

    console.log('Total resources found:', allResources.length);

    const filteredResources = allResources.filter(resource => {
        // Search filter - safely check if properties exist
        if (searchTerm) {
            const productName = resource.ProductName || '';
            const description = resource.Description || '';
            const productNameMatch = productName.toLowerCase().includes(searchTerm);
            const descriptionMatch = description.toLowerCase().includes(searchTerm);
            if (!productNameMatch && !descriptionMatch) {
                return false;
            }
        }
        
        // Product type filter - handle both old single select and new multi-select
        if (productType && resource.ProductType) {
            // Old single select logic
            const resourceTypes = resource.ProductType.split(',').map(t => t.trim());
            if (!resourceTypes.includes(productType)) {
                return false;
            }
        } else if (selectedResourceTypes.length > 0) {
            // Multi-select logic: Resource must have ALL selected resource types
            if (!resource.ProductType || resource.ProductType.trim() === '') {
                return false;
            }
            
            const resourceTypes = resource.ProductType.split(',').map(t => t.trim());
            const hasAllResourceTypes = selectedResourceTypes.every(type => 
                resourceTypes.includes(type)
            );
            if (!hasAllResourceTypes) {
                console.log(`Resource ${resource.ProductName} filtered out - missing resource type. Has: ${resourceTypes.join(', ')}, Needs: ${selectedResourceTypes.join(', ')}`);
                return false;
            }
        }
        
        // Price filter
        if (priceFilterValue && resource.Price) {
            if (priceFilterValue === 'Free') {
                if (resource.Price !== 'Free') {
                    return false;
                }
            } else if (priceFilterValue === 'Paid') {
                // Treat anything that's not "Free" as "Paid"
                if (resource.Price === 'Free') {
                    return false;
                }
            }
        }
        
        // Grade level filter: Resource must support ALL selected grades
        if (selectedGrades.length > 0) {
            if (!resource.GradeLevel || resource.GradeLevel.trim() === '') {
                return false;
            }
            
            const resourceGrades = resource.GradeLevel.split(',').map(g => g.trim());
            const hasAllGrades = selectedGrades.every(grade => 
                resourceGrades.includes(grade)
            );
            if (!hasAllGrades) {
                console.log(`Resource ${resource.ProductName} filtered out - missing grade level. Has: ${resourceGrades.join(', ')}, Needs: ${selectedGrades.join(', ')}`);
                return false;
            }
        }
        
        // Language filter: Resource must support ALL selected languages
        if (selectedLanguages.length > 0) {
            // If resource has no SupportedLanguages field or it's empty, exclude it
            if (!resource.SupportedLanguages || resource.SupportedLanguages.trim() === '') {
                console.log(`Resource ${resource.ProductName} filtered out - no supported languages`);
                return false;
            }
            
            const resourceLanguages = resource.SupportedLanguages.split(',').map(l => l.trim());
            const hasAllLanguages = selectedLanguages.every(lang => 
                resourceLanguages.includes(lang)
            );
            if (!hasAllLanguages) {
                console.log(`Resource ${resource.ProductName} filtered out - missing language. Has: ${resourceLanguages.join(', ')}, Needs: ${selectedLanguages.join(', ')}`);
                return false;
            }
        }
        
        return true;
    });
    
    console.log('Filtered resources count:', filteredResources.length);
    displayResources(filteredResources);
}

// Helper function to get selected options from multi-select dropdowns
function getSelectedOptions(selectElement) {
    if (!selectElement) return [];
    return Array.from(selectElement.selectedOptions).map(option => option.value);
}

// Helper function to get autocomplete selections
function getAutocompleteSelections() {
    const resourceTypes = window.resourceTypeFilter ? window.resourceTypeFilter.getSelectedValues() : [];
    const gradeLevels = window.gradeLevelFilter ? window.gradeLevelFilter.getSelectedValues() : [];
    const languages = window.languageFilter ? window.languageFilter.getSelectedValues() : [];
    return { resourceTypes, gradeLevels, languages };
}

// Enhanced display resources function
function displayResources(resources) {
    const grid = document.getElementById('resourcesGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!grid || !noResults || !resultsCount) {
        console.error('Required elements not found');
        return;
    }

    // Get all resource cards
    const allResourceElements = document.querySelectorAll('.resource-card');

    // Hide all cards first
    allResourceElements.forEach(card => {
        card.style.display = 'none';
    });

    // Show matching cards
    let visibleCount = 0;
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

// Enhanced clear all filters function
function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const productTypeFilter = document.getElementById('productTypeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const gradeLevelFilter = document.getElementById('gradeLevelFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    if (searchInput) searchInput.value = '';
    if (productTypeFilter) productTypeFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    
    // Clear multi-select dropdowns
    if (gradeLevelFilter) {
        Array.from(gradeLevelFilter.options).forEach(option => {
            option.selected = false;
        });
    }
    
    if (languageFilter) {
        Array.from(languageFilter.options).forEach(option => {
            option.selected = false;
        });
    }
    
    // Clear autocomplete filters
    clearAutocompleteFilters();
    
    // Show all resources after clearing
    applyFilters();
}

// Enhanced autocomplete clear function
function clearAutocompleteFilters() {
    if (window.resourceTypeFilter) {
        window.resourceTypeFilter.clearSelections();
    }
    if (window.gradeLevelFilter) {
        window.gradeLevelFilter.clearSelections();
    }
    if (window.languageFilter) {
        window.languageFilter.clearSelections();
    }
}

// Enhanced initialization function
function initializeResourceFiltering() {
    // Get all resources from the rendered page
    const allResourceElements = document.querySelectorAll('.resource-card');
    const allResources = Array.from(allResourceElements).map(card => {
        try {
            return JSON.parse(card.dataset.resource);
        } catch (e) {
            console.error('Error parsing resource data:', e);
            return null;
        }
    }).filter(resource => resource !== null);

    console.log('Initialized with', allResources.length, 'resources');

    // Make functions globally available
    window.applyFilters = applyFilters;
    window.clearAllFilters = clearAllFilters;

    // Add event listeners only if elements exist
    const searchInput = document.getElementById('searchInput');
    const productTypeFilter = document.getElementById('productTypeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const gradeLevelFilter = document.getElementById('gradeLevelFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (productTypeFilter) {
        productTypeFilter.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    if (gradeLevelFilter) {
        gradeLevelFilter.addEventListener('change', applyFilters);
    }
    
    if (languageFilter) {
        languageFilter.addEventListener('change', applyFilters);
    }

    // Initial load - show all resources
    displayResources(allResources);
}

// Debounce function for search input
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

// Enhanced autocomplete initialization
function initializeAutocompleteFilters() {
    const resourceTypes = [
        'Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 
        'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 
        'Online Course', 'Other'
    ];
    
    const gradeLevels = ['K-5', '6-8', '9-12', 'Higher Ed'];
    
    const languages = [
        'Scratch', 'Python', 'JavaScript', 'Java', 'Block-based', 'HTML/CSS', 
        'C++', 'C#', 'Swift', 'Ruby', 'Go', 'SQL', 'R', 'Shell/Bash', 
        'PowerShell', 'Assembly', 'C', 'Unplugged', 'AI Skills'
    ];
    
    // Initialize Resource Type Autocomplete
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
    
    // Initialize Grade Level Autocomplete
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
    
    // Initialize Language Autocomplete
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
}

// Make sure everything is available globally
window.applyFilters = applyFilters;
window.clearAllFilters = clearAllFilters;
window.initializeResourceFiltering = initializeResourceFiltering;
window.initializeAutocompleteFilters = initializeAutocompleteFilters;// ========================
// MOBILE MENU FUNCTIONALITY
// ========================
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

    // Close mobile menu when clicking outside
    if (mobileMenu && mobileMenuBtn) {
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

// ========================
// HEADER SCROLL EFFECTS
// ========================
// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const scrolled = window.scrollY > 50; // Trigger after 50px of scrolling
    
    if (scrolled) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Alternative: using requestAnimationFrame for better performance
let ticking = false;

function updateHeader() {
    const header = document.querySelector('header');
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

// ========================
// TAG CATEGORIZATION
// ========================
function initializeTagCategorization() {
    // Define category mappings - Updated with new options
    const resourceTypes = [
        'Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 
        'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 
        'Online Course', 'Educational', 'Other'
    ];
    
    const gradeLevels = [
        'K-5', '6-8', '9-12', 'Higher Ed', 'Elementary', 
        'Middle School', 'High School', 'College'
    ];
    
    const languages = [
        'Python', 'JavaScript', 'Java', 'Scratch', 'Block-based', 'HTML/CSS', 
        'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Visual Programming',
        'Go', 'SQL', 'R', 'Shell/Bash', 'PowerShell', 'Assembly', 'C',
        'Unplugged', 'AI Skills'
    ];
    
    const costs = ['Free', 'Paid', 'Freemium', 'Premium', 'Subscription'];
    
    // Get all meta tags
    const metaTags = document.querySelectorAll('.meta-tag');
    const priceTags = document.querySelectorAll('.price-tag');
    
    // Categorize meta tags
    metaTags.forEach(tag => {
        const text = tag.textContent.trim();
        
        if (resourceTypes.some(type => text.includes(type))) {
            tag.classList.add('tag-resource-type');
        } else if (gradeLevels.some(grade => text.includes(grade))) {
            tag.classList.add('tag-grade-level');
        } else if (languages.some(lang => text.includes(lang))) {
            tag.classList.add('tag-language');
        } else if (costs.some(cost => text.includes(cost))) {
            tag.classList.add('tag-cost');
        }
    });
    
    // Ensure price tags have cost styling
    priceTags.forEach(tag => {
        tag.classList.add('tag-cost');
    });
}