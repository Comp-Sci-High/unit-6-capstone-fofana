        document.addEventListener('DOMContentLoaded', function() {
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
            if (loginBtn) {
                loginBtn.addEventListener('click', function() {
                    alert('Login At The Home Page');
                });
            }

            document.getElementById('resource-submission-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submit-btn');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                submitBtn.textContent = 'Submitting...';
                
                const formData = {
                    ProductName: document.getElementById('product-name').value,
                    Website: document.getElementById('website-url').value,
                    ProductType: document.getElementById('product-type').value,
                    Description: document.getElementById('description').value,
                    Price: document.getElementById('price-model').value,
                    GradeLevel: Array.from(document.querySelectorAll('input[name="gradeLevel"]:checked')).map(el => el.value).join(', '),
                    StandardAlignment: document.getElementById('standard-alignment').value,
                    SupportedLanguages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(el => el.value).join(', '),
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
                        document.getElementById('resource-submission-form').reset();
                        
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
    password: "admin123" 
  };

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem('isAuthenticated', 'true');
      // Redirect to /admin
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
