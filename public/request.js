class MultiSelectDropdown {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.input = this.container.querySelector('.multi-select-input');
        this.dropdown = this.container.querySelector('.dropdown-menu');
        this.chipsContainer = this.container.querySelector('.selected-chips');
        this.dropdownIcon = this.container.querySelector('.dropdown-icon');
        this.selectedValues = new Set();
        this.allItems = Array.from(this.dropdown.querySelectorAll('.dropdown-item'));
        this.filteredItems = [...this.allItems];
        this.isOpen = false;
        this.options = {
            allowOther: options.allowOther || false,
            otherContainerId: options.otherContainerId || null,
            required: options.required || false,
            ...options
        };
        
        this.init();
    }

    init() {
        // Input events
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', () => this.openDropdown());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Dropdown events
        this.dropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
        
        // Icon click
        this.dropdownIcon.addEventListener('click', () => this.toggleDropdown());
        
        // Outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Initialize other input if needed
        if (this.options.allowOther && this.options.otherContainerId) {
            this.otherContainer = document.getElementById(this.options.otherContainerId);
        }
    }

    handleInput(e) {
        const query = e.target.value.toLowerCase();
        this.filterItems(query);
        this.openDropdown();
    }

    handleKeydown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.openDropdown();
            this.focusFirstItem();
        } else if (e.key === 'Escape') {
            this.closeDropdown();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.isOpen && this.filteredItems.length > 0) {
                const firstVisibleItem = this.filteredItems.find(item => !item.classList.contains('hidden'));
                if (firstVisibleItem) {
                    this.selectItem(firstVisibleItem.dataset.value);
                }
            }
        }
    }

    handleDropdownClick(e) {
        if (e.target.classList.contains('dropdown-item')) {
            e.stopPropagation();
            this.selectItem(e.target.dataset.value);
        }
    }

    filterItems(query) {
        this.filteredItems = this.allItems.filter(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query);
            item.classList.toggle('hidden', !matches);
            return matches;
        });
    }

    selectItem(value) {
        if (this.selectedValues.has(value)) {
            return;
        }

        this.selectedValues.add(value);
        this.createChip(value);
        this.updateDropdownItems();
        this.input.value = '';
        this.input.focus();
        
        // Handle "Other" option
        if (value === 'Other' && this.options.allowOther && this.otherContainer) {
            this.otherContainer.classList.add('show');
            this.otherContainer.querySelector('input').focus();
        }
        
        this.closeDropdown();
    }

    createChip(value) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.innerHTML = `
            ${value}
            <i class="fas fa-times chip-remove" data-value="${value}"></i>
        `;
        
        chip.querySelector('.chip-remove').addEventListener('click', () => {
            this.removeChip(value);
        });
        
        this.chipsContainer.appendChild(chip);
    }

    removeChip(value) {
        this.selectedValues.delete(value);
        const chip = this.chipsContainer.querySelector(`[data-value="${value}"]`).closest('.chip');
        chip.remove();
        this.updateDropdownItems();
        
        // Handle "Other" option removal
        if (value === 'Other' && this.options.allowOther && this.otherContainer) {
            this.otherContainer.classList.remove('show');
            this.otherContainer.querySelector('input').value = '';
        }
    }

    updateDropdownItems() {
        this.allItems.forEach(item => {
            const isSelected = this.selectedValues.has(item.dataset.value);
            item.classList.toggle('selected', isSelected);
        });
    }

    openDropdown() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.dropdown.classList.add('show');
            this.dropdownIcon.classList.add('rotated');
            this.container.classList.add('active');
        }
    }

    closeDropdown() {
        if (this.isOpen) {
            this.isOpen = false;
            this.dropdown.classList.remove('show');
            this.dropdownIcon.classList.remove('rotated');
            this.container.classList.remove('active');
            this.input.value = '';
            this.allItems.forEach(item => item.classList.remove('hidden'));
        }
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    focusFirstItem() {
        const firstVisible = this.filteredItems.find(item => !item.classList.contains('hidden'));
        if (firstVisible) {
            firstVisible.focus();
        }
    }

    getSelectedValues() {
        return Array.from(this.selectedValues);
    }

    reset() {
        this.selectedValues.clear();
        this.chipsContainer.innerHTML = '';
        this.updateDropdownItems();
        this.closeDropdown();
        
        // Reset other inputs
        if (this.options.allowOther && this.otherContainer) {
            this.otherContainer.classList.remove('show');
            this.otherContainer.querySelector('input').value = '';
        }
    }
}

