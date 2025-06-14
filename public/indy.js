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
            <span class="comment-username">${comment.username}</span>
            <div class="comment-actions">
                <div class="comment-rating">
                    ${'★'.repeat(comment.rating)}
                </div>
                <div class="comment-buttons">
                    <button class="btn-edit" onclick="editComment('${id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteComment('${id}')">Delete</button>
                </div>
            </div>
        </div>
        <div class="comment-content">
            <div class="comment-text">${comment.comment}</div>
            <div class="comment-edit-form" style="display: none;">
                <textarea class="edit-textarea">${comment.comment}</textarea>
                <div class="edit-rating">
                    <span>Rating: </span>
                    <span class="edit-star" data-rating="1" onclick="setEditRating('${id}', 1)">★</span>
                    <span class="edit-star" data-rating="2" onclick="setEditRating('${id}', 2)">★</span>
                    <span class="edit-star" data-rating="3" onclick="setEditRating('${id}', 3)">★</span>
                    <span class="edit-star" data-rating="4" onclick="setEditRating('${id}', 4)">★</span>
                    <span class="edit-star" data-rating="5" onclick="setEditRating('${id}', 5)">★</span>
                </div>
                <div class="edit-buttons">
                    <button class="btn-save" onclick="saveComment('${id}')">Save</button>
                    <button class="btn-cancel" onclick="cancelEdit('${id}')">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to the top of the comments list
    commentsList.insertBefore(commentItem, commentsList.firstChild);
    
    // Set initial edit rating
    setEditRating(id, comment.rating);
}

async function submitComment(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
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
        rating: currentRating
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
                rating: currentRating
            }, newComment.id || newComment._id);
            
            // Reset form
            document.getElementById('username').value = '';
            document.getElementById('comment').value = '';
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

// Delete comment function - FIXED
async function deleteComment(commentId) {
    // Check if this is a temporary comment (just added)
    if (commentId.startsWith('temp-')) {
        showMessage('error', 'Cannot delete a comment that hasn\'t been saved yet');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    console.log('Attempting to delete comment with ID:', commentId);
    
    try {
        const response = await fetch(`/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Delete response status:', response.status);
        
        if (response.ok) {
            // Remove comment from DOM
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentElement) {
                commentElement.remove();
                showMessage('success', 'Comment deleted successfully!');
            }
            
            // Check if no comments left
            const commentsList = document.getElementById('comments-list');
            if (commentsList.children.length === 0) {
                commentsList.innerHTML = '<div class="no-comments">No reviews yet. Be the first to share your experience!</div>';
            }
            
            // Reload average rating
            loadAverageRating();
        } else {
            const responseText = await response.text();
            console.log('Delete error response:', responseText);
            
            try {
                const errorData = JSON.parse(responseText);
                showMessage('error', errorData.error || 'Failed to delete comment');
            } catch (parseError) {
                showMessage('error', `Server error: ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        showMessage('error', 'Network error. Please try again.');
    }
}

// Edit comment function - FIXED
function editComment(commentId) {
    console.log('Editing comment with ID:', commentId);
    
    // Check if this is a temporary comment
    if (commentId.startsWith('temp-')) {
        showMessage('error', 'Cannot edit a comment that hasn\'t been saved yet');
        return;
    }
    
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Comment element not found for ID:', commentId);
        showMessage('error', 'Comment not found');
        return;
    }
    
    const commentText = commentElement.querySelector('.comment-text');
    const editForm = commentElement.querySelector('.comment-edit-form');
    const editButton = commentElement.querySelector('.btn-edit');
    const deleteButton = commentElement.querySelector('.btn-delete');
    
    if (!commentText || !editForm || !editButton) {
        console.error('Required elements not found in comment');
        showMessage('error', 'Unable to edit comment');
        return;
    }
    
    // Hide comment text and show edit form
    commentText.style.display = 'none';
    editForm.style.display = 'block';
    editButton.textContent = 'Editing...';
    editButton.disabled = true;
    
    // Disable delete button while editing
    if (deleteButton) {
        deleteButton.disabled = true;
    }
    
    // Set the current rating in edit form
    const currentRatingStars = commentElement.querySelectorAll('.comment-rating .comment-star').length;
    setEditRating(commentId, currentRatingStars);
}

// Cancel edit function - FIXED
function cancelEdit(commentId) {
    console.log('Canceling edit for comment ID:', commentId);
    
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Comment element not found for ID:', commentId);
        return;
    }
    
    const commentText = commentElement.querySelector('.comment-text');
    const editForm = commentElement.querySelector('.comment-edit-form');
    const editButton = commentElement.querySelector('.btn-edit');
    const deleteButton = commentElement.querySelector('.btn-delete');
    const editTextarea = commentElement.querySelector('.edit-textarea');
    
    // Reset textarea to original content
    if (editTextarea && commentText) {
        editTextarea.value = commentText.textContent;
    }
    
    // Show comment text and hide edit form
    if (commentText) commentText.style.display = 'block';
    if (editForm) editForm.style.display = 'none';
    if (editButton) {
        editButton.textContent = 'Edit';
        editButton.disabled = false;
    }
    if (deleteButton) {
        deleteButton.disabled = false;
    }
}

