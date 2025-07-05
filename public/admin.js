let currentFilter = 'all';

// Multi-select chip functionality
class MultiSelectChips {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id ${containerId} not found`);
            return;
        }
       
        this.options = options;
        this.selectedValues = new Set();
        this.filteredOptions = [];
        this.isOtherSelected = false;
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.input = this.container.querySelector('.multi-select-search');
        this.chipsContainer = this.container.querySelector('.selected-chips');
        this.dropdown = this.container.querySelector('.multi-select-dropdown');
        this.otherInput = document.getElementById(options.otherInputId);
       
        this.init();
    }
   
    init() {
        if (!this.input || !this.chipsContainer || !this.dropdown) {
            console.error('Required elements not found in multi-select container');
            return;
        }
       
        this.setupEventListeners();
        this.updateFilteredOptions();
        this.updateOtherInputVisibility();
    }
   
    setupEventListeners() {
        // Input focus event
        this.input.addEventListener('focus', () => this.showDropdown());
       
        // Document click handler
        document.addEventListener('click', this.handleDocumentClick);
       
        // Input search
        this.input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
       
        // Dropdown option clicks
        this.dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-option')) {
                e.stopPropagation();
                this.selectOption(e.target.dataset.value);
                this.input.focus();
            }
        });
       
        // Container click to focus input
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target === this.chipsContainer) {
                this.input.focus();
            }
        });
       
        // Other input handling
        if (this.otherInput) {
            this.otherInput.addEventListener('input', () => {
                this.updateOtherInputVisibility();
            });
        }
    }
   
    handleDocumentClick(e) {
        if (!this.container.contains(e.target)) {
            this.hideDropdown();
        }
    }

    handleSearch(searchTerm) {
        const hasSearchTerm = searchTerm && searchTerm.trim().length > 0;
       
        if (hasSearchTerm) {
            const filtered = Array.from(this.dropdown.querySelectorAll('.dropdown-option'))
                .filter(option => {
                    const text = option.textContent.toLowerCase();
                    const value = option.dataset.value.toLowerCase();
                    const search = searchTerm.toLowerCase();
                    return text.includes(search) || value.includes(search);
                });
           
            this.dropdown.querySelectorAll('.dropdown-option').forEach(option => {
                const shouldShow = filtered.includes(option);
                option.style.display = shouldShow ? 'block' : 'none';
            });
           
            this.showDropdown();
        } else {
            this.dropdown.querySelectorAll('.dropdown-option').forEach(option => {
                option.style.display = 'block';
            });
           
            if (document.activeElement === this.input) {
                this.showDropdown();
            }
        }
    }
    
    selectOption(value) {
        if (this.selectedValues.has(value)) {
            this.removeValue(value);
        } else {
            this.addValue(value);
        }
       
        this.input.value = '';
        this.updateFilteredOptions();
        this.updateOtherInputVisibility();
    }
   
    addValue(value) {
        this.selectedValues.add(value);
        this.updateChipsDisplay();
       
        if (value === 'Other') {
            this.isOtherSelected = true;
        }
    }
   
    removeValue(value) {
        this.selectedValues.delete(value);
        this.updateChipsDisplay();
       
        if (value === 'Other') {
            this.isOtherSelected = false;
            if (this.otherInput) {
                this.otherInput.value = '';
            }
        }
    }
   
    updateChipsDisplay() {
        this.chipsContainer.innerHTML = '';
       
        this.selectedValues.forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `
                <span class="chip-text">${value}</span>
                <span class="chip-remove" data-value="${value}">×</span>
            `;
           
            chip.querySelector('.chip-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeValue(value);
                this.updateFilteredOptions();
                this.updateOtherInputVisibility();
            });
           
            this.chipsContainer.appendChild(chip);
        });
    }
   
    updateFilteredOptions() {
        this.dropdown.querySelectorAll('.dropdown-option').forEach(option => {
            const isSelected = this.selectedValues.has(option.dataset.value);
            option.classList.toggle('selected', isSelected);
        });
    }
   
    updateOtherInputVisibility() {
        if (this.otherInput) {
            this.otherInput.parentElement.style.display = this.isOtherSelected ? 'block' : 'none';
        }
    }
   
    showDropdown() {
        this.dropdown.style.display = 'block';
        this.container.classList.add('dropdown-open');
    }
   
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.container.classList.remove('dropdown-open');
        this.input.value = '';
        this.dropdown.querySelectorAll('.dropdown-option').forEach(option => {
            option.style.display = 'block';
        });
    }
   
    setValues(values) {
        this.selectedValues.clear();
        this.isOtherSelected = false;
       
        if (Array.isArray(values)) {
            values.forEach(value => {
                if (value && value.trim()) {
                    this.selectedValues.add(value.trim());
                    if (value === 'Other') {
                        this.isOtherSelected = true;
                    }
                }
            });
        } else if (typeof values === 'string' && values.trim()) {
            values.split(',').forEach(value => {
                if (value && value.trim()) {
                    this.selectedValues.add(value.trim());
                    if (value.trim() === 'Other') {
                        this.isOtherSelected = true;
                    }
                }
            });
        }
       
        this.updateChipsDisplay();
        this.updateFilteredOptions();
        this.updateOtherInputVisibility();
    }
   
    getValues() {
        return Array.from(this.selectedValues);
    }
   
    getOtherValue() {
        return this.otherInput ? this.otherInput.value.trim() : '';
    }
    
    destroy() {
        document.removeEventListener('click', this.handleDocumentClick);
    }
}

// Store multi-select instances
const multiSelectInstances = new Map();

// Filter submissions function
function filterSubmissions(event, filter) {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
   
    event.target.classList.add('active');
    currentFilter = filter;
   
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

function getFormValue(selector, submissionCard = null) {
    const element = submissionCard ?
        submissionCard.querySelector(selector) :
        document.querySelector(selector);
    return element ? element.value.trim() : '';
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
            location.reload();
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
            location.reload();
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
            location.reload();
        } else {
            throw new Error('Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
    }
}

// Toggle comments section
async function toggleComments(requestId) {
    const commentsSection = document.getElementById(`comments-${requestId}`);
   
    if (!commentsSection) {
        console.error('Comments section not found for request:', requestId);
        return;
    }
   
    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        await loadComments(requestId);
        await loadRating(requestId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Load comments for a request
async function loadComments(requestId) {
    const commentsList = document.getElementById(`comments-list-${requestId}`);
    const commentCount = document.getElementById(`comment-count-${requestId}`);
   
    if (!commentsList || !commentCount) {
        console.error('Comments elements not found for request:', requestId);
        return;
    }
   
    try {
        const response = await fetch(`/comments/${requestId}`);
        if (!response.ok) throw new Error('Failed to load comments');
       
        const comments = await response.json();
       
        commentCount.textContent = `${comments.length} Comments`;
       
        if (comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet for this resource.</div>';
            return;
        }
       
        const fragment = document.createDocumentFragment();
       
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.id = `comment-${comment._id}`;
           
            let orgRoleDisplay = '';
            if (comment.organization || comment.role) {
                const parts = [];
                if (comment.organization) parts.push(`<span class="comment-organization">${escapeHtml(comment.organization)}</span>`);
                if (comment.role) parts.push(`<span class="comment-role">${escapeHtml(comment.role)}</span>`);
                orgRoleDisplay = `<div class="comment-details">${parts.join(' • ')}</div>`;
            }
           
            const commentDate = new Date(comment.createdAt || comment.timestamp || comment.date || Date.now());
            const dateString = commentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const timeString = commentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
           
            commentDiv.innerHTML = `
                <div class="comment-header">
                    <div class="comment-user-info">
                        <span class="comment-username">${escapeHtml(comment.username || comment.name || 'Anonymous')}</span>
                        ${orgRoleDisplay}
                        <span class="comment-date-full">
                            <span class="date-part">${dateString}</span>
                            <span class="time-part">${timeString}</span>
                        </span>
                    </div>
                    <div class="comment-rating">
                        <span class="stars">${'★'.repeat(comment.rating || 0)}${'☆'.repeat(5 - (comment.rating || 0))}</span>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(comment.comment || comment.text || '')}</div>
                <div class="comment-actions">
                    <button class="action-btn edit-comment-btn" onclick="toggleEditComment('${comment._id}', '${requestId}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete-comment-btn" onclick="deleteComment('${comment._id}', '${requestId}')">
                        🗑️ Delete
                    </button>
                </div>
               
                <div class="inline-edit-form" id="edit-form-${comment._id}" style="display: none;">
                    <div class="form-group">
                        <label for="edit-username-${comment._id}">Username:</label>
                        <input type="text" id="edit-username-${comment._id}" value="${escapeHtml(comment.username || comment.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-organization-${comment._id}">Organization:</label>
                        <input type="text" id="edit-organization-${comment._id}" value="${escapeHtml(comment.organization || '')}" placeholder="e.g., ABC Elementary School">
                    </div>
                    <div class="form-group">
                        <label for="edit-role-${comment._id}">Role:</label>
                        <input type="text" id="edit-role-${comment._id}" value="${escapeHtml(comment.role || '')}" placeholder="e.g., Teacher, Administrator, Parent">
                    </div>
                    <div class="form-group">
                        <label for="edit-comment-${comment._id}">Comment:</label>
                        <textarea id="edit-comment-${comment._id}" rows="3" required>${escapeHtml(comment.comment || comment.text || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-rating-${comment._id}">Rating:</label>
                        <select id="edit-rating-${comment._id}" required>
                            <option value="1" ${(comment.rating || 0) === 1 ? 'selected' : ''}>1 Star</option>
                            <option value="2" ${(comment.rating || 0) === 2 ? 'selected' : ''}>2 Stars</option>
                            <option value="3" ${(comment.rating || 0) === 3 ? 'selected' : ''}>3 Stars</option>
                            <option value="4" ${(comment.rating || 0) === 4 ? 'selected' : ''}>4 Stars</option>
                            <option value="5" ${(comment.rating || 0) === 5 ? 'selected' : ''}>5 Stars</option>
                        </select>
                    </div>
                    <div class="inline-edit-actions">
                        <button class="action-btn save-btn" onclick="saveCommentEdit('${comment._id}', '${requestId}')">
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
       
        commentsList.innerHTML = '';
        commentsList.appendChild(fragment);
       
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<div class="no-comments">Failed to load comments.</div>';
        commentCount.textContent = 'Error loading count';
    }
}

