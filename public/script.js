async function deleteTool(id) {
    await fetch('/delTool/' + id, {method: 'DELETE'});
    window.location.href = "/"
   }
   

   async function editTool(e, id) {
    e.preventDefault();
   
    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());
   
    await fetch('/upTool/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject)
    });
   
    window.location.href = '/'
   }

        // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Hide loader after page load
            const loader = document.querySelector('.loader');
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1000);

            // Header scroll effect
            const header = document.querySelector('header');
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // Mobile menu toggle
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const closeBtn = document.querySelector('.close-btn');

            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.add('active');
            });

            closeBtn.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
            });

            // Login modal
            const loginBtn = document.querySelector('.login-btn');
            const loginModal = document.getElementById('login-modal');
            const closeModal = document.querySelector('.modal-close');

            loginBtn.addEventListener('click', function() {
                loginModal.classList.add('active');
            });

            closeModal.addEventListener('click', function() {
                loginModal.classList.remove('active');
            });

            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });

            // Animate elements on scroll
            const animateOnScroll = function() {
                const featureCards = document.querySelectorAll('.feature-card');
                const steps = document.querySelectorAll('.step');
                const statCards = document.querySelectorAll('.stat-card');
                
                featureCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = `fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                    }, index * 100);
                });
                
                steps.forEach((step, index) => {
                    setTimeout(() => {
                        step.style.animation = `fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                    }, index * 100);
                });
                
                statCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = `fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                    }, index * 100);
                });

                // Resource card animation
                const resourceCard = document.getElementById('resource-card');
                resourceCard.style.animation = `fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            };

            // Trigger animations after a delay
            setTimeout(animateOnScroll, 500);

            // Interactive WebGL background for hero section
            const createHeroBackground = () => {
                const canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                document.getElementById('canvas-container').appendChild(canvas);
                
                const ctx = canvas.getContext('2d');
                const circles = [];
                
                // Create initial circles
                for (let i = 0; i < 20; i++) {
                    circles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        radius: Math.random() * 50 + 20,
                        dx: (Math.random() - 0.5) * 2,
                        dy: (Math.random() - 0.5) * 2,
                        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, 0.3)`
                    });
                }
                
                // Animation loop
                function animate() {
                    requestAnimationFrame(animate);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Update and draw circles
                    circles.forEach(circle => {
                        // Update position
                        circle.x += circle.dx;
                        circle.y += circle.dy;
                        
                        // Bounce off edges
                        if (circle.x + circle.radius > canvas.width || circle.x - circle.radius < 0) {
                            circle.dx = -circle.dx;
                        }
                        
                        if (circle.y + circle.radius > canvas.height || circle.y - circle.radius < 0) {
                            circle.dy = -circle.dy;
                        }
                        
                        // Draw circle
                        ctx.beginPath();
                        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                        ctx.fillStyle = circle.color;
                        ctx.fill();
                        ctx.closePath();
                    });
                }
                
                animate();
                
                // Resize handler
                window.addEventListener('resize', () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                });
            };
            
            // Initialize hero background
            createHeroBackground();
        });

        loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
   
        
    
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123" // In a real app, never store passwords like this
};
        
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Successful login
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        document.getElementById('admin-username').textContent = username;
                window.location.href = '/admin';

        // Store login state in sessionStorage
        sessionStorage.setItem('isAuthenticated', 'true');
    } else {
        errorElement.textContent = 'Invalid username or password';
    }
});

   
document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('isAuthenticated');
    location.reload();
});
        
// Check if already logged in when page loads
window.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        document.getElementById('admin-username').textContent = ADMIN_CREDENTIALS.username;
    }
});
        });

    