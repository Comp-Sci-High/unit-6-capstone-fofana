     
        let currentFilter = 'all';

        // Initialize the page when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            loadSubmissions();
            updateStats();
        });

     

        function filterSubmissions(filter) {
            currentFilter = filter;
            
            // Update active tab
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
            
            loadSubmissions();
        }

        function loadSubmissions() {
            const filteredSubmissions = currentFilter === 'all' 
                ? submissions 
                : submissions.filter(sub => sub.status === currentFilter);
            
            const submissionsList = document.getElementById('submissionsList');
            
            if (filteredSubmissions.length === 0) {
                submissionsList.innerHTML = `
                    <div class="empty-state">
                        <h3>No submissions found</h3>
                        <p>There are no ${currentFilter === 'all' ? '' : currentFilter} submissions at the moment.</p>
                    </div>
                `;
                return;
            }
            
            submissionsList.innerHTML = filteredSubmissions.map(submission => `
                <div class="submission-card" data-status="${submission.status}">
                    <div class="submission-header">
                        <div style="flex: 1;">
                            <h3 class="submission-title">${submission.name}</h3>
                            <div class="submission-meta">
                                Submitted by ${submission.submittedBy} on ${formatDate(submission.submittedDate)}
                                <span class="status-badge status-${submission.status}">${submission.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p class="submission-description">${submission.description}</p>
                    
                    <div class="submission-details">
                        <div class="detail-item">
                            <span class="detail-label">Website URL</span>
                            <span class="detail-value">${submission.url}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Resource Type</span>
                            <span class="detail-value">${submission.type}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Price Model</span>
                            <span class="detail-value">${submission.priceModel}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Grade Levels</span>
                            <span class="detail-value">${submission.gradeLevel.join(', ')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Languages/Tools</span>
                            <span class="detail-value">${submission.languages.join(', ')}</span>
                        </div>
                    </div>
                    
                    <div class="submission-actions">
                        <button class="action-btn view-btn" onclick="viewResource('${submission.url}')">
                            🌐 View Resource
                        </button>
                        ${submission.status === 'pending' ? `
                            <button class="action-btn approve-btn" onclick="approveSubmission(${submission.id})">
                                ✅ Approve
                            </button>
                            <button class="action-btn reject-btn" onclick="rejectSubmission(${submission.id})">
                                ❌ Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function approveSubmission(id) {
            const submission = submissions.find(sub => sub.id === id);
            if (submission) {
                submission.status = 'approved';
                updateStats();
                loadSubmissions();
                showNotification(`"${submission.name}" has been approved!`, 'success');
            }
        }

        function rejectSubmission(id) {
            const reason = prompt('Please provide a reason for rejection (optional):');
            const submission = submissions.find(sub => sub.id === id);
            if (submission) {
                submission.status = 'rejected';
                submission.rejectionReason = reason;
                updateStats();
                loadSubmissions();
                showNotification(`"${submission.name}" has been rejected.`, 'error');
            }
        }

        function viewResource(url) {
            window.open(url, '_blank');
        }

        function updateStats() {
            const pending = submissions.filter(sub => sub.status === 'pending').length;
            const approved = submissions.filter(sub => sub.status === 'approved').length;
            const rejected = submissions.filter(sub => sub.status === 'rejected').length;
            const total = submissions.length;
            
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('approvedCount').textContent = approved;
            document.getElementById('rejectedCount').textContent = rejected;
            document.getElementById('totalCount').textContent = total;
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }


 function logout() {
  localStorage.removeItem('isAuthenticated'); // or sessionStorage
}