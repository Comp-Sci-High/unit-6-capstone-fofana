
        document.addEventListener('DOMContentLoaded', function() {

            const loader = document.querySelector('.loader');
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1000);

            const header = document.querySelector('header');
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const closeBtn = document.querySelector('.close-btn');

            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.add('active');
            });

            closeBtn.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
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

                const resourceCard = document.getElementById('resource-card');
                resourceCard.style.animation = `fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            };

            setTimeout(animateOnScroll, 500);

            const createHeroBackground = () => {
                const canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                document.getElementById('canvas-container').appendChild(canvas);
                
                const ctx = canvas.getContext('2d');
                const circles = [];
                
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
                
                function animate() {
                    requestAnimationFrame(animate);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    circles.forEach(circle => {
                        circle.x += circle.dx;
                        circle.y += circle.dy;
                        
                        if (circle.x + circle.radius > canvas.width || circle.x - circle.radius < 0) {
                            circle.dx = -circle.dx;
                        }
                        
                        if (circle.y + circle.radius > canvas.height || circle.y - circle.radius < 0) {
                            circle.dy = -circle.dy;
                        }
                        
                        ctx.beginPath();
                        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                        ctx.fillStyle = circle.color;
                        ctx.fill();
                        ctx.closePath();
                    });
                }
                
                animate();
                
                window.addEventListener('resize', () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                });
            };
            
            createHeroBackground();
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
