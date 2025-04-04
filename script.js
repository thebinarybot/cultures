document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const landingSection = document.getElementById('landing');
    const entryDoor = document.getElementById('entry-door');
    const exhibitionSpace = document.getElementById('exhibition-space');
    const wallsContainer = document.querySelector('.walls-container');
    const walls = document.querySelectorAll('.wall');
    const prevButton = document.getElementById('nav-prev');
    const nextButton = document.getElementById('nav-next');
    // const photoFrames = document.querySelectorAll('.photo-container .photo-frame');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxButton = document.querySelector('.close-lightbox');
    const minimap = document.getElementById('minimap');
    // const returnHomeButtons = document.querySelectorAll('.return-home-btn'); // Get all return buttons
    const homeButton = document.getElementById('return-home-btn'); // Get single home button
    const stickyWallButton = document.getElementById('sticky-wall-btn'); // Get sticky wall button
    const photoFrames = document.querySelectorAll('.photo-container .photo-frame'); // Keep this
    const stickyWallId = 'wall-5';

    // Modal Elements
    const aboutLink = document.getElementById('about-link');
    const refreshmentsLink = document.getElementById('refreshments-link');
    const aboutModal = document.getElementById('about-modal');
    const refreshmentsModal = document.getElementById('refreshments-modal');
    const allModals = document.querySelectorAll('.modal');
    const closeModalButtons = document.querySelectorAll('[data-close-modal]'); // Use data attribute selector
    const currentDateTimeSpan = document.getElementById('current-datetime'); // Span for date/time


    // --- State Variables ---
    let currentWallIndex = 0;
    const totalWalls = walls.length;
    let mapIndicators = [];
    let lastFocusedElement = null; // For returning focus after modal closes

    // --- Minimap Functions ---
    function createMinimap() {
        minimap.innerHTML = '';
        mapIndicators = [];
        for (let i = 0; i < totalWalls; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('map-indicator');
            indicator.dataset.index = i;
            minimap.appendChild(indicator);
            mapIndicators.push(indicator);
        }
        // Initial state update happens on entering exhibition
    }

    function updateMinimap() {
        mapIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentWallIndex);
        });
    }

    // --- Date/Time Function ---
    function updateDateTime() {
        if (currentDateTimeSpan) {
             const now = new Date();
             // Use Intl.DateTimeFormat for better localization if needed
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
             currentDateTimeSpan.textContent = now.toLocaleDateString('en-IE', options) + ' ' + now.toLocaleTimeString('en-IE');
        }
    }


    // --- Core Navigation & State ---
    function enterExhibition() {
        if (!landingSection.classList.contains('hidden')) { // Only proceed if landing is visible
            entryDoor.classList.add('opening');
            landingSection.style.opacity = '0';
             // Prevent interaction with landing elements during transition
            landingSection.style.pointerEvents = 'none';


            setTimeout(() => {
                landingSection.classList.add('hidden');
            }, 500);

            const transitionDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed') || '0.6s') * 1000;

            setTimeout(() => {
                exhibitionSpace.classList.remove('hidden');
                exhibitionSpace.classList.add('visible');
                minimap.classList.remove('hidden');
                minimap.classList.add('visible');
                initializeExhibitionState(); // Set initial wall/nav/map state
                entryDoor.blur(); // Remove focus from door
            }, transitionDuration);
        }
    }

    function returnToHome() {
        // Hide exhibition with transition
        exhibitionSpace.classList.remove('visible');
        minimap.classList.remove('visible');

        // Wait for fade out before resetting
        const transitionDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed') || '0.6s') * 1000;
        setTimeout(() => {
            exhibitionSpace.classList.add('hidden');
            minimap.classList.add('hidden');

            // Show landing
            landingSection.classList.remove('hidden');
             // Ensure landing opacity and interaction are restored
            landingSection.style.opacity = '1';
            landingSection.style.pointerEvents = 'auto';

            // Reset door (visual only)
            entryDoor.classList.remove('opening');

            // Reset wall positions and index
            initializeExhibitionState(); // Use the combined init function

        }, transitionDuration);
    }

     function initializeWallPositions() {
         walls.forEach((wall, index) => {
            wall.classList.remove('active', 'previous', 'next');
            if (index === 0) {
                wall.classList.add('active');
                wall.style.transform = 'translateX(0)';
            } else {
                wall.classList.add('next');
                wall.style.transform = 'translateX(100%)';
            }
        });
     }

     function initializeExhibitionState(setActiveWallIndex = 0) {
        currentWallIndex = setActiveWallIndex; // Set the desired starting wall index
        walls.forEach((wall, index) => {
            wall.classList.remove('active', 'previous', 'next');
            let transformValue = '';
            if (index === currentWallIndex) {
                wall.classList.add('active');
                transformValue = 'translateX(0)';
            } else if (index < currentWallIndex) {
                wall.classList.add('previous');
                transformValue = 'translateX(-100%)';
            } else {
                wall.classList.add('next');
                transformValue = 'translateX(100%)';
            }
            wall.style.transform = transformValue; // Apply transform directly
        });
        updateNavigation(); // Update arrow states
        if (minimap && typeof updateMinimap === 'function') { // Ensure minimap is ready
             updateMinimap(); // Update map state
        }
    }

    function navigateWall(direction) {
        const targetIndex = currentWallIndex + direction;
        // Use goToWall for actual navigation logic
        goToWall(targetIndex);
    }

    // New function to navigate directly to a specific wall index
    function goToWall(targetIndex) {
        // Clamp index to valid range
        targetIndex = Math.max(0, Math.min(targetIndex, totalWalls - 1));

        if (currentWallIndex !== targetIndex) {
            currentWallIndex = targetIndex; // Update the current index

            // Update classes and transforms for all walls
            walls.forEach((wall, index) => {
                wall.classList.remove('active', 'previous', 'next');
                let transformValue = '';
                if (index === currentWallIndex) {
                    wall.classList.add('active');
                    transformValue = 'translateX(0)';
                } else if (index < currentWallIndex) {
                    wall.classList.add('previous');
                    transformValue = 'translateX(-100%)';
                } else {
                    wall.classList.add('next');
                    transformValue = 'translateX(100%)';
                }
                wall.style.transform = transformValue; // Apply transform
            });

            // Update navigation buttons and minimap
            updateNavigation();
            updateMinimap();
        }
         // else: Already on the target wall, do nothing.
    }



    function updateNavigation() {
        prevButton.disabled = currentWallIndex === 0;
        nextButton.disabled = currentWallIndex === totalWalls - 1;
        prevButton.setAttribute('tabindex', prevButton.disabled ? '-1' : '0');
        nextButton.setAttribute('tabindex', nextButton.disabled ? '-1' : '0');
    }


    // --- Lightbox Functions ---
    function openLightbox(frame) {
        const img = frame.querySelector('img');
        if (img) {
            lastFocusedElement = document.activeElement; // Store focus
            lightboxImage.src = img.src;
            lightboxCaption.textContent = img.alt;
            lightbox.classList.remove('hidden');
            lightbox.classList.add('visible');
            document.body.style.overflow = 'hidden';
            closeLightboxButton.focus(); // Focus close button
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImage.src = "";
            lightboxCaption.textContent = "";
            document.body.style.overflow = '';
            if (lastFocusedElement) lastFocusedElement.focus(); // Return focus
        }, 400);
    }

    // --- Modal Functions ---
    function openModal(modalElement) {
        if (!modalElement) return;
        lastFocusedElement = document.activeElement; // Store focus
        modalElement.classList.remove('hidden');
        modalElement.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        // Focus the close button or the modal container for accessibility
        modalElement.querySelector('.modal-close-btn, .modal-content').focus();
        // Update date/time if opening About modal
        if(modalElement.id === 'about-modal') {
            updateDateTime();
        }
    }

    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('visible');
         setTimeout(() => { // Wait for transition before hiding
             modalElement.classList.add('hidden');
             // Only restore body scrolling if no *other* modals/lightbox are open
             if (!document.querySelector('.modal.visible, .lightbox.visible')) {
                document.body.style.overflow = '';
             }
            if (lastFocusedElement) lastFocusedElement.focus(); // Return focus
        }, 400); // Match CSS transition time
    }

    // --- Event Listeners ---
    entryDoor.addEventListener('click', enterExhibition);
    entryDoor.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterExhibition(); }});

     // Single Home button listener
     homeButton.addEventListener('click', returnToHome);

     // Sticky Wall button listener
    stickyWallButton.addEventListener('click', () => {
        // Find the index of the sticky wall
        const stickyWallIndex = Array.from(walls).findIndex(wall => wall.id === stickyWallId);
        if (stickyWallIndex !== -1) {
            goToWall(stickyWallIndex); // Use the new function
        } else {
            console.warn(`Wall with ID '${stickyWallId}' not found.`);
        }
    });

    prevButton.addEventListener('click', () => navigateWall(-1));
    nextButton.addEventListener('click', () => navigateWall(1));

    //returnHomeButtons.forEach(button => {
    //    button.addEventListener('click', returnToHome);
    //});

    photoFrames.forEach(frame => {
        frame.addEventListener('click', () => openLightbox(frame));
        frame.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(frame); }});
    });

    closeLightboxButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // Modal Triggers
    aboutLink.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); });
    refreshmentsLink.addEventListener('click', (e) => { e.preventDefault(); openModal(refreshmentsModal); });

    // Modal Closing (using event delegation on the document or specific listeners)
     closeModalButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            // Find the closest parent modal and close it
            const modalToClose = e.target.closest('.modal');
             closeModal(modalToClose);
         });
     });
     // Optionally close modal on Escape key
     document.addEventListener('keydown', (e) => {
         if (e.key === 'Escape') {
             const visibleModal = document.querySelector('.modal.visible');
             const visibleLightbox = document.querySelector('.lightbox.visible');
             if (visibleModal) {
                 closeModal(visibleModal);
             } else if (visibleLightbox) {
                 closeLightbox();
             }
         }
     });

    // Modal Logic
    document.addEventListener("DOMContentLoaded", function () {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("modal-img");
        const captionText = document.getElementById("caption");
        const closeBtn = modal.querySelector(".close");
    
        // Attach click event to all exhibition images
        document.querySelectorAll('.exhibition-image').forEach(img => {
        img.addEventListener('click', function () {
            modal.classList.remove("hidden");
            modalImg.src = this.src;
            captionText.textContent = this.alt || "Photo";
        });
        });
    
        closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        });
    
        // Optional: click outside to close
        modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
        });
    });

    // --- Initialization ---
    function initialize() {
        createMinimap();
        initializeWallPositions(); // Set initial positions but don't show yet
        updateNavigation(); // Set initial button states
        // Initial Date/Time update isn't strictly needed until modal opens
    }

    initialize(); // Run setup on page load

}); // End DOMContentLoaded