// Load rating for a request
async function loadRating(requestId) {
    const averageRatingElement = document.getElementById(`average-rating-${requestId}`);
   
    if (!averageRatingElement) {
        console.error('Rating element not found for request:', requestId);
        return;
    }
   
    try {
        const response = await fetch(`/rating/${requestId}`);
        if (!response.ok) throw new Error('Failed to load rating');
       
        const data = await response.json();
       
        if (data.averageRating && data.averageRating > 0) {
            const avgRating = parseFloat(data.averageRating).toFixed(1);
            const stars = '★'.repeat(Math.floor(avgRating)) + '☆'.repeat(5 - Math.floor(avgRating));
            averageRatingElement.textContent = `Rating: ${avgRating}/5 ${stars} (${data.totalRatings || 0} reviews)`;
        } else {
            averageRatingElement.textContent = 'Rating: No ratings yet';
        }
       
    } catch (error) {
        console.error('Error loading rating:', error);
        averageRatingElement.textContent = 'Rating: Error loading';
    }
}

// Toggle inline edit form
function toggleEditComment(commentId, requestId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
   
    if (!commentItem || !editForm) {
        console.error('Comment elements not found:', commentId);
        return;
    }
   
    const commentText = commentItem.querySelector('.comment-text');
    const commentActions = commentItem.querySelector('.comment-actions');
   
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        editForm.style.display = 'block';
        if (commentText) commentText.style.display = 'none';
        if (commentActions) commentActions.style.display = 'none';
    } else {
        editForm.style.display = 'none';
        if (commentText) commentText.style.display = 'block';
        if (commentActions) commentActions.style.display = 'flex';
    }
}

