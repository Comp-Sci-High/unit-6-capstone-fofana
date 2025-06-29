let currentFilter = 'all';
let currentEditingCommentId = null;
let currentEditingToolId = null; // Add this to track which tool's comments we're editing

// ... (keep all your existing functions until editComment)

async function editComment(commentId) {
    try {
        // Get comment data from the DOM
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (!commentElement) {
            throw new Error('Comment element not found');
        }
        
        const username = commentElement.querySelector('.comment-user').textContent;
        const commentText = commentElement.querySelector('.comment-text').textContent;
        const stars = commentElement.querySelector('.stars').textContent;
        const rating = stars.split('★').length - 1;
        
        // Find the tool ID by looking for the parent comments section
        const commentsSection = commentElement.closest('.comments-section');
        const toolId = commentsSection.id.replace('comments-', '');
        
        // Populate the edit form
        document.getElementById('editUsername').value = username;
        document.getElementById('editComment').value = commentText;
        document.getElementById('editRating').value = rating;
        
        currentEditingCommentId = commentId;
        currentEditingToolId = toolId; // Store the tool ID
        
        // Show the modal
        document.getElementById('editCommentModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error preparing comment edit:', error);
        showNotification('Failed to load comment for editing', 'error');
    }
}

function closeEditCommentModal() {
    document.getElementById('editCommentModal').style.display = 'none';
    currentEditingCommentId = null;
    currentEditingToolId = null; // Clear the tool ID
}

async function saveCommentEdit() {
    if (!currentEditingCommentId || !currentEditingToolId) {
        showNotification('Error: Missing comment or tool information', 'error');
        return;
    }
    
    const username = document.getElementById('editUsername').value.trim();
    const comment = document.getElementById('editComment').value.trim();
    const rating = document.getElementById('editRating').value;
    
    if (!username || !comment || !rating) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    if (rating < 1 || rating > 5) {
        showNotification('Rating must be between 1 and 5', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/comment/${currentEditingCommentId}`, {
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
        
        closeEditCommentModal();
        showNotification('Comment updated successfully!', 'success');
        
        // Reload comments and rating for the tool
        await loadComments(currentEditingToolId);
        await loadRating(currentEditingToolId);
        
    } catch (error) {
        console.error('Error updating comment:', error);
        showNotification(`Failed to update comment: ${error.message}`, 'error');
    }
}

// Also update the loadComments function to pass toolId to editComment
async function loadComments(toolId) {
    const commentsList = document.getElementById(`comments-list-${toolId}`);
    const commentCount = document.getElementById(`comment-count-${toolId}`);
    
    try {
        const response = await fetch(`/comments/${toolId}`);
        if (!response.ok) throw new Error('Failed to load comments');
        
        const comments = await response.json();
        
        commentCount.textContent = `${comments.length} Comments`;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet for this resource.</div>';
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item" id="comment-${comment._id}">
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
                    <button class="action-btn edit-comment-btn" onclick="editComment('${comment._id}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete-comment-btn" onclick="deleteComment('${comment._id}', '${toolId}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="no-comments">Failed to load comments.</div>';
        commentCount.textContent = 'Error loading count';
    }
}
        function logout() {
    localStorage.clear();
    sessionStorage.clear();
    
    window.location.href = '/';
}