// shared.js

// Function to fetch and inject sidebar, then set up common functionalities
async function loadSidebarAndInit(currentPageName) {
    try {
        // Adjust the path to sidebar.html if js/shared.js is in a subdirectory
        // Assuming sidebar.html is in the root, and js/shared.js is in js/
        // The path from an HTML file in the root to sidebar.html is 'sidebar.html'
        // The path from js/shared.js to sidebar.html would be '../sidebar.html'
        // However, fetch is relative to the HTML document that includes the script.
        // So, 'sidebar.html' is correct if HTML files are in the root.
        const response = await fetch('sidebar.html'); // This will work on GitHub Pages
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching sidebar.html`);
        }
        const sidebarHTML = await response.text();
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (sidebarPlaceholder) {
            sidebarPlaceholder.innerHTML = sidebarHTML;
        } else {
            console.error('Sidebar placeholder div (#sidebar-placeholder) not found in the main HTML.');
            return;
        }
    } catch (error) {
        console.error('Could not load sidebar:', error);
        // Potentially add some fallback or user notification here if sidebar fails to load
        return;
    }

    // Now that sidebar is loaded (or attempted to load), proceed with other initializations
    setupCommonPageFunctionality(currentPageName);

    // Restore sidebar scroll position
    restoreSidebarScrollPosition();

    // Special handling for the webhook page
    if (currentPageName === 'webhook.html') {
        setTimeout(() => {
            const webhookLink = document.querySelector('#sidebar a[href="webhook.html"]');
            if (webhookLink) {
                webhookLink.scrollIntoView({ block: 'center' });
            }
        }, 100);
    }
}

// Function to set up common functionalities after sidebar is loaded
function setupCommonPageFunctionality(currentPageName) {
    setActiveLink(currentPageName);

    window.onscroll = scrollFunction;
    scrollFunction(); // Call once for initial state of back-to-top button

    // Add event listener to save sidebar scroll position before navigating
    document.querySelectorAll('#sidebar-placeholder a').forEach(anchor => {
        anchor.addEventListener('click', saveSidebarScrollPosition);
    });

    // Smooth scroll for anchor links on index.html (e.g., from sidebar to main content sections)
    // This targets links within the loaded sidebar that point to anchors on index.html
    document.querySelectorAll('#sidebar-placeholder a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');
            // Check if the current page is index.html
            if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
                e.preventDefault(); // Prevent navigation if already on index.html
                const targetId = targetHref.substring(targetHref.indexOf('#'));
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                // setActiveLink is also called by the onclick attribute in sidebar.html,
                // but calling it here ensures the state for purely client-side interaction
                // or if the onclick was somehow missed.
                setActiveLink(targetHref);
            }
            // If not on index.html, the link will navigate to index.html normally,
            // and its onload event will call loadSidebarAndInit -> setActiveLink.
        });
    });
}

// Save sidebar scroll position to localStorage
function saveSidebarScrollPosition() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        localStorage.setItem('sidebarScrollPosition', sidebar.scrollTop);
    }
}

// Restore sidebar scroll position from localStorage
function restoreSidebarScrollPosition() {
    const savedPosition = localStorage.getItem('sidebarScrollPosition');
    if (savedPosition !== null) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.scrollTop = parseInt(savedPosition);
        }
    }
}

// Active link functionality (globally available)
function setActiveLink(pageName) {
    const links = document.querySelectorAll('#sidebar-placeholder ul li a'); // Target links within the placeholder
    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        // Match for specific page (e.g., "account.html") or index.html anchors
        if (href === pageName || href === pageName + '.html') {
            link.classList.add('active');
        }
    });
}

// Scroll to top button functionality (globally available)
function scrollFunction() {
    const backToTopButton = document.getElementById("back-to-top");
    if (!backToTopButton) return;

    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}

// Function to scroll to the top of the page (globally available)
function scrollToPageTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 