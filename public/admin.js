        let currentFilter = 'all';

        function filterSubmissions(event, filter) {
            event.preventDefault();
            currentFilter = filter;
            
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
            
            const submissions = document.querySelectorAll('.submission-card');
            submissions.forEach(card => {
                const status = card.getAttribute('data-status');
                if (filter === 'all' || status === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            const visibleSubmissions = Array.from(submissions).filter(card => 
                card.style.display !== 'none'
            );

            const submissionsList = document.getElementById('submissionsList');
            if (visibleSubmissions.length === 0) {
                submissions.forEach(card => card.style.display = 'none');
                
                const existingEmptyState = submissionsList.querySelector('.empty-state');
                if (existingEmptyState) {
                    existingEmptyState.remove();
                }
                
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <h3>No submissions found</h3>
                    <p>There are no ${filter === 'all' ? '' : filter} submissions at the moment.</p>
                `;
                submissionsList.appendChild(emptyState);
            } else {
                const existingEmptyState = submissionsList.querySelector('.empty-state');
                if (existingEmptyState) {
                    existingEmptyState.remove();
                }
            }
        }

        async function approveSubmission(id) {
            try {
                const response = await fetch(`/approve/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to approve submission');

                const card = document.querySelector(`[onclick*="${id}"]`).closest('.submission-card');
                const statusBadge = card.querySelector('.status-badge');
                statusBadge.textContent = 'Approved';
                statusBadge.className = 'status-badge status-approved';
                card.setAttribute('data-status', 'approved');

                updateStatsAfterAction();
                showNotification('Submission approved successfully!', 'success');
            } catch (error) {
                console.error('Error approving submission:', error);
                showNotification('Failed to approve submission', 'error');
            }
        }

        async function rejectSubmission(id) {
            try {
                const response = await fetch(`/disapprove/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to reject submission');

                const card = document.querySelector(`[onclick*="${id}"]`).closest('.submission-card');
                const statusBadge = card.querySelector('.status-badge');
                statusBadge.textContent = 'Rejected';
                statusBadge.className = 'status-badge status-rejected';
                card.setAttribute('data-status', 'rejected');

                updateStatsAfterAction();
                showNotification('Submission rejected successfully!', 'success');
            } catch (error) {
                console.error('Error rejecting submission:', error);
                showNotification('Failed to reject submission', 'error');
            }
        }

        function updateStatsAfterAction() {
            const allCards = document.querySelectorAll('.submission-card');
            const pending = Array.from(allCards).filter(card => card.getAttribute('data-status') === 'pending').length;
            const approved = Array.from(allCards).filter(card => card.getAttribute('data-status') === 'approved').length;
            const rejected = Array.from(allCards).filter(card => card.getAttribute('data-status') === 'rejected').length;
            
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('approvedCount').textContent = approved;
            document.getElementById('rejectedCount').textContent = rejected;
        }

        function viewResource(url) {
            window.open(url, '_blank');
        }

        function showNotification(message, type) {
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
            
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        function logout() {
    localStorage.clear();
    sessionStorage.clear();
    
    window.location.href = '/';
}
        async function deleteRequest(id) {
    await fetch('/delete/' + id, {method: 'DELETE'});
    window.location.href = "/"
   }