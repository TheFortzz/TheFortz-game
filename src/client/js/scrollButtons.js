// Scroll Buttons Functionality

function initScrollButtons() {
    const scrollButtons = document.querySelectorAll('.scroll-btn');

    scrollButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const container = document.getElementById(targetId);

            if (!container) return;

            const scrollAmount = 300;
            const direction = this.classList.contains('scroll-btn-left') ? -1 : 1;

            container.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth'
            });

            // Update button visibility after scroll
            setTimeout(() => updateScrollButtonVisibility(container), 300);
        });
    });

    // Initialize visibility for all scroll containers
    document.querySelectorAll('.shop-items-grid').forEach(container => {
        updateScrollButtonVisibility(container);

        // Update on scroll
        container.addEventListener('scroll', () => {
            updateScrollButtonVisibility(container);
        });
    });
}

function updateScrollButtonVisibility(container) {
    if (!container) return;

    const containerId = container.id;
    const leftBtn = document.querySelector(`.scroll-btn-left[data-target="${containerId}"]`);
    const rightBtn = document.querySelector(`.scroll-btn-right[data-target="${containerId}"]`);

    if (!leftBtn || !rightBtn) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Hide left button if at start
    if (scrollLeft <= 5) {
        leftBtn.classList.add('hidden');
    } else {
        leftBtn.classList.remove('hidden');
    }

    // Hide right button if at end or no scroll needed
    if (scrollLeft >= maxScroll - 5 || maxScroll <= 0) {
        rightBtn.classList.add('hidden');
    } else {
        rightBtn.classList.remove('hidden');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollButtons);
} else {
    initScrollButtons();
}

// Export functions
window.initScrollButtons = initScrollButtons;
window.updateScrollButtonVisibility = updateScrollButtonVisibility;
