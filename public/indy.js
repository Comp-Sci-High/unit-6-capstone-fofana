let currentRating = 0;
// Get toolId from the current URL path
const toolId = window.location.pathname.split('/').pop();

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    ratingText.textContent = ratingLabels[rating];
}

function showMessage(type, message) {
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');
    
    if (type === 'error') {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
    } else {
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
    }
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
    }, 5000);
}

function addCommentToList(comment, commentId = null) {
    const commentsList = document.getElementById('comments-list');
    const noComments = commentsList.querySelector('.no-comments');
    
    // Remove "no comments" message if it exists
    if (noComments) {
        noComments.remove();
    }
    
    // Use provided commentId or generate a temporary one for new comments
    const id = commentId || 'temp-' + Date.now();
    
    // Create new comment element
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.setAttribute('data-comment-id', id);
    commentItem.innerHTML = `
        <div class="comment-header">
            <div class="comment-user-info">
                <span class="comment-username">${comment.username}</span>
                ${(comment.organization || comment.role) ? `
                    <span class="comment-details">
                        ${comment.organization || ''}${comment.organization && comment.role ? ' • ' : ''}${comment.role || ''}
                    </span>
                ` : ''}
                <span class="comment-date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="comment-rating">
                ${'★'.repeat(comment.rating)}
            </div>
        </div>
        <div class="comment-content">
            <div class="comment-text">${comment.comment}</div>
        </div>
    `;
    
    // Add to the top of the comments list
    commentsList.insertBefore(commentItem, commentsList.firstChild);
}

async function submitComment(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const role = document.getElementById('role').value.trim();
    const commentText = document.getElementById('comment').value.trim();
    
    // Debug: Log the toolId
    console.log('Tool ID:', toolId);
    
    if (!toolId) {
        showMessage('error', 'Tool ID is missing');
        return;
    }
    
    if (!currentRating) {
        showMessage('error', 'Please select a rating');
        return;
    }

    if (!username || !commentText) {
        showMessage('error', 'Please fill in all required fields');
        return;
    }

    const requestData = {
        username: username,
        comment: commentText,
        rating: currentRating,
        organization: organization,
        role: role
    };
    
    // Debug: Log request data
    console.log('Request data:', requestData);
    console.log('Request URL:', `/indy/${toolId}`);

    try {
        const response = await fetch(`/indy/${toolId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        // Debug: Log response status
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const newComment = await response.json();
            console.log('New comment response:', newComment);
            
            // Add comment to the list immediately with the real ID from server
            addCommentToList({
                username: username,
                comment: commentText,
                rating: currentRating,
                organization: organization,
                role: role
            }, newComment.id || newComment._id);
            
            // Reset form
            document.getElementById('username').value = '';
            document.getElementById('comment').value = '';
            document.getElementById('organization').value = '';
            document.getElementById('role').value = '';
            currentRating = 0;
            
            // Reset rating stars
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => star.classList.remove('active'));
            document.getElementById('rating-text').textContent = 'Click to rate';
            
            showMessage('success', 'Review submitted successfully!');
            
            // Reload average rating
            loadAverageRating();
        } else {
            // Debug: Log error response
            const responseText = await response.text();
            console.log('Error response text:', responseText);
            
            try {
                const errorData = JSON.parse(responseText);
                showMessage('error', errorData.error || 'Failed to submit review');
            } catch (parseError) {
                showMessage('error', `Server error: ${response.status} - ${responseText}`);
            }
        }
    } catch (error) {
        console.error('Network error details:', error);
        showMessage('error', `Network error: ${error.message}`);
    }
}

async function loadAverageRating() {
    try {
        const response = await fetch(`/rating/${toolId}`);
        if (response.ok) {
            const ratingData = await response.json();
            if (ratingData.totalRatings > 0) {
                const avgRatingElement = document.getElementById('average-rating');
                if (avgRatingElement) {
                    avgRatingElement.innerHTML = `
                        <div class="average-rating">
                            <span class="rating-stars">${'★'.repeat(Math.round(ratingData.averageRating))}</span>
                            <span class="rating-text">${ratingData.averageRating}/5 (${ratingData.totalRatings} reviews)</span>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Error loading rating:', error);
    }
}

// Topic filtering functionality
function filterByTopic(topic) {
    const currentUrl = new URL(window.location.href);
    
    if (topic === 'all') {
        // Remove topic filter
        currentUrl.searchParams.delete('topic');
    } else {
        // Add topic filter
        currentUrl.searchParams.set('topic', topic);
    }
    
    // Reload page with new filter
    window.location.href = currentUrl.toString();
}

// Initialize topic filter on page load
function initTopicFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTopic = urlParams.get('topic');
    
    if (selectedTopic) {
        // Update active topic button
        const topicButtons = document.querySelectorAll('.topic-filter-btn');
        topicButtons.forEach(btn => {
            if (btn.dataset.topic === selectedTopic) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    
    if (toolId) {
        loadAverageRating();
    }
    
    // Initialize topic filter if we're on a page that uses it
    initTopicFilter();
    
    // Add topic filter event listeners
    const topicButtons = document.querySelectorAll('.topic-filter-btn');
    topicButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.dataset.topic;
            filterByTopic(topic);
        });
    });
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

// Login Modal Functions
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.modal-close');

if (loginBtn && loginModal && closeModal) {
    // Open login modal
    loginBtn.addEventListener('click', function() {
        loginModal.classList.add('active');
    });

    // Close login modal
    closeModal.addEventListener('click', function() {
        loginModal.classList.remove('active');
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
}

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "bobanafofana"
};

// Login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Use the correct IDs for login form
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error-message');
        
        console.log('Login attempt:', { username, password }); // Debug log
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            console.log('Login successful'); // Debug log
            sessionStorage.setItem('isAuthenticated', 'true');
            window.location.href = '/admin';
        } else {
            console.log('Login failed'); // Debug log
            if (errorElement) {
                errorElement.textContent = 'Invalid username or password';
                errorElement.style.display = 'block';
            }
        }
    });
}

// Auto-redirect if already authenticated
window.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = '/admin';
    }
});