// Main DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize multi-select dropdowns
    const resourceTypeDropdown = new MultiSelectDropdown('resource-type-container', {
        allowOther: true,
        otherContainerId: 'resource-type-other',
        required: true
    });

    const standardAlignmentDropdown = new MultiSelectDropdown('standard-alignment-container', {
        allowOther: true,
        otherContainerId: 'standard-alignment-other'
    });

    const gradeLevelDropdown = new MultiSelectDropdown('grade-level-container', {
        required: true
    });

    const languagesDropdown = new MultiSelectDropdown('languages-container');

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.close-btn');

    if (mobileMenuBtn && mobileMenu && closeBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });

        closeBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });

        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }

    // Login modal functionality
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.modal-close');

    if (loginBtn && loginModal && closeModal) {
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
    }

    // Admin login functionality
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

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                sessionStorage.setItem('isAuthenticated', 'true');
                window.location.href = '/admin';
            } else {
                // Show error message
                let errorElement = document.getElementById('error-message');
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = 'error-message';
                    errorElement.className = 'error-message';
                    loginForm.appendChild(errorElement);
                }
                errorElement.textContent = 'Invalid username or password';
            }
        });
    }

    // Auto-redirect if already logged in
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = '/admin';
    }

    // Resource submission form functionality
    const resourceForm = document.getElementById('resource-submission-form');
    if (resourceForm) {
        resourceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;
            
            // Validate required multi-select fields
            const resourceTypes = resourceTypeDropdown.getSelectedValues();
            const gradeLevels = gradeLevelDropdown.getSelectedValues();
            
            if (resourceTypes.length === 0) {
                alert('Please select at least one resource type.');
                return;
            }
            
            if (gradeLevels.length === 0) {
                alert('Please select at least one grade level.');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Submitting...';
            
            // Get form data
            let finalResourceTypes = [...resourceTypes];
            if (resourceTypes.includes('Other')) {
                const otherValue = document.querySelector('input[name="otherResourceType"]').value;
                if (otherValue) {
                    finalResourceTypes = finalResourceTypes.filter(type => type !== 'Other');
                    finalResourceTypes.push(otherValue);
                }
            }

            let finalStandardAlignment = standardAlignmentDropdown.getSelectedValues();
            if (finalStandardAlignment.includes('Other')) {
                const otherValue = document.querySelector('input[name="otherStandardAlignment"]').value;
                if (otherValue) {
                    finalStandardAlignment = finalStandardAlignment.filter(std => std !== 'Other');
                    finalStandardAlignment.push(otherValue);
                }
            }

            const formData = {
                ProductName: document.getElementById('product-name').value,
                Website: document.getElementById('website-url').value,
                ProductType: finalResourceTypes.join(', '),
                Description: document.getElementById('description').value,
                Price: document.getElementById('price-model').value,
                GradeLevel: gradeLevels.join(', '),
                StandardAlignment: finalStandardAlignment.join(', '),
                SupportedLanguages: languagesDropdown.getSelectedValues().join(', '),
                isApproved: false
            };

            try {
                const response = await fetch('/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Resource submitted successfully! It will be reviewed by our team.');
                    resourceForm.reset();
                    
                    // Reset multi-select dropdowns
                    resourceTypeDropdown.reset();
                    standardAlignmentDropdown.reset();
                    gradeLevelDropdown.reset();
                    languagesDropdown.reset();
                    
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    alert(`Submission failed: ${errorData.message || 'Please try again.'}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during submission. Please check your connection and try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            }
        });

        // Reset form functionality
        const resetBtn = resourceForm.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                setTimeout(() => {
                    resourceTypeDropdown.reset();
                    standardAlignmentDropdown.reset();
                    gradeLevelDropdown.reset();
                    languagesDropdown.reset();
                }, 0);
            });
        }
    }

    // Header scroll effect
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
});