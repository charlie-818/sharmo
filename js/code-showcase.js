function copyCode() {
    const code = document.querySelector('.code-content').textContent;
    const copyBtn = document.querySelector('.copy-btn');
    
    navigator.clipboard.writeText(code)
        .then(() => {
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#1ed760';
            copyBtn.style.transform = 'translateY(-1px)';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.style.background = '';
                copyBtn.style.transform = '';
            }, 2000);
        })
        .catch(err => {
            copyBtn.textContent = 'Error!';
            copyBtn.style.background = '#ff4444';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.style.background = '';
            }, 2000);
        });
} 