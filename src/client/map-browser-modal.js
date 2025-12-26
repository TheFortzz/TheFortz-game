// Map Browser Modal JavaScript
class MapBrowserModal {
  constructor() {
    // Mock data for the maps (same as TSX version)
    this.mockMaps = [
      { 
        id: 1, 
        name: 'Desert Storm', 
        creator: 'Player123', 
        top: 1, 
        online: 156,
        description: 'An intense desert battlefield with sandstorms and tactical cover points. Perfect for team-based combat.',
        image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop' 
      },
      { 
        id: 2, 
        name: 'Ice Fortress', 
        creator: 'CoolBuilder', 
        top: 2, 
        online: 243,
        description: 'A frozen castle with icy corridors and snowy battlements. Navigate treacherous terrain to victory.',
        image: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400&h=300&fit=crop' 
      },
      { 
        id: 3, 
        name: 'Jungle Temple', 
        creator: 'MapMaster', 
        top: 3, 
        online: 189,
        description: 'Ancient ruins hidden deep in the jungle. Explore mysterious temples and hidden passages.',
        image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop' 
      },
      { 
        id: 4, 
        name: 'Neon City', 
        creator: 'UrbanDesign', 
        top: 4, 
        online: 312,
        description: 'Futuristic urban warfare in a neon-lit metropolis. Fast-paced action across rooftops and streets.',
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop' 
      },
      { 
        id: 5, 
        name: 'Volcano Arena', 
        creator: 'HotMaps', 
        top: 5, 
        online: 198,
        description: 'Fight on the edge of an active volcano. Lava flows create dynamic hazards and strategic opportunities.',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop' 
      },
      { 
        id: 6, 
        name: 'Space Station', 
        creator: 'AstroBuilder', 
        top: 6, 
        online: 267,
        description: 'Zero-gravity combat in an orbiting space station. Master 3D movement to dominate your opponents.',
        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop' 
      },
      { 
        id: 7, 
        name: 'Medieval Castle', 
        creator: 'KnightDesign', 
        top: 7, 
        online: 134,
        description: 'Classic siege warfare in a medieval fortress. Defend the walls or breach the gates.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop' 
      },
      { 
        id: 8, 
        name: 'Underwater Base', 
        creator: 'DeepDiver', 
        top: 8, 
        online: 176,
        description: 'Deep sea combat in a submerged research facility. Water physics add unique tactical challenges.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop' 
      },
    ];

    this.filteredMaps = [...this.mockMaps];
    this.selectedMap = null;
    this.searchQuery = '';
    this.showLeftScroll = false;
    this.showRightScroll = true;

    // DOM elements - Updated to match the actual IDs in index.html
    this.elements = {
      modalOverlay: document.getElementById('mapBrowserModalOverlay'),
      mapBrowserModal: document.getElementById('mapBrowserModal'),
      browseMode: document.getElementById('browseMode'),
      detailMode: document.getElementById('detailMode'),
      searchInput: document.getElementById('searchInput'),
      searchButton: document.getElementById('searchButton'),
      scrollLeftBtn: document.getElementById('scrollLeftBtn'),
      scrollRightBtn: document.getElementById('scrollRightBtn'),
      mapsContainer: document.getElementById('mapsContainer'),
      mapsGrid: document.getElementById('mapsGrid'),
      backButton: document.getElementById('backButton'),
      closeButton: document.getElementById('closeButton'),
      // Detail view elements
      detailMapImage: document.getElementById('detailMapImage'),
      detailMapName: document.getElementById('detailMapName'),
      detailOnlineCount: document.getElementById('detailOnlineCount'),
      detailCreator: document.getElementById('detailCreator'),
      detailRanking: document.getElementById('detailRanking'),
      detailMapDescription: document.getElementById('detailMapDescription'),
      playButton: document.getElementById('playButton')
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderMaps();
    this.checkScroll();
  }

  setupEventListeners() {
    // Search functionality
    this.elements.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterMaps();
      this.renderMaps();
    });

    this.elements.searchButton.addEventListener('click', () => {
      this.elements.searchInput.focus();
    });

    // Scroll functionality
    this.elements.scrollLeftBtn.addEventListener('click', () => {
      this.scrollLeft();
    });

    this.elements.scrollRightBtn.addEventListener('click', () => {
      this.scrollRight();
    });

    this.elements.mapsContainer.addEventListener('scroll', () => {
      this.checkScroll();
    });

