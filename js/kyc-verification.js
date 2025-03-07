// KYC Verification JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentStep = 1;
    const totalSteps = 4;
    const uploadedFiles = {};
    
    // Get DOM elements
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    const stepContainers = document.querySelectorAll('.kyc-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const submitButton = document.querySelector('.btn-submit');
    const uploadAreas = document.querySelectorAll('.upload-area');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    // Initialize progress bar
    updateProgress(currentStep);
    
    // Add event listeners to Next buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });
    
    // Add event listeners to Previous buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            goToStep(currentStep - 1);
        });
    });
    
    // Add event listeners to Edit buttons in review step
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepToEdit = parseInt(this.getAttribute('data-step'));
            goToStep(stepToEdit);
        });
    });
    
    // Handle file uploads
    fileInputs.forEach(input => {
        const uploadArea = input.closest('.upload-area');
        const fileNameElement = uploadArea.querySelector('.file-name');
        
        input.addEventListener('change', function(e) {
            handleFileSelect(e, uploadArea, fileNameElement);
        });
    });
    
    // Handle drag and drop for file uploads
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
            
            const fileInput = this.querySelector('input[type="file"]');
            const fileNameElement = this.querySelector('.file-name');
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect({target: fileInput}, this, fileNameElement);
            }
        });
        
        area.addEventListener('click', function() {
            const fileInput = this.querySelector('input[type="file"]');
            fileInput.click();
        });
    });
    
    // Handle form submission
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                // In a real application, this would submit the form data to the server
                // For demo purposes, we'll simulate a successful submission
                simulateSubmission();
            }
        });
    }
    
    // Function to navigate between steps
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        // Hide current step
        stepContainers[currentStep - 1].style.display = 'none';
        progressSteps[currentStep - 1].classList.remove('active');
        
        // Show new step
        stepContainers[step - 1].style.display = 'block';
        progressSteps[step - 1].classList.add('active');
        
        // Mark previous steps as completed
        for (let i = 0; i < step - 1; i++) {
            progressSteps[i].classList.add('completed');
        }
        
        // Update progress bar
        currentStep = step;
        updateProgress(currentStep);
        
        // Scroll to top of the section
        document.querySelector('.kyc-section').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Update review step if navigating to it
        if (currentStep === 4) {
            updateReviewStep();
        }
    }
    
    // Function to update the progress bar
    function updateProgress(step) {
        const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    // Function to validate each step
    function validateStep(step) {
        let isValid = true;
        let errorMsg = '';
        
        switch(step) {
            case 1:
                // Personal Information validation
                const requiredFields = [
                    'firstName', 'lastName', 'dateOfBirth', 
                    'nationality', 'email', 'phone'
                ];
                
                requiredFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (!input.value.trim()) {
                        isValid = false;
                        errorMsg = 'Please fill in all required fields';
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                // Simple email validation
                const emailInput = document.getElementById('email');
                if (emailInput.value && !validateEmail(emailInput.value)) {
                    isValid = false;
                    errorMsg = 'Please enter a valid email address';
                    emailInput.classList.add('error');
                }
                
                break;
                
            case 2:
                // Document verification validation
                const documentType = document.querySelector('input[name="documentType"]:checked');
                if (!documentType) {
                    isValid = false;
                    errorMsg = 'Please select a document type';
                }
                
                const frontDoc = document.getElementById('frontDocument');
                const backDoc = document.getElementById('backDocument');
                
                if (!frontDoc.files || frontDoc.files.length === 0) {
                    isValid = false;
                    errorMsg = 'Please upload the front of your document';
                }
                
                if (!backDoc.files || backDoc.files.length === 0) {
                    isValid = false;
                    errorMsg = 'Please upload the back of your document';
                }
                
                break;
                
            case 3:
                // Address verification validation
                const addressFields = [
                    'address', 'city', 'postalCode', 'country'
                ];
                
                addressFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (!input.value.trim()) {
                        isValid = false;
                        errorMsg = 'Please fill in all address fields';
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                const proofDoc = document.getElementById('addressProof');
                if (!proofDoc.files || proofDoc.files.length === 0) {
                    isValid = false;
                    errorMsg = 'Please upload a proof of address document';
                }
                
                break;
                
            case 4:
                // Review & Submit validation
                const termsCheckbox = document.getElementById('terms');
                const dataCheckbox = document.getElementById('dataProcessing');
                
                if (!termsCheckbox.checked || !dataCheckbox.checked) {
                    isValid = false;
                    errorMsg = 'Please agree to the terms and data processing';
                }
                
                break;
        }
        
        // Display error message if validation fails
        const errorElement = document.querySelector(`.step-${step} .validation-error`);
        if (errorElement) {
            if (!isValid) {
                errorElement.textContent = errorMsg;
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
        
        return isValid;
    }
    
    // Function to validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Function to handle file selection
    function handleFileSelect(event, uploadArea, fileNameElement) {
        const file = event.target.files[0];
        if (file) {
            // Store the file in our uploads object
            uploadedFiles[event.target.id] = file;
            
            // Update UI to show the file has been selected
            uploadArea.classList.add('has-file');
            
            // Display file name if there's an element for it
            if (fileNameElement) {
                fileNameElement.textContent = file.name;
            } else {
                // If no specific element for filename, update the text in the upload area
                const textElement = uploadArea.querySelector('p');
                if (textElement) {
                    textElement.textContent = file.name;
                }
            }
            
            // Update the icon to a check mark
            const svgElement = uploadArea.querySelector('svg');
            if (svgElement) {
                svgElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                `;
            }
        }
    }
    
    // Function to update the review step with collected information
    function updateReviewStep() {
        // Personal Information
        document.getElementById('review-name').textContent = 
            `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
        document.getElementById('review-dob').textContent = 
            document.getElementById('dateOfBirth').value;
        document.getElementById('review-nationality').textContent = 
            document.getElementById('nationality').value;
        document.getElementById('review-email').textContent = 
            document.getElementById('email').value;
        document.getElementById('review-phone').textContent = 
            document.getElementById('phone').value;
        
        // Document Information
        const docType = document.querySelector('input[name="documentType"]:checked');
        if (docType) {
            document.getElementById('review-doc-type').textContent = 
                docType.nextElementSibling.querySelector('.option-label').textContent;
        }
        
        // Address Information
        document.getElementById('review-address').textContent = 
            `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('postalCode').value}, ${document.getElementById('country').value}`;
        
        // Add any state/province if provided
        const state = document.getElementById('state');
        if (state && state.value) {
            document.getElementById('review-address').textContent = 
                document.getElementById('review-address').textContent.replace(
                    document.getElementById('city').value, 
                    `${document.getElementById('city').value}, ${state.value}`
                );
        }
    }
    
    // Function to simulate form submission
    function simulateSubmission() {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Processing... <span class="spinner"></span>';
        
        // Simulate API call with a timeout
        setTimeout(() => {
            // Hide the review step
            stepContainers[currentStep - 1].style.display = 'none';
            
            // Show the success step
            document.querySelector('.success-step').style.display = 'block';
            
            // Mark all steps as completed
            progressSteps.forEach(step => {
                step.classList.add('completed');
            });
            
            // Update progress bar to 100%
            progressFill.style.width = '100%';
            
            // Generate a random verification ID
            const verificationId = generateVerificationId();
            document.getElementById('verification-id').textContent = verificationId;
            
            // Scroll to top of the section
            document.querySelector('.kyc-section').scrollIntoView({
                behavior: 'smooth'
            });
        }, 2000); // Simulate 2 second processing
    }
    
    // Function to generate a random verification ID
    function generateVerificationId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'KYC-';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Initialize the first step
    stepContainers.forEach((container, index) => {
        if (index === 0) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    });
}); 