// Cancel edit comment
function cancelEditComment(commentId) {
    const editForm = document.getElementById(`edit-form-${commentId}`);
    const commentItem = document.getElementById(`comment-${commentId}`);
   
    if (!editForm || !commentItem) {
        console.error('Comment elements not found for cancel:', commentId);
        return;
    }
   
    const commentText = commentItem.querySelector('.comment-text');
    const commentActions = commentItem.querySelector('.comment-actions');
   
    editForm.style.display = 'none';
    if (commentText) commentText.style.display = 'block';
    if (commentActions) commentActions.style.display = 'flex';
}

// Save comment edit
async function saveCommentEdit(commentId, requestId) {
    const usernameInput = document.getElementById(`edit-username-${commentId}`);
    const organizationInput = document.getElementById(`edit-organization-${commentId}`);
    const roleInput = document.getElementById(`edit-role-${commentId}`);
    const commentInput = document.getElementById(`edit-comment-${commentId}`);
    const ratingInput = document.getElementById(`edit-rating-${commentId}`);
   
    if (!usernameInput || !commentInput || !ratingInput) {
        showNotification('Error: Form elements not found', 'error');
        return;
    }
   
    const username = usernameInput.value.trim();
    const organization = organizationInput ? organizationInput.value.trim() : '';
    const role = roleInput ? roleInput.value.trim() : '';
    const comment = commentInput.value.trim();
    const rating = ratingInput.value;
   
    if (!username || !comment || !rating) {
        showNotification('Username, comment, and rating are required', 'error');
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
                organization: organization,
                role: role,
                comment: comment,
                rating: parseInt(rating)
            })
        });
       
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
       
        showNotification('Comment updated successfully!', 'success');
        cancelEditComment(commentId);
        await loadComments(requestId);
        await loadRating(requestId);
       
    } catch (error) {
        console.error('Error updating comment:', error);
        showNotification(`Failed to update comment: ${error.message}`, 'error');
    }
}

// Delete comment function
async function deleteComment(commentId, requestId) {
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
        await loadComments(requestId);
        await loadRating(requestId);
       
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification(`Failed to delete comment: ${error.message}`, 'error');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
   
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
   
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
   
    document.body.appendChild(notification);
   
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

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.warn('Could not clear storage:', e);
        }
        window.location.href = '/';
    }
}

// Toggle edit submission form
function toggleEditSubmission(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
   
    if (!submissionCard) {
        console.error('Submission card not found for request:', requestId);
        return;
    }
   
    const detailsSection = submissionCard.querySelector('.submission-details');
    const editForm = submissionCard.querySelector('.edit-submission-form');
    const editBtn = submissionCard.querySelector('.edit-submission-btn');
   
    if (!detailsSection || !editForm || !editBtn) {
        console.error('Required elements not found in submission card');
        return;
    }
   
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        // Clean up any existing instances for this request
        cleanupMultiSelectForRequest(requestId);
        
        // Initialize multi-select for this request
        initializeMultiSelect(requestId);
       
        // Populate existing values
        populateEditForm(requestId);
       
        // Show edit form, hide details
        editForm.style.display = 'block';
        detailsSection.style.display = 'none';
        editBtn.textContent = '❌ Cancel Edit';
        editBtn.onclick = () => cancelEditSubmission(requestId);
    } else {
        // Hide edit form, show details
        editForm.style.display = 'none';
        detailsSection.style.display = 'grid';
        editBtn.textContent = '✏️ Edit Details';
        editBtn.onclick = () => toggleEditSubmission(requestId);
    }
}

