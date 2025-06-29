let currentFilter = 'all';

// Filter submissions function
function filterSubmissions(event, filter) {
    // Remove active class from all tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    currentFilter = filter;
    
    // Show/hide submissions based on filter
    const submissions = document.querySelectorAll('.submission-card');
    submissions.forEach(submission => {
        const status = submission.dataset.status;
        if (filter === 'all' || status === filter) {
            submission.style.display = 'block';
        } else {
            submission.style.display = 'none';
        }
    });
}

// View resource function
function viewResource(url) {
    window.open(url, '_blank');
}

// Approve submission
async function approveSubmission(requestId) {
    if (!confirm('Are you sure you want to approve this submission?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/approve/${requestId}`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showNotification('Submission approved successfully!', 'success');
            location.reload(); // Reload to update the UI
        } else {
            throw new Error('Failed to approve submission');
        }
    } catch (error) {
        console.error('Error approving submission:', error);
        showNotification('Failed to approve submission', 'error');
    }
}

// Reject submission
async function rejectSubmission(requestId) {
    if (!confirm('Are you sure you want to reject this submission?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/reject/${requestId}`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showNotification('Submission rejected successfully!', 'success');
            location.reload(); // Reload to update the UI
        } else {
            throw new Error('Failed to reject submission');
        }
    } catch (error) {
        console.error('Error rejecting submission:', error);
        showNotification('Failed to reject submission', 'error');
    }
}

// Delete request
async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/delete/${requestId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Request deleted successfully!', 'success');
            location.reload(); // Reload to update the UI
        } else {
            throw new Error('Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
    }
}

// Toggle comments section
async function toggleComments(toolId) {
    const commentsSection = document.getElementById(`comments-${toolId}`);
    
    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        await loadComments(toolId);
        await loadRating(toolId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Load comments for a tool
async function loadComments(toolId) {
    const commentsList = document.getElementById(`comments-list-${toolId}`);
    const commentCount = document.getElementById(`comment-count-${toolId}`);
    
    if (!commentsList || !commentCount) {
        console.error('Comments elements not found for tool:', toolId);
        return;
    }
    
    try {
        const response = await fetch(`/comments/${toolId}`);
        if (!response.ok) throw new Error('Failed to load comments');
        
        const comments = await response.json();
        
        commentCount.textContent = `${comments.length} Comments`;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet for this resource.</div>';
            return;
        }
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.id = `comment-${comment._id}`;
            
            commentDiv.innerHTML = `
                <div class="comment-header">
                    <div>
                        <span class="comment-user">${escapeHtml(comment.username)}</span>
                        <div class="comment-rating">
                            <span class="stars">${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}</span>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(comment.comment)}</div>
                <div class="comment-actions">
                    <button class="action-btn edit-comment-btn" onclick="toggleEditComment('${comment._id}', '${toolId}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete-comment-btn" onclick="deleteComment('${comment._id}', '${toolId}')">
                        🗑️ Delete
                    </button>
                </div>
                
                <!-- Inline edit form (initially hidden) -->
                <div class="inline-edit-form" id="edit-form-${comment._id}" style="display: none;">
                    <div class="form-group">
                        <label for="edit-username-${comment._id}">Username:</label>
                        <input type="text" id="edit-username-${comment._id}" value="${escapeHtml(comment.username)}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-comment-${comment._id}">Comment:</label>
                        <textarea id="edit-comment-${comment._id}" rows="3" required>${escapeHtml(comment.comment)}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-rating-${comment._id}">Rating:</label>
                        <select id="edit-rating-${comment._id}" required>
                            <option value="1" ${comment.rating === 1 ? 'selected' : ''}>1 Star</option>
                            <option value="2" ${comment.rating === 2 ? 'selected' : ''}>2 Stars</option>
                            <option value="3" ${comment.rating === 3 ? 'selected' : ''}>3 Stars</option>
                            <option value="4" ${comment.rating === 4 ? 'selected' : ''}>4 Stars</option>
                            <option value="5" ${comment.rating === 5 ? 'selected' : ''}>5 Stars</option>
                        </select>
                    </div>
                    <div class="inline-edit-actions">
                        <button class="action-btn save-btn" onclick="saveCommentEdit('${comment._id}', '${toolId}')">
                            ✅ Save
                        </button>
                        <button class="action-btn cancel-btn" onclick="cancelEditComment('${comment._id}')">
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            `;
            
            fragment.appendChild(commentDiv);
        });
        
        // Clear and append all at once
        commentsList.innerHTML = '';
        commentsList.appendChild(fragment);
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="no-comments">Failed to load comments.</div>';
        commentCount.textContent = 'Error loading count';
    }
}