// Set edit rating function - FIXED
function setEditRating(commentId, rating) {
    console.log('Setting edit rating for comment ID:', commentId, 'to rating:', rating);
    
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Comment element not found for ID:', commentId);
        return;
    }
    
    const editStars = commentElement.querySelectorAll('.edit-star');
    
    editStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    // Store the rating for later use
    commentElement.setAttribute('data-edit-rating', rating);
}

// Save comment function - FIXED
async function saveComment(commentId) {
    console.log('Saving comment with ID:', commentId);
    
    // Check if this is a temporary comment
    if (commentId.startsWith('temp-')) {
        showMessage('error', 'Cannot save a temporary comment');
        return;
    }
    
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Comment element not found for ID:', commentId);
        showMessage('error', 'Comment not found');
        return;
    }
    
    const editTextarea = commentElement.querySelector('.edit-textarea');
    const newRating = parseInt(commentElement.getAttribute('data-edit-rating')) || 1;
    
    if (!editTextarea) {
        console.error('Edit textarea not found');
        showMessage('error', 'Unable to save comment');
        return;
    }
    
    const newCommentText = editTextarea.value.trim();
    
    if (!newCommentText) {
        showMessage('error', 'Comment text cannot be empty');
        return;
    }
    
    console.log('Saving comment data:', { comment: newCommentText, rating: newRating });
    
    try {
        const response = await fetch(`/comment/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment: newCommentText,
                rating: newRating
            })
        });
        
        console.log('Save response status:', response.status);
        
        if (response.ok) {
            // Update the comment display
            const commentText = commentElement.querySelector('.comment-text');
            const commentRating = commentElement.querySelector('.comment-rating');
            
            if (commentText) commentText.textContent = newCommentText;
            if (commentRating) commentRating.innerHTML = '★'.repeat(newRating);
            
            // Hide edit form and show comment text
            cancelEdit(commentId);
            
            // Reload average rating
            loadAverageRating();
            
            showMessage('success', 'Comment updated successfully!');
        } else {
            const responseText = await response.text();
            console.log('Save error response:', responseText);
            
            try {
                const errorData = JSON.parse(responseText);
                showMessage('error', errorData.error || 'Failed to update comment');
            } catch (parseError) {
                showMessage('error', `Server error: ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        showMessage('error', 'Network error. Please try again.');
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    
    if (toolId) {
        loadAverageRating();
    }
    
    // Initialize edit ratings for existing comments
    const existingComments = document.querySelectorAll('[data-comment-id]');
    existingComments.forEach(commentElement => {
        const commentId = commentElement.getAttribute('data-comment-id');
        const ratingStars = commentElement.querySelectorAll('.comment-rating .comment-star');
        if (ratingStars.length > 0) {
            setEditRating(commentId, ratingStars.length);
        }
    });
});