document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
        headerContainer.innerHTML = `
        <header class="site-header">
            <div class="header-inner">
                <div class="logo">
                    <a href="/index.html">
                        <img src="/img/logo.png" alt="Sharmo Logo">
                    </a>
                </div>
                
                <nav class="main-nav">
                    <ul>
                        <li><a href="/index.html">Home</a></li>
                        <li><a href="/news.html">News</a></li>
                        <li class="active"><a href="/knowledge-hub.html">Knowledge Hub</a></li>
                        <li><a href="/about.html">About</a></li>
                        <li><a href="/contact.html">Contact</a></li>
                    </ul>
                </nav>
                
                <div class="mobile-menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
        `;
    }
}); 