// Clean up multi-select instances for a request
function cleanupMultiSelectForRequest(requestId) {
    const keys = [
        `topic-${requestId}`,
        `resourcetype-${requestId}`,
        `gradelevel-${requestId}`,
        `standardalignment-${requestId}`,
        `supportedlanguages-${requestId}`
    ];
    
    keys.forEach(key => {
        const instance = multiSelectInstances.get(key);
        if (instance) {
            instance.destroy();
            multiSelectInstances.delete(key);
        }
    });
}

// Initialize multi-select for a specific request
function initializeMultiSelect(requestId) {
    const selectors = [
        {
            id: `topic-container-${requestId}`,
            otherInputId: `other-topic-${requestId}`,
            key: `topic-${requestId}`
        },
        {
            id: `resourcetype-container-${requestId}`,
            otherInputId: `other-resourcetype-${requestId}`,
            key: `resourcetype-${requestId}`
        },
        {
            id: `gradelevel-container-${requestId}`,
            key: `gradelevel-${requestId}`
        },
        {
            id: `standardalignment-container-${requestId}`,
            otherInputId: `other-standardalignment-${requestId}`,
            key: `standardalignment-${requestId}`
        },
        {
            id: `supportedlanguages-container-${requestId}`,
            key: `supportedlanguages-${requestId}`
        }
    ];
   
    selectors.forEach(selector => {
        const container = document.getElementById(selector.id);
        if (container) {
            const instance = new MultiSelectChips(selector.id, {
                otherInputId: selector.otherInputId
            });
            if (instance.container) {
                multiSelectInstances.set(selector.key, instance);
            }
        } else {
            console.warn(`Multi-select container not found: ${selector.id}`);
        }
    });
}

// Populate edit form with existing values
function populateEditForm(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    if (!submissionCard) return;
    
    // Get existing values from the display
    const detailItems = submissionCard.querySelectorAll('.detail-item');
    
    // Create a map of detail labels to values for easier access
    const detailMap = {};
    detailItems.forEach(item => {
        const label = item.querySelector('.detail-label')?.textContent?.trim();
        const value = item.querySelector('.detail-value')?.textContent?.trim();
        if (label && value) {
            detailMap[label] = value;
        }
    });
    
    // Populate form fields
    const productNameInput = submissionCard.querySelector(`#edit-productname-${requestId}`);
    const descriptionInput = submissionCard.querySelector(`#edit-description-${requestId}`);
    const websiteInput = submissionCard.querySelector(`#edit-website-${requestId}`);
    const priceInput = submissionCard.querySelector(`#edit-price-${requestId}`);
    
    if (productNameInput) productNameInput.value = submissionCard.querySelector('.submission-title')?.textContent || '';
    if (descriptionInput) descriptionInput.value = submissionCard.querySelector('.submission-description')?.textContent || '';
    if (websiteInput) websiteInput.value = detailMap['Website:'] || '';
    if (priceInput) priceInput.value = detailMap['Price:'] || '';
    
    // Populate multi-select fields
    const topicInstance = multiSelectInstances.get(`topic-${requestId}`);
    if (topicInstance && detailMap['Topics:']) {
        topicInstance.setValues(detailMap['Topics:']);
    }
    
    const resourceTypeInstance = multiSelectInstances.get(`resourcetype-${requestId}`);
    if (resourceTypeInstance && detailMap['Resource Type:']) {
        resourceTypeInstance.setValues(detailMap['Resource Type:']);
    }
    
    const gradeLevelInstance = multiSelectInstances.get(`gradelevel-${requestId}`);
    if (gradeLevelInstance && detailMap['Grade Level:']) {
        gradeLevelInstance.setValues(detailMap['Grade Level:']);
    }
    
    const standardAlignmentInstance = multiSelectInstances.get(`standardalignment-${requestId}`);
    if (standardAlignmentInstance && detailMap['Standard Alignment:']) {
        standardAlignmentInstance.setValues(detailMap['Standard Alignment:']);
    }
    
    const supportedLanguagesInstance = multiSelectInstances.get(`supportedlanguages-${requestId}`);
    if (supportedLanguagesInstance && detailMap['Supported Languages:']) {
        supportedLanguagesInstance.setValues(detailMap['Supported Languages:']);
    }
}
// Save submission edit
// Validate update data before sending to server


