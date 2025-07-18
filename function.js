async function loadSection(sectionId, filePath) {
    const section = document.getElementById(sectionId);
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}: ${response.status}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error(error);
        section.innerHTML = `<p>Error loading section: ${filePath}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSection('contact', 'contact.htmls');
    loadSection('therapy', 'therapy.htmls');
    loadSection('about', 'aboutme.top.html');
    loadSection('about-me-more', 'aboutme.more.html');
    loadSection('yoga', 'yoga.htmls');
    loadSection('gallery', 'gallery.html');
    setTimeout(loadGallery, 500); // Load gallery with a small delay to ensure section is loaded
}
);

// Smooth scrolling for section navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Function to collapse the mobile menu
function collapseMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.remove('visible'); // Ensure the menu is hidden
}

// Toggle mobile menu visibility
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('visible');
});

// Toggle "about" section visibility
/* const aboutToggle = document.getElementById('about-toggle');
const aboutFull = document.getElementById('about-full');
const aboutSummary = document.getElementById('about-summary');

aboutToggle.addEventListener('click', () => {
    if (aboutFull.style.display === 'none') {
        aboutFull.style.display = 'block';
        aboutSummary.style.display = 'none';
        aboutToggle.textContent = 'Zobrazit méně';
    } else {
        aboutFull.style.display = 'none';
        aboutSummary.style.display = 'block';
        aboutToggle.textContent = 'Zobrazit více';
    }
}); */

// Load references from JSON file
async function loadReferences() {
    const carouselItems = document.getElementById('carousel-items');
    try {
        const response = await fetch('references.json');
        if (!response.ok) throw new Error(`Failed to fetch references: ${response.status}`);
        const references = await response.json();
        if (references.length === 0) {
            carouselItems.innerHTML = '<p>No references available.</p>';
            return;
        }
        references.forEach(reference => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.innerHTML = `<p>${reference.text}</p><i>${reference.author}</i>`;
            carouselItems.appendChild(item);
        });
        updateCarousel();
    } catch (error) {
        console.error('Error loading references:', error);
        carouselItems.innerHTML = '<p>Error loading references. Please try again later.</p>';
    }
}

// Carousel functionality
const carousel = document.getElementById('carousel-items');
const leftButton = document.getElementById('carousel-left');
const rightButton = document.getElementById('carousel-right');
let currentIndex = 0;

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        item.style.display = index === currentIndex ? 'block' : 'none';
    });
}

leftButton.addEventListener('click', () => {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
});

rightButton.addEventListener('click', () => {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
});

// Swipe functionality for mobile
let startX = 0;
carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

carousel.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const items = document.querySelectorAll('.carousel-item');
    if (startX - endX > 50) {
        currentIndex = (currentIndex + 1) % items.length;
    } else if (endX - startX > 50) {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
    }
    updateCarousel();
});

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    loadReferences();
    setupTreeAnimation();
});

// Setup tree animation with intersection observer
function setupTreeAnimation() {
    const tree = document.getElementById('tree-img');
    const treeBox = document.getElementById('tree-box');
    const homeSection = document.getElementById('home');
    
    // Simple gentle swaying animation for the tree
    if (tree) {
        setInterval(() => {
            const randomRotation = Math.sin(Date.now() / 3000) * 1.5; // Gentle swaying
            tree.style.transform = `rotate(${randomRotation}deg)`;
        }, 100);
    }
    
    // Setup intersection observer to hide tree when scrolling out of home section
    if (homeSection && treeBox) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Home section is visible
                    treeBox.style.opacity = '1';
                } else {
                    // Home section is not visible
                    treeBox.style.opacity = '0';
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the section is visible
        
        observer.observe(homeSection);
    }
}

// Global gallery variables
let allGalleryImages = [];
let loadedImagesCount = 0;
const imagesPerLoad = 6;

// Gallery functionality
async function loadGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    const loadMoreButton = document.getElementById('load-more-images');
    
    if (!galleryContainer) return;
    
    try {
        // Fetch the list of image files from the gallery directory
        const response = await fetch('gallery/index.json');
        if (!response.ok) {
            // If no index.json exists, try to list directory contents
            loadGalleryFallback();
            return;
        }
        
        allGalleryImages = await response.json();
        
        if (allGalleryImages.length === 0) {
            galleryContainer.innerHTML = '<p>Žádné obrázky nejsou k dispozici.</p>';
            return;
        }
        
        // Initial load - display only the first few images
        loadMoreGalleryImages();
        
        // Setup the "Load more" button
        if (loadMoreButton) {
            if (loadedImagesCount >= allGalleryImages.length) {
                loadMoreButton.style.display = 'none';
            } else {
                loadMoreButton.addEventListener('click', loadMoreGalleryImages);
            }
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        loadGalleryFallback();
    }
}

// Function to load more images when the user clicks the button
function loadMoreGalleryImages() {
    const galleryContainer = document.getElementById('gallery-container');
    const loadMoreButton = document.getElementById('load-more-images');
    const galleryLoader = document.getElementById('gallery-loader');
    
    if (!galleryContainer) return;
    
    // Show loading message
    if (galleryLoader) galleryLoader.style.display = 'block';
    
    // Get next batch of images
    const nextImages = allGalleryImages.slice(loadedImagesCount, loadedImagesCount + imagesPerLoad);
    loadedImagesCount += nextImages.length;
    
    // Create thumbnail HTML for the next batch
    const newImagesHTML = nextImages.map((image, index) => {
        // Use smaller thumbnail version for initial loading
        const thumbnailPath = image.thumbnail || `gallery/thumbnails/${image.filename}`;
        const fullImagePath = `gallery/${image.filename}`;
        
        return `
            <div class="gallery-item">
                <img src="${thumbnailPath}" 
                     data-full-image="${fullImagePath}"
                     alt="${image.title || ''}" 
                     loading="lazy"
                     onclick="openLightbox('${fullImagePath}', '${image.title || ''}')">
                <div class="gallery-caption">${image.title || ''}</div>
            </div>
        `;
    }).join('');
    
    // Append new images to container
    galleryContainer.insertAdjacentHTML('beforeend', newImagesHTML);
    
    // Hide loading message
    if (galleryLoader) galleryLoader.style.display = 'none';
    
    // Hide "Load more" button if all images are loaded
    if (loadMoreButton && loadedImagesCount >= allGalleryImages.length) {
        loadMoreButton.style.display = 'none';
    }
}

// Fallback method if no index.json exists
function loadGalleryFallback() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;
    
    // Common image extensions
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Create a message for users
    galleryContainer.innerHTML = `
        <div class="gallery-message">
            <p>Pro zobrazení galerie je potřeba vytvořit složku "gallery" s obrázky a soubor gallery/index.json.</p>
            <p>Formát souboru index.json:</p>
            <pre>
[
  {
    "filename": "image1.jpg",
    "title": "Popis prvního obrázku"
  },
  {
    "filename": "image2.jpg",
    "title": "Popis druhého obrázku"
  }
]</pre>
        </div>
    `;
}

// Lightbox functionality for gallery images
function openLightbox(imageSrc, imageTitle) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    const lightboxContent = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imageSrc}" alt="${imageTitle}">
            ${imageTitle ? `<div class="lightbox-caption">${imageTitle}</div>` : ''}
        </div>
    `;
    
    lightbox.innerHTML = lightboxContent;
    document.body.appendChild(lightbox);
    
    // Close lightbox when clicking the close button or outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.className === 'lightbox-close') {
            document.body.removeChild(lightbox);
        }
    });
}
