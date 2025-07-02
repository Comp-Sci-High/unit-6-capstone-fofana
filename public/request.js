

// Main DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
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

   

    if (closeModal && loginModal) {
        closeModal.addEventListener('click', function() {
            loginModal.classList.remove('active');
        });

        // Close modal by clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    // Resource submission form functionality
    const resourceForm = document.getElementById('resource-submission-form');
    if (resourceForm) {
        resourceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Submitting...';
       
            
            const resourceTypes = Array.from(document.querySelectorAll('input[name="resourceType"]:checked')).map(el => el.value);
if (document.getElementById('other-checkbox').checked) {
    const otherValue = document.querySelector('input[name="otherResourceType"]').value;
    if (otherValue) {
        resourceTypes.push(otherValue);
    }
}

          
const formData = {
    ProductName: document.getElementById('product-name').value,
    Website: document.getElementById('website-url').value,
    ProductType: resourceTypes.join(', '), // Convert array to comma-separated string
    Description: document.getElementById('description').value,
    Price: document.getElementById('price-model').value,
    GradeLevel: Array.from(document.querySelectorAll('input[name="gradeLevel"]:checked')).map(el => el.value).join(', '),
StandardAlignment: document.getElementById('standard-alignment').value === 'Other' ? 
    document.querySelector('input[name="otherStandardAlignment"]').value : 
    document.getElementById('standard-alignment').value,    SupportedLanguages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(el => el.value).join(', '),
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
    }
});


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
      sessionStorage.setItem('isAuthenticated', 'true');

      window.location.href = '/admin';
    } else {
      errorElement.textContent = 'Invalid username or password';
    }
  });

  window.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      window.location.href = '/admin'; // Automatically redirect if already logged in
    }
  });

  document.getElementById('standard-alignment').addEventListener('change', function() {
    const otherInput = document.getElementById('other-standards-input');
    if (this.value === 'Other') {
        otherInput.classList.add('show');
        otherInput.querySelector('input').focus();
    } else {
        otherInput.classList.remove('show');
        otherInput.querySelector('input').value = '';
    }
});

// Clear "Other" standards input when form is reset
document.querySelector('button[type="reset"]').addEventListener('click', function() {
    setTimeout(() => {
        document.getElementById('other-standards-input').classList.remove('show');
    }, 0);
});


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