// Helper function to get current form values
function getCurrentFormValues(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    
    // Get form values
    const productName = getFormValue(`#edit-productname-${requestId}`, submissionCard);
    const description = getFormValue(`#edit-description-${requestId}`, submissionCard);
    const website = getFormValue(`#edit-website-${requestId}`, submissionCard);
    const price = getFormValue(`#edit-price-${requestId}`, submissionCard);

    // Get multi-select values
    const topicInstance = multiSelectInstances.get(`topic-${requestId}`);
    const resourceTypeInstance = multiSelectInstances.get(`resourcetype-${requestId}`);
    const gradeLevelInstance = multiSelectInstances.get(`gradelevel-${requestId}`);
    const standardAlignmentInstance = multiSelectInstances.get(`standardalignment-${requestId}`);
    const supportedLanguagesInstance = multiSelectInstances.get(`supportedlanguages-${requestId}`);

    // Process multi-select values
    let finalTopic = '';
    if (topicInstance) {
        const topicValues = topicInstance.getValues();
        const otherTopic = topicInstance.getOtherValue();
        finalTopic = topicValues.includes('Other') && otherTopic ? 
            [...topicValues.filter(t => t !== 'Other'), otherTopic].join(', ') : 
            topicValues.join(', ');
    }

    let productType = '';
    if (resourceTypeInstance) {
        const resourceTypes = resourceTypeInstance.getValues();
        const otherResourceType = resourceTypeInstance.getOtherValue();
        productType = resourceTypes.includes('Other') && otherResourceType ? 
            [...resourceTypes.filter(t => t !== 'Other'), otherResourceType].join(', ') : 
            resourceTypes.join(', ');
    }

    let gradeLevel = '';
    if (gradeLevelInstance) {
        gradeLevel = gradeLevelInstance.getValues().join(', ');
    }

    let finalStandardAlignment = '';
    if (standardAlignmentInstance) {
        const standardValues = standardAlignmentInstance.getValues();
        const otherStandardAlignment = standardAlignmentInstance.getOtherValue();
        finalStandardAlignment = standardValues.includes('Other') && otherStandardAlignment ? 
            otherStandardAlignment : standardValues.join(', ');
    }

    let supportedLanguages = '';
    if (supportedLanguagesInstance) {
        supportedLanguages = supportedLanguagesInstance.getValues().join(', ');
    }

    // Validate website URL if provided
    let validatedWebsite = website;
    if (website && website.trim()) {
        try {
            validatedWebsite = website.trim();
            if (!validatedWebsite.startsWith('http://') && !validatedWebsite.startsWith('https://')) {
                validatedWebsite = 'https://' + validatedWebsite;
            }
            new URL(validatedWebsite);
        } catch (e) {
            // Keep original value if validation fails
            validatedWebsite = website;
        }
    }

    return {
        ProductName: productName.trim(),
        Description: description.trim(),
        Topic: finalTopic.trim(),
        ProductType: productType.trim(),
        Price: price.trim(),
        GradeLevel: gradeLevel.trim(),
        StandardAlignment: finalStandardAlignment.trim(),
        SupportedLanguages: supportedLanguages.trim(),
        Website: validatedWebsite.trim()
    };
}
// Update submission display with new values
function updateSubmissionDisplay(requestId, data) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    
    if (!submissionCard) {
        console.error('Submission card not found for request:', requestId);
        return;
    }
    
    try {
        // Only update fields that were actually changed
        if (data.ProductName) {
            const titleElement = submissionCard.querySelector('.submission-title');
            if (titleElement) titleElement.textContent = data.ProductName;
        }
        
        if (data.Description) {
            const descriptionElement = submissionCard.querySelector('.submission-description');
            if (descriptionElement) descriptionElement.textContent = data.Description;
        }
        
        // Update detail values only for changed fields
        const detailItems = submissionCard.querySelectorAll('.detail-item');
        
        detailItems.forEach(item => {
            const label = item.querySelector('.detail-label')?.textContent?.trim();
            const valueElement = item.querySelector('.detail-value');
            
            if (label && valueElement) {
                if (label === 'Website:' && data.Website) {
                    valueElement.innerHTML = `<a href="${data.Website}" target="_blank">${data.Website}</a>`;
                } else if (label === 'Topics:' && data.Topic) {
                    valueElement.textContent = data.Topic;
                } else if (label === 'Resource Type:' && data.ProductType) {
                    valueElement.textContent = data.ProductType;
                } else if (label === 'Price:' && data.Price) {
                    valueElement.textContent = data.Price;
                } else if (label === 'Grade Level:' && data.GradeLevel) {
                    valueElement.textContent = data.GradeLevel;
                } else if (label === 'Standard Alignment:' && data.StandardAlignment) {
                    valueElement.textContent = data.StandardAlignment;
                } else if (label === 'Supported Languages:' && data.SupportedLanguages) {
                    valueElement.textContent = data.SupportedLanguages;
                }
            }
        });
        
        // Update view resource button only if website changed
        if (data.Website) {
            const viewBtn = submissionCard.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.onclick = () => viewResource(data.Website);
            }
        }
        
    } catch (error) {
        console.error('Error updating submission display:', error);
    }
}