// Load rating for a tool
async function loadRating(toolId) {
    const averageRatingElement = document.getElementById(`average-rating-${toolId}`);
    
    if (!averageRatingElement) {
        console.error('Rating element not found for tool:', toolId);
        return;
    }
    
    try {
        const response = await fetch(`/rating/${toolId}`);
        if (!response.ok) throw new Error('Failed to load rating');
        
        const data = await response.json();
        
        if (data.averageRating) {
            const avgRating = parseFloat(data.averageRating).toFixed(1);
            const stars = '★'.repeat(Math.floor(avgRating)) + '☆'.repeat(5 - Math.floor(avgRating));
            averageRatingElement.textContent = `Rating: ${avgRating}/5 ${stars} (${data.totalRatings} reviews)`;
        } else {
            averageRatingElement.textContent = 'Rating: No ratings yet';
        }
        
    } catch (error) {
        console.error('Error loading rating:', error);
        averageRatingElement.textContent = 'Rating: Error loading';
    }
}

// Toggle inline edit form
function toggleEditComment(commentId, toolId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    const commentText = commentItem.querySelector('.comment-text');
    const commentActions = commentItem.querySelector('.comment-actions');
    
    if (!commentItem || !editForm) {
        console.error('Comment elements not found:', commentId);
        return;
    }
    
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        // Show edit form, hide comment text and actions
        editForm.style.display = 'block';
        commentText.style.display = 'none';
        commentActions.style.display = 'none';
    } else {
        // Hide edit form, show comment text and actions
        editForm.style.display = 'none';
        commentText.style.display = 'block';
        commentActions.style.display = 'flex';
    }
}

// Cancel edit comment
function cancelEditComment(commentId) {
    const editForm = document.getElementById(`edit-form-${commentId}`);
    const commentItem = document.getElementById(`comment-${commentId}`);
    const commentText = commentItem.querySelector('.comment-text');
    const commentActions = commentItem.querySelector('.comment-actions');
    
    if (!editForm || !commentText || !commentActions) {
        console.error('Comment elements not found for cancel:', commentId);
        return;
    }
    
    // Hide edit form, show comment text and actions
    editForm.style.display = 'none';
    commentText.style.display = 'block';
    commentActions.style.display = 'flex';
}

// Save comment edit
async function saveCommentEdit(commentId, toolId) {
    const usernameInput = document.getElementById(`edit-username-${commentId}`);
    const commentInput = document.getElementById(`edit-comment-${commentId}`);
    const ratingInput = document.getElementById(`edit-rating-${commentId}`);
    
    if (!usernameInput || !commentInput || !ratingInput) {
        showNotification('Error: Form elements not found', 'error');
        return;
    }
    
    const username = usernameInput.value.trim();
    const comment = commentInput.value.trim();
    const rating = ratingInput.value;
    
    if (!username || !comment || !rating) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    if (rating < 1 || rating > 5) {
        showNotification('Rating must be between 1 and 5', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/comment/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                comment: comment,
                rating: parseInt(rating)
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        showNotification('Comment updated successfully!', 'success');
        
        // Reload comments and rating for the tool
        await loadComments(toolId);
        await loadRating(toolId);
        
    } catch (error) {
        console.error('Error updating comment:', error);
        showNotification(`Failed to update comment: ${error.message}`, 'error');
    }
}

// Delete comment function
async function deleteComment(commentId, toolId) {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/comment/${commentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        showNotification('Comment deleted successfully!', 'success');
        
        // Reload comments and rating for the tool
        await loadComments(toolId);
        await loadRating(toolId);
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification(`Failed to delete comment: ${error.message}`, 'error');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

        function logout() {
    localStorage.clear();
    sessionStorage.clear();
    
    window.location.href = '/';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin portal initialized');
});