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


  // script.js - Resource Click Handling
document.addEventListener('DOMContentLoaded', function() {
    // Click handler for resource cards
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on a button inside the card
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            const resourceId = this.dataset.id;
            window.location.href = `/resource/${resourceId}`;
        });
    });

    // View Details button handler
    document.querySelectorAll('.resource-card .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const resourceId = this.closest('.resource-card').dataset.id;
            window.location.href = `/resource/${resourceId}`;
        });
    });

    // Save Resource button handler
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const resourceId = this.dataset.resourceId;
            
            try {
                const response = await fetch('/api/save-resource', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resourceId })
                });
                
                if (response.ok) {
                    this.textContent = 'Saved!';
                    this.classList.add('saved');
                }
            } catch (error) {
                console.error('Error saving resource:', error);
            }
        });
    });

    // Pagination handling
    document.querySelectorAll('.pagination-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            const currentPage = document.querySelector('.pagination-item.active');
            currentPage.classList.remove('active');
            this.classList.add('active');
            
            // Implement pagination logic here
            const page = this.textContent;
            if (page === '← Previous') {
                // Previous page logic
            } else if (page === 'Next →') {
                // Next page logic
            } else {
                // Specific page number
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    
    
    // Click on resource cards (for all pages)
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on a button or link inside the card
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            
            const resourceId = this.dataset.id;
            window.location.href = `/resource/${resourceId}`;
        });
    });
    
    document.querySelectorAll('.save-resource').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const resourceId = this.dataset.id;
            
            try {
                const response = await fetch('/api/save-resource', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resourceId })
                });
                
                if (response.ok) {
                    this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    this.classList.add('saved');
                }
            } catch (error) {
                console.error('Error saving resource:', error);
            }
        });
    });
  
    if (document.querySelector('.resource-library')) {
        // Filter functionality
        const searchInput = document.getElementById('resource-search');
        const gradeFilter = document.getElementById('grade-filter');
        const typeFilter = document.getElementById('type-filter');
        
        function filterResources() {
            const searchTerm = searchInput.value.toLowerCase();
            const gradeValue = gradeFilter.value;
            const typeValue = typeFilter.value;
            
            document.querySelectorAll('.resource-card').forEach(card => {
                const matchesSearch = card.dataset.name.includes(searchTerm);
                const matchesGrade = !gradeValue || card.dataset.grade.includes(gradeValue);
                const matchesType = !typeValue || card.dataset.type === typeValue;
                
                card.style.display = (matchesSearch && matchesGrade && matchesType) ? 'block' : 'none';
            });
        }
        
        searchInput.addEventListener('input', filterResources);
        gradeFilter.addEventListener('change', filterResources);
        typeFilter.addEventListener('change', filterResources);
    }
    
  
    if (document.querySelector('.resource-detail')) {
        // Star rating for reviews
        const stars = document.querySelectorAll('.star-rating .fa-star');
        let selectedRating = 0;
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                selectedRating = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
        
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                if (selectedRating === 0) {
                    alert('Please select a rating');
                    return;
                }
                
                const comment = this.querySelector('textarea').value;
                const resourceId = window.location.pathname.split('/').pop();
                
                try {
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            resourceId,
                            rating: selectedRating,
                            comment
                        })
                    });
                    
                    if (response.ok) {
                        window.location.reload(); // Refresh to show new review
                    }
                } catch (error) {
                    console.error('Error submitting review:', error);
                }
            });
        }
    }
    
  
    if (document.getElementById('resource-submission-form')) {
        const form = document.getElementById('resource-submission-form');
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                name: form.querySelector('#product-name').value,
                website: form.querySelector('#website-url').value,
                description: form.querySelector('#description').value,
                type: form.querySelector('#product-type').value,
                price: form.querySelector('#price-model').value,
                grades: Array.from(form.querySelectorAll('input[name="gradeLevel"]:checked')).map(el => el.value),
                languages: Array.from(form.querySelectorAll('input[name="languages"]:checked')).map(el => el.value)
            };
            
            // Basic validation
            if (!formData.name || !formData.website || !formData.description) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                const response = await fetch('/api/resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    alert('Resource submitted successfully! It will be reviewed by our team.');
                    form.reset();
                }
            } catch (error) {
                console.error('Error submitting resource:', error);
                alert('There was an error submitting your resource. Please try again.');
            }
        });
    }
});
     // Basic form functionality
        document.getElementById('resource-submission-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            
            // Handle regular fields
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            
            // Handle checkboxes
            const gradeLevels = [];
            const languages = [];
            
            document.querySelectorAll('input[name="gradeLevel"]:checked').forEach(cb => {
                gradeLevels.push(cb.value);
            });
            
            document.querySelectorAll('input[name="languages"]:checked').forEach(cb => {
                languages.push(cb.value);
            });
            
            data.gradeLevel = gradeLevels;
            data.languages = languages;
            
            console.log('Form submitted with data:', data);
            alert('Resource submitted successfully! (This is a demo - data logged to console)');
        });

        // Clear form functionality
        document.querySelector('button[type="reset"]').addEventListener('click', function() {
            setTimeout(() => {
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                });
            }, 0);
        });