async function saveSubmissionEdit(requestId) {
    try {
        // Get current form values
        const formData = getCurrentFormValues(requestId);
        
        // Validate required fields
        if (!formData.ProductName || !formData.Description) {
            showNotification('Product Name and Description are required', 'error');
            return;
        }
        
        // Prepare update data - only include changed fields
        const updateData = {};
        
        // Check each field and only include if it has a value
        if (formData.ProductName) updateData.ProductName = formData.ProductName;
        if (formData.Description) updateData.Description = formData.Description;
        if (formData.Website) updateData.Website = formData.Website;
        if (formData.Topic) updateData.Topic = formData.Topic;
        if (formData.ProductType) updateData.ProductType = formData.ProductType;
        if (formData.Price) updateData.Price = formData.Price;
        if (formData.GradeLevel) updateData.GradeLevel = formData.GradeLevel;
        if (formData.StandardAlignment) updateData.StandardAlignment = formData.StandardAlignment;
        if (formData.SupportedLanguages) updateData.SupportedLanguages = formData.SupportedLanguages;
        
        // Send update request to server - FIXED URL
        const response = await fetch(`/admin/edit/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        // Update the display with new values
        updateSubmissionDisplay(requestId, updateData);
        
        // Hide edit form and show details
        cancelEditSubmission(requestId);
        
        // Show success notification
        showNotification('Resource details updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving submission edit:', error);
        showNotification(`Failed to update resource: ${error.message}`, 'error');
    }
}



// Fixed getCurrentFormValues function with proper multi-select handling
function getCurrentFormValues(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    
    // Get form values
    const productName = getFormValue(`#edit-productname-${requestId}`, submissionCard);
    const description = getFormValue(`#edit-description-${requestId}`, submissionCard);
    const website = getFormValue(`#edit-website-${requestId}`, submissionCard);
    const price = getFormValue(`#edit-price-${requestId}`, submissionCard);

    // Get multi-select values
    const topicInstance = multiSelectInstances.get(`topic-${requestId}`);
    const resourceTypeInstance = multiSelectInstances.get(`resourcetype-${requestId}`);
    const gradeLevelInstance = multiSelectInstances.get(`gradelevel-${requestId}`);
    const standardAlignmentInstance = multiSelectInstances.get(`standardalignment-${requestId}`);
    const supportedLanguagesInstance = multiSelectInstances.get(`supportedlanguages-${requestId}`);

    // Process multi-select values with proper "Other" handling
    let finalTopic = '';
    if (topicInstance) {
        const topicValues = topicInstance.getValues();
        const otherTopicInput = document.getElementById(`other-topic-input-${requestId}`);
        const otherTopic = otherTopicInput ? otherTopicInput.value.trim() : '';
        
        if (topicValues.includes('Other') && otherTopic) {
            finalTopic = [...topicValues.filter(t => t !== 'Other'), otherTopic].join(', ');
        } else {
            finalTopic = topicValues.join(', ');
        }
    }

    let productType = '';
    if (resourceTypeInstance) {
        const resourceTypes = resourceTypeInstance.getValues();
        const otherResourceTypeInput = document.getElementById(`other-resourcetype-input-${requestId}`);
        const otherResourceType = otherResourceTypeInput ? otherResourceTypeInput.value.trim() : '';
        
        if (resourceTypes.includes('Other') && otherResourceType) {
            productType = [...resourceTypes.filter(t => t !== 'Other'), otherResourceType].join(', ');
        } else {
            productType = resourceTypes.join(', ');
        }
    }

    let gradeLevel = '';
    if (gradeLevelInstance) {
        gradeLevel = gradeLevelInstance.getValues().join(', ');
    }

    let finalStandardAlignment = '';
    if (standardAlignmentInstance) {
        const standardValues = standardAlignmentInstance.getValues();
        const otherStandardInput = document.getElementById(`other-standardalignment-input-${requestId}`);
        const otherStandardAlignment = otherStandardInput ? otherStandardInput.value.trim() : '';
        
        if (standardValues.includes('Other') && otherStandardAlignment) {
            finalStandardAlignment = otherStandardAlignment;
        } else {
            finalStandardAlignment = standardValues.join(', ');
        }
    }

    let supportedLanguages = '';
    if (supportedLanguagesInstance) {
        supportedLanguages = supportedLanguagesInstance.getValues().join(', ');
    }

    // Validate website URL if provided
    let validatedWebsite = website;
    if (website && website.trim()) {
        try {
            validatedWebsite = website.trim();
            if (!validatedWebsite.startsWith('http://') && !validatedWebsite.startsWith('https://')) {
                validatedWebsite = 'https://' + validatedWebsite;
            }
            // Test if it's a valid URL
            new URL(validatedWebsite);
        } catch (e) {
            // Keep original value if validation fails
            validatedWebsite = website;
        }
    }

    return {
        ProductName: productName,
        Description: description,
        Topic: finalTopic,
        ProductType: productType,
        Price: price,
        GradeLevel: gradeLevel,
        StandardAlignment: finalStandardAlignment,
        SupportedLanguages: supportedLanguages,
        Website: validatedWebsite
    };
}

// Fixed initializeMultiSelect function with correct container IDs
function initializeMultiSelect(requestId) {
    const selectors = [
        {
            id: `topic-container-${requestId}`,
            otherInputId: `other-topic-input-${requestId}`,
            key: `topic-${requestId}`
        },
        {
            id: `resourcetype-container-${requestId}`,
            otherInputId: `other-resourcetype-input-${requestId}`,
            key: `resourcetype-${requestId}`
        },
        {
            id: `gradelevel-container-${requestId}`,
            key: `gradelevel-${requestId}`
        },
        {
            id: `standardalignment-container-${requestId}`,
            otherInputId: `other-standardalignment-input-${requestId}`,
            key: `standardalignment-${requestId}`
        },
        {
            id: `supportedlanguages-container-${requestId}`,
            key: `supportedlanguages-${requestId}`
        }
    ];
   
    selectors.forEach(selector => {
        const container = document.getElementById(selector.id);
        if (container) {
            const instance = new MultiSelectChips(selector.id, {
                otherInputId: selector.otherInputId
            });
            if (instance.container) {
                multiSelectInstances.set(selector.key, instance);
            }
        } else {
            console.warn(`Multi-select container not found: ${selector.id}`);
        }
    });
}

// Fixed populateEditForm function with proper value parsing
function populateEditForm(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    if (!submissionCard) return;
    
    // Try to get data from the embedded JSON first
    const requestDataScript = document.getElementById(`request-data-${requestId}`);
    let requestData = null;
    
    if (requestDataScript) {
        try {
            requestData = JSON.parse(requestDataScript.textContent);
        } catch (e) {
            console.warn('Failed to parse request data from script tag:', e);
        }
    }
    
    // If we have request data, use it; otherwise fall back to DOM parsing
    if (requestData) {
        // Populate form fields with data from JSON
        const productNameInput = submissionCard.querySelector(`#edit-productname-${requestId}`);
        const descriptionInput = submissionCard.querySelector(`#edit-description-${requestId}`);
        const websiteInput = submissionCard.querySelector(`#edit-website-${requestId}`);
        const priceInput = submissionCard.querySelector(`#edit-price-${requestId}`);
        
        if (productNameInput) productNameInput.value = requestData.ProductName || '';
        if (descriptionInput) descriptionInput.value = requestData.Description || '';
        if (websiteInput) websiteInput.value = requestData.Website || '';
        if (priceInput) priceInput.value = requestData.Price || '';
        
        // Populate multi-select fields
        setTimeout(() => {
            const topicInstance = multiSelectInstances.get(`topic-${requestId}`);
            if (topicInstance && requestData.Topic) {
                topicInstance.setValues(requestData.Topic);
            }
            
            const resourceTypeInstance = multiSelectInstances.get(`resourcetype-${requestId}`);
            if (resourceTypeInstance && requestData.ProductType) {
                resourceTypeInstance.setValues(requestData.ProductType);
            }
            
            const gradeLevelInstance = multiSelectInstances.get(`gradelevel-${requestId}`);
            if (gradeLevelInstance && requestData.GradeLevel) {
                gradeLevelInstance.setValues(requestData.GradeLevel);
            }
            
            const standardAlignmentInstance = multiSelectInstances.get(`standardalignment-${requestId}`);
            if (standardAlignmentInstance && requestData.StandardAlignment) {
                standardAlignmentInstance.setValues(requestData.StandardAlignment);
            }
            
            const supportedLanguagesInstance = multiSelectInstances.get(`supportedlanguages-${requestId}`);
            if (supportedLanguagesInstance && requestData.SupportedLanguages) {
                supportedLanguagesInstance.setValues(requestData.SupportedLanguages);
            }
        }, 100); // Small delay to ensure multi-select instances are fully initialized
        
    } else {
        // Fallback to DOM parsing (existing code)
        const detailItems = submissionCard.querySelectorAll('.detail-item');
        const detailMap = {};
        
        detailItems.forEach(item => {
            const label = item.querySelector('.detail-label')?.textContent?.trim();
            const value = item.querySelector('.detail-value')?.textContent?.trim();
            if (label && value) {
                detailMap[label] = value;
            }
        });
        
        // Populate form fields
        const productNameInput = submissionCard.querySelector(`#edit-productname-${requestId}`);
        const descriptionInput = submissionCard.querySelector(`#edit-description-${requestId}`);
        const websiteInput = submissionCard.querySelector(`#edit-website-${requestId}`);
        const priceInput = submissionCard.querySelector(`#edit-price-${requestId}`);
        
        if (productNameInput) productNameInput.value = submissionCard.querySelector('.submission-title')?.textContent || '';
        if (descriptionInput) descriptionInput.value = submissionCard.querySelector('.submission-description')?.textContent || '';
        if (websiteInput) websiteInput.value = detailMap['Website:'] || '';
        if (priceInput) priceInput.value = detailMap['Price:'] || '';
        
        // Populate multi-select fields with a delay
        setTimeout(() => {
            const topicInstance = multiSelectInstances.get(`topic-${requestId}`);
            if (topicInstance && detailMap['Topics:']) {
                topicInstance.setValues(detailMap['Topics:']);
            }
            
            const resourceTypeInstance = multiSelectInstances.get(`resourcetype-${requestId}`);
            if (resourceTypeInstance && detailMap['Resource Type:']) {
                resourceTypeInstance.setValues(detailMap['Resource Type:']);
            }
            
            const gradeLevelInstance = multiSelectInstances.get(`gradelevel-${requestId}`);
            if (gradeLevelInstance && detailMap['Grade Level:']) {
                gradeLevelInstance.setValues(detailMap['Grade Level:']);
            }
            
            const standardAlignmentInstance = multiSelectInstances.get(`standardalignment-${requestId}`);
            if (standardAlignmentInstance && detailMap['Standard Alignment:']) {
                standardAlignmentInstance.setValues(detailMap['Standard Alignment:']);
            }
            
            const supportedLanguagesInstance = multiSelectInstances.get(`supportedlanguages-${requestId}`);
            if (supportedLanguagesInstance && detailMap['Supported Languages:']) {
                supportedLanguagesInstance.setValues(detailMap['Supported Languages:']);
            }
        }, 100);
    }
}

// Fixed updateSubmissionDisplay function with better error handling
function updateSubmissionDisplay(requestId, data) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    
    if (!submissionCard) {
        console.error('Submission card not found for request:', requestId);
        return;
    }
    
    try {
        // Update title and description
        if (data.ProductName) {
            const titleElement = submissionCard.querySelector('.submission-title');
            if (titleElement) titleElement.textContent = data.ProductName;
        }
        
        if (data.Description) {
            const descriptionElement = submissionCard.querySelector('.submission-description');
            if (descriptionElement) descriptionElement.textContent = data.Description;
        }
        
        // Update detail values
        const detailItems = submissionCard.querySelectorAll('.detail-item');
        
        detailItems.forEach(item => {
            const label = item.querySelector('.detail-label')?.textContent?.trim();
            const valueElement = item.querySelector('.detail-value');
            
            if (label && valueElement) {
                switch (label) {
                    case 'Website:':
                        if (data.Website) {
                            valueElement.innerHTML = `<a href="${data.Website}" target="_blank">${data.Website}</a>`;
                        }
                        break;
                    case 'Topics:':
                        if (data.Topic) valueElement.textContent = data.Topic;
                        break;
                    case 'Resource Type:':
                        if (data.ProductType) valueElement.textContent = data.ProductType;
                        break;
                    case 'Price:':
                        if (data.Price) valueElement.textContent = data.Price;
                        break;
                    case 'Grade Level:':
                        if (data.GradeLevel) valueElement.textContent = data.GradeLevel;
                        break;
                    case 'Standard Alignment:':
                        if (data.StandardAlignment) valueElement.textContent = data.StandardAlignment;
                        break;
                    case 'Supported Languages:':
                        if (data.SupportedLanguages) valueElement.textContent = data.SupportedLanguages;
                        break;
                }
            }
        });
        
        // Update view resource button
        if (data.Website) {
            const viewBtn = submissionCard.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.onclick = () => viewResource(data.Website);
            }
        }
        
        // Update the embedded JSON data for future edits
        const requestDataScript = document.getElementById(`request-data-${requestId}`);
        if (requestDataScript) {
            try {
                const currentData = JSON.parse(requestDataScript.textContent);
                const updatedData = { ...currentData, ...data };
                requestDataScript.textContent = JSON.stringify(updatedData);
            } catch (e) {
                console.warn('Failed to update embedded request data:', e);
            }
        }
        
    } catch (error) {
        console.error('Error updating submission display:', error);
    }
}

