/**
 * PixelVista - Premium Image Explorer
 * Features:
 * - Glassmorphism UI
 * - Image hover overlays with photographer info
 * - Loading spinner
 * - Back to top button
 * - Smooth scrolling
 */

// Unsplash API configuration
const accessKey = 'VjEiykKdp1Mvfg1zKHugdwLK-OFxlYLcgQ80wKWWSeI'; // Replace with your actual key
let currentPage = 1;
let currentQuery = '';
let isLoading = false;

// DOM elements
const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-box');
const searchResult = document.getElementById('search-result');
const showMoreBtn = document.getElementById('show-more-btn');
const loader = document.getElementById('loader');
const backToTopBtn = document.getElementById('back-to-top');

/**
 * Shows or hides the back-to-top button based on scroll position
 */
function handleScroll() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

/**
 * Scrolls to the top of the page smoothly
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Fetches images from Unsplash API
 * @param {string} query - Search term for images
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} - Array of image objects
 */
async function fetchImages(query, page = 1) {
    try {
        isLoading = true;
        loader.style.display = 'flex'; // Show loading spinner
        
        const response = await fetch(
            `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${accessKey}&per_page=12`
        );
        
        if (!response.ok) throw new Error('Failed to fetch images');
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching images:', error);
        showError('Failed to load images. Please try again later.');
        return [];
    } finally {
        isLoading = false;
        loader.style.display = 'none'; // Hide loading spinner
    }
}

/**
 * Displays an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    searchResult.innerHTML = `
        <div class="no-results glass-card">
            <p>${message}</p>
        </div>
    `;
    showMoreBtn.style.display = 'none';
}

/**
 * Creates the HTML for an image hover overlay
 * @param {Object} image - The Unsplash image object
 * @returns {string} - HTML string for the overlay
 */
function createImageOverlay(image) {
    return `
        <div class="image-overlay">
            <span class="photographer-name">Photo by ${image.user.name}</span>
            <a href="${image.links.download}?force=true" 
               class="download-link" 
               target="_blank" 
               rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </a>
        </div>
    `;
}

/**
 * Displays images in the results container
 * @param {Array} images - Array of image objects from Unsplash
 * @param {boolean} clearPrevious - Whether to clear existing results
 */
function displayImages(images, clearPrevious = true) {
    if (clearPrevious) {
        searchResult.innerHTML = '';
    }
    
    if (images.length === 0 && clearPrevious) {
        showError('No images found. Try a different search term.');
        return;
    }
    
    images.forEach(image => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        
        const imgElement = document.createElement('img');
        imgElement.src = image.urls.regular;
        imgElement.alt = image.alt_description || `Photo by ${image.user.name}`;
        imgElement.loading = 'lazy';
        
        // Create overlay with photographer info and download link
        imgContainer.innerHTML = createImageOverlay(image);
        imgContainer.prepend(imgElement);
        
        searchResult.appendChild(imgContainer);
    });
    
    showMoreBtn.style.display = 'block';
}

// Event listeners
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = searchBox.value.trim();
    if (!query) return;
    
    currentQuery = query;
    currentPage = 1;
    
    const images = await fetchImages(query);
    displayImages(images);
    
    // Smooth scroll to results
    setTimeout(() => {
        searchResult.scrollIntoView({ behavior: 'smooth' });
    }, 100);
});

showMoreBtn.addEventListener('click', async () => {
    if (isLoading) return;
    
    currentPage++;
    const images = await fetchImages(currentQuery, currentPage);
    displayImages(images, false);
    
    // Smooth scroll to new images
    setTimeout(() => {
        showMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
});

backToTopBtn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', handleScroll);

// Initial load with default images
window.addEventListener('DOMContentLoaded', async () => {
    const defaultImages = await fetchImages('premium');
    displayImages(defaultImages);
});