    // Detail view navigation
    this.elements.backButton.addEventListener('click', () => {
      this.closeDetails();
    });

    // Close modal
    this.elements.closeButton.addEventListener('click', () => {
      this.closeModal();
    });

    this.elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.closeModal();
      }
    });

    // Play button
    this.elements.playButton.addEventListener('click', () => {
      this.playMap();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.selectedMap) {
          this.closeDetails();
        } else {
          this.closeModal();
        }
      }
    });
  }

  filterMaps() {
    if (!this.searchQuery.trim()) {
      this.filteredMaps = [...this.mockMaps];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredMaps = this.mockMaps.filter((map) => {
        return (
          map.name.toLowerCase().includes(query) ||
          map.creator.toLowerCase().includes(query) ||
          map.description.toLowerCase().includes(query)
        );
      });
    }
  }

  renderMaps() {
    const mapsGrid = this.elements.mapsGrid;
    
    if (this.filteredMaps.length === 0) {
      mapsGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>No maps found</h3>
          <p>Try a different search term</p>
        </div>
      `;
      return;
    }

    mapsGrid.innerHTML = this.filteredMaps.map((map) => `
      <div class="map-card" data-map-id="${map.id}">
        <div class="map-image-container">
          <img src="${map.image}" alt="${map.name}" class="map-image" loading="lazy" />
        </div>
        <div class="map-info">
          <div class="map-name">${map.name}</div>
          <div class="map-meta">
            <span class="map-creator">${map.creator}</span>
            <span class="separator">|</span>
            <span class="map-creator">${map.online} online</span>
            <span class="separator">|</span>
            <span class="map-ranking">Top: ${map.top}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Add click event listeners to map cards
    mapsGrid.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        const mapId = parseInt(card.dataset.mapId);
        const map = this.mockMaps.find(m => m.id === mapId);
        if (map) {
          this.showDetails(map);
        }
      });
    });
  }

  checkScroll() {
    const container = this.elements.mapsContainer;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    this.showLeftScroll = scrollLeft > 10;
    this.showRightScroll = scrollLeft < scrollWidth - clientWidth - 10;

    // Update button visibility
    this.elements.scrollLeftBtn.style.display = this.showLeftScroll ? 'flex' : 'none';
    this.elements.scrollRightBtn.style.display = this.showRightScroll ? 'flex' : 'none';
  }

  scrollLeft() {
    const container = this.elements.mapsContainer;
    container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    const container = this.elements.mapsContainer;
    container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  showDetails(map) {
    this.selectedMap = map;
    
    // Update detail view content
    this.elements.detailMapImage.src = map.image;
    this.elements.detailMapImage.alt = map.name;
    this.elements.detailMapName.textContent = map.name;
    this.elements.detailOnlineCount.textContent = map.online;
    this.elements.detailCreator.textContent = map.creator;
    this.elements.detailRanking.textContent = `Top ${map.top}`;
    this.elements.detailMapDescription.textContent = map.description;

    // Switch to detail view with animation
    this.elements.browseMode.classList.add('hidden');
    this.elements.detailMode.classList.remove('hidden');
  }

  closeDetails() {
    this.selectedMap = null;
    
    // Switch back to browse view
    this.elements.detailMode.classList.add('hidden');
    this.elements.browseMode.classList.remove('hidden');
  }

  playMap() {
    if (this.selectedMap) {
      console.log('Playing map:', this.selectedMap.name);
      
      // Here you would integrate with your actual game system
      // For example: startGame(this.selectedMap);
      
      // Show a notification or close modal
      this.showNotification(`Starting ${this.selectedMap.name}...`);
      
      // Optional: Close modal after a delay
      setTimeout(() => {
        this.closeModal();
      }, 1000);
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-red);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1100;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  openModal() {
    this.elements.modalOverlay.style.display = 'flex';
    // Focus on search input
    setTimeout(() => {
      this.elements.searchInput.focus();
    }, 100);
  }

  closeModal() {
    this.elements.modalOverlay.style.display = 'none';
    this.closeDetails(); // Reset to browse view
    this.searchQuery = '';
    this.elements.searchInput.value = '';
    this.filterMaps();
    this.renderMaps();
  }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize the modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mapBrowserModal = new MapBrowserModal();
  
  // Expose functions globally for integration
  window.openMapBrowserModal = () => {
    window.mapBrowserModal.openModal();
  };
  
  window.closeMapBrowserModal = () => {
    window.mapBrowserModal.closeModal();
  };
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapBrowserModal;
}