// Cancel edit submission
function cancelEditSubmission(requestId) {
    const submissionCard = document.querySelector(`[data-request-id="${requestId}"]`);
    
    if (!submissionCard) {
        console.error('Submission card not found for request:', requestId);
        return;
    }
    
    const detailsSection = submissionCard.querySelector('.submission-details');
    const editForm = submissionCard.querySelector('.edit-submission-form');
    const editBtn = submissionCard.querySelector('.edit-submission-btn');
    
    if (!detailsSection || !editForm || !editBtn) {
        console.error('Required elements not found in submission card');
        return;
    }
    
    // Hide edit form, show details
    editForm.style.display = 'none';
    detailsSection.style.display = 'grid';
    editBtn.textContent = '✏️ Edit Details';
    editBtn.onclick = () => toggleEditSubmission(requestId);
}

// Save submission edit
// Save submission edit



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin portal initialized');
    
    // Initialize any default states
    try {
        // Set initial filter if needed
        const activeTab = document.querySelector('.filter-tab.active');
        if (activeTab) {
            currentFilter = activeTab.textContent.toLowerCase();
        }
        
        // Hide all edit forms initially
        document.querySelectorAll('.edit-submission-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // Hide all comments sections initially
        document.querySelectorAll('.comments-section').forEach(section => {
            section.style.display = 'none';
        });
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});