        let currentRating = 0;
        let currentTool = null;
        let comments = [];

        // Sample data - in real app, this would come from your backend
        const sampleTool = {
            _id: "sample123",
            ProductName: "Scratch Programming Environment",
            Website: "https://scratch.mit.edu",
            ProductType: "Programming Language",
            Description: "Scratch is a visual programming language and online community where you can create your own interactive stories, games, and animations. Designed especially for ages 8 to 16, Scratch helps young people learn to think creatively, reason systematically, and work collaboratively.",
            Price: "Free",
            GradeLevel: "K-5, 6-8",
            StandardAlignment: "CSTA K-12 CS Standards",
            SupportedLanguages: "English, Spanish, French, German",
            isApproved: true
        };

        const sampleComments = [
            {
                _id: "comment1",
                username: "TeacherSarah",
                comment: "My students absolutely love using Scratch! It's perfect for introducing programming concepts in a fun and engaging way.",
                rating: 5
            },
            {
                _id: "comment2", 
                username: "CodeEducator",
                comment: "Great tool for beginners. The visual blocks make it easy for kids to understand logic flow.",
                rating: 4
            },
            {
                _id: "comment3",
                username: "MsJohnson",
                comment: "We've been using this in our computer science class for 2 years. Highly recommend!",
                rating: 5
            }
        ];

        function loadTool() {
            // In a real app, you'd get the tool ID from URL params and fetch from your API
            currentTool = sampleTool;
            comments = sampleComments;
            renderTool();
            renderComments();
        }

        function renderTool() {
            const toolContent = document.getElementById('tool-content');
            toolContent.innerHTML = `
                <div class="tool-header">
                    <h1 class="tool-title">${currentTool.ProductName}</h1>
                    <a href="${currentTool.Website}" target="_blank" class="tool-website">${currentTool.Website}</a>
                    
                    <div class="tool-meta">
                        <div class="meta-item">
                            <div class="meta-label">Product Type</div>
                            <div class="meta-value">${currentTool.ProductType}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Price</div>
                            <div class="meta-value">${currentTool.Price}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Grade Level</div>
                            <div class="meta-value">${currentTool.GradeLevel}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Standards</div>
                            <div class="meta-value">${currentTool.StandardAlignment || 'Not specified'}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Languages</div>
                            <div class="meta-value">${currentTool.SupportedLanguages || 'Not specified'}</div>
                        </div>
                    </div>
                </div>

                <div class="tool-description">
                    <h2 class="section-title">Description</h2>
                    <p>${currentTool.Description}</p>
                </div>

                <div class="comments-section">
                    <h2 class="section-title">Reviews & Comments</h2>
                    
                    <div class="comment-form">
                        <h3 style="margin-bottom: 1rem; color: #333;">Share Your Experience</h3>
                        <form onsubmit="submitComment(event)">
                            <div class="form-group">
                                <label class="form-label">Your Name</label>
                                <input type="text" class="form-input" id="username" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Rating</label>
                                <div class="rating-input">
                                    <span class="star" onclick="setRating(1)">★</span>
                                    <span class="star" onclick="setRating(2)">★</span>
                                    <span class="star" onclick="setRating(3)">★</span>
                                    <span class="star" onclick="setRating(4)">★</span>
                                    <span class="star" onclick="setRating(5)">★</span>
                                    <span style="margin-left: 1rem; color: #666;" id="rating-text">Click to rate</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Your Review</label>
                                <textarea class="form-textarea" id="comment" rows="4" placeholder="Share your thoughts about this tool..." required></textarea>
                            </div>
                            <button type="submit" class="btn-submit">Submit Review</button>
                        </form>
                    </div>

                    <div id="comments-list">
                        <!-- Comments will be rendered here -->
                    </div>
                </div>
            `;
        }

        function renderComments() {
            const commentsList = document.getElementById('comments-list');
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<div class="no-comments">No reviews yet. Be the first to share your experience!</div>';
                return;
            }

            commentsList.innerHTML = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-username">${comment.username}</span>
                        <div class="comment-rating">
                            ${Array(comment.rating).fill('★').map(() => '<span class="comment-star">★</span>').join('')}
                        </div>
                    </div>
                    <div class="comment-text">${comment.comment}</div>
                </div>
            `).join('');
        }

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

        async function submitComment(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const commentText = document.getElementById('comment').value;
            
            if (!currentRating) {
                alert('Please select a rating');
                return;
            }

            const newComment = {
                _id: 'temp_' + Date.now(),
                username: username,
                comment: commentText,
                rating: currentRating
            };

            // In a real app, you'd POST to /add/comment
            comments.unshift(newComment);
            
            // Reset form
            document.getElementById('username').value = '';
            document.getElementById('comment').value = '';
            setRating(0);
            document.getElementById('rating-text').textContent = 'Click to rate';
            
            renderComments();
            alert('Review submitted successfully!');
        }

        // Load the page when DOM is ready
        document.addEventListener('DOMContentLoaded', loadTool);
    