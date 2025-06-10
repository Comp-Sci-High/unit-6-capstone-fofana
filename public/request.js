 const createForm = document.querySelector("form")
createForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const formData = new formData(form);
    const reqBody = object.fromEntries(formData)

    const response = await fetch("/request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody)

    })
    window.location.href = "/"

    const data = await response.json()
    console.log(data)
})

document.getElementById('resource-submission-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        ProductName: document.getElementById('product-name').value,
        Website: document.getElementById('website-url').value,
        ProductType: document.getElementById('product-type').value,
        Description: document.getElementById('description').value,
        Price: document.getElementById('price-model').value,
        GradeLevel: Array.from(document.querySelectorAll('input[name="gradeLevel"]:checked')).map(el => el.value).join(', '),
        StandardAlignment: document.getElementById('standard-alignment').value,
        SupportedLanguages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(el => el.value).join(', '),
        isApproved: false // Set to false for admin approval
    };

    try {
        const response = await fetch('/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Resource submitted successfully! It will be reviewed by our team.');
            window.location.href = '/library'; // Redirect to library
        } else {
            alert('Submission failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during submission.');
    }
});