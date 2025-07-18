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
