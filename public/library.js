document.addEventListener('DOMContentLoaded', function() {
    // ========================
    // LOGIN MODAL FUNCTIONALITY
    // ========================
   
    // ========================
    // RESOURCE FILTERING FUNCTIONALITY
    // ========================
    initializeResourceFiltering();
    
    // ========================
    // MOBILE MENU FUNCTIONALITY
    // ========================
    initializeMobileMenu();
});


            const loginBtn = document.querySelector('.login-btn');
            const loginModal = document.getElementById('login-modal');
            const closeModal = document.querySelector('.modal-close');

            loginBtn.addEventListener('click', function() {
                loginModal.classList.add('active');
            });

            closeModal.addEventListener('click', function() {
                loginModal.classList.remove('active');
            });

            window.addEventListener('click', function(e) {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });



  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "bobanafofana"
  };

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Using in-memory storage instead of sessionStorage
      window.authState = { isAuthenticated: true };

      window.location.href = '/admin';
    } else {
      errorElement.textContent = 'Invalid username or password';
    }
  });

  window.addEventListener('DOMContentLoaded', function () {
    if (window.authState && window.authState.isAuthenticated) {
      window.location.href = '/admin'; // Automatically redirect if already logged in
    }
  });

// Resource Filtering Functions
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

    function applyFilters() {
        const searchInput = document.getElementById('searchInput');
        const productTypeFilter = document.getElementById('productTypeFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const productType = productTypeFilter ? productTypeFilter.value : '';
        const priceFilterValue = priceFilter ? priceFilter.value : '';
        
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
            // Search filter - safely check if properties exist
            if (searchTerm && resource.ProductName && resource.Description) {
                const productNameMatch = resource.ProductName.toLowerCase().includes(searchTerm);
                const descriptionMatch = resource.Description.toLowerCase().includes(searchTerm);
                if (!productNameMatch && !descriptionMatch) {
                    return false;
                }
            }
            
            // Product type filter
            if (productType && resource.ProductType && resource.ProductType !== productType) {
                return false;
            }
            
            // Price filter - Updated logic to handle simplified price options
            if (priceFilterValue && resource.Price) {
                if (priceFilterValue === 'Free') {
                    if (resource.Price !== 'Free') {
                        return false;
                    }
                } else if (priceFilterValue === 'Paid') {
                    // Treat Freemium, Subscription, and Paid as "Paid"
                    if (!['Paid', 'Freemium', 'Subscription'].includes(resource.Price)) {
                        return false;
                    }
                }
            }
            
            // Grade level filter
            if (selectedGrades.length > 0 && resource.GradeLevel) {
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
        const searchInput = document.getElementById('searchInput');
        const productTypeFilter = document.getElementById('productTypeFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (searchInput) searchInput.value = '';
        if (productTypeFilter) productTypeFilter.value = '';
        if (priceFilter) priceFilter.value = '';
        
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        applyFilters();
    }

    // Make clearAllFilters globally available for the onclick handler in HTML
    window.clearAllFilters = clearAllFilters;

    // Add event listeners only if elements exist
    const searchInput = document.getElementById('searchInput');
    const productTypeFilter = document.getElementById('productTypeFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (productTypeFilter) {
        productTypeFilter.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    // Add event listeners for checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    // Initial load - show all resources
    displayResources(allResources);
    
    console.log('Filter system initialized with', allResources.length, 'resources');
}

// Mobile Menu Functions
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

/* JavaScript to categorize tags automatically */
document.addEventListener('DOMContentLoaded', function() {
    // Define category mappings
    const resourceTypes = ['Curriculum', 'Coding Platform', 'Assessment Tool', 'Game/Activity', 'Lesson Plans', 'Professional Development', 'Hardware/Robotics', 'Online Course', 'Educational', 'Other'];
    const gradeLevels = ['K-5', '6-8', '9-12', 'Higher Ed', 'Elementary', 'Middle School', 'High School', 'College'];
    const languages = ['Python', 'JavaScript', 'Java', 'Scratch', 'Block-based', 'HTML/CSS', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Visual Programming'];
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
});