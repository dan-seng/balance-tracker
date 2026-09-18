// Initialize EmailJS
(function() {
    emailjs.init("n958MS_624QVYtVwT"); // Replace with your EmailJS public key
})();

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    initScrollAnimations();
    // Initialize about carousel
    initAboutCarousel();
    // Initialize slider
    initSlider();
    // Initialize contact form
    initContactForm();
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
            
            // Close mobile menu
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Update active navigation on scroll
    const sections = document.querySelectorAll('section[id]');
    const navObserverOptions = {
        threshold: 0.5,
        rootMargin: '-80px 0px -50% 0px'
    };
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                const currentLink = document.querySelector(`.nav-link[href="#${currentId}"]`);
                
                if (currentLink) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    currentLink.classList.add('active');
                }
            }
        });
    }, navObserverOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Tab functionality for preview section
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Download button animation
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                
                setTimeout(() => {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }, 600);
            }
            
            // Track download (you can add analytics here)
            console.log('Download started');
        });
    }
    
    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Here you would normally send the data to a server
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            showNotification('Message sent successfully! I\'ll get back to you soon.');
            
            // Reset form
            this.reset();
        });
    }
    
        
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .contact-link');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Phone mockup animation
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        let translateY = 0;
        let translateX = 0;
        let rotateX = 0;
        let rotateY = 0;
        
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            translateX = mouseX * 20;
            translateY = mouseY * 20;
            rotateY = mouseX * 10;
            rotateX = -mouseY * 10;
            
            phoneMockup.style.transform = `translateX(${translateX}px) translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        // Reset on mouse leave
        document.addEventListener('mouseleave', function() {
            phoneMockup.style.transform = 'translateX(0) translateY(0) rotateX(0) rotateY(0)';
        });
    }
    
    // Screenshot hover effect
    const screenshots = document.querySelectorAll('.screenshot');
    screenshots.forEach(screenshot => {
        screenshot.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
        });
        
        screenshot.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Parallax effect for hero section
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Counter animation for download stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + '+';
            }
        }, 16);
    }
    
    // Trigger counter animation when download section is visible
    const downloadSection = document.querySelector('.download');
    if (downloadSection) {
        const downloadObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const downloadStat = document.querySelector('.download-stats span:first-child');
                    if (downloadStat && !downloadStat.classList.contains('animated')) {
                        const text = downloadStat.innerHTML;
                        downloadStat.innerHTML = '<i class="fas fa-download"></i> <span class="counter">0</span> Downloads';
                        const counter = downloadStat.querySelector('.counter');
                        animateCounter(counter, 1000);
                        downloadStat.classList.add('animated');
                    }
                }
            });
        }, { threshold: 0.5 });
        
        downloadObserver.observe(downloadSection);
    }
    
    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.transition = 'opacity 0.5s ease';
                this.style.opacity = '1';
            }, 100);
        });
    });
    
    // Add loading state to download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Downloading...</span>';
            this.disabled = true;
            
            // Simulate download completion
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
                showNotification('Download completed! Check your downloads folder.');
            }, 2000);
        });
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll utility
function smoothScrollTo(element, duration = 1000) {
    const targetPosition = element.offsetTop - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Slider functionality
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    const sliderTrack = document.querySelector('.slider-track');
    const imageTitle = document.getElementById('imageTitle');
    const imageDescription = document.getElementById('imageDescription');
    
    let currentSlide = 0;
    let isAnimating = false;
    let autoplayInterval;
    
    // Image information data
    const imageInfo = {
        img1: {
            title: 'Home Screen',
            description: 'Main dashboard with financial overview'
        },
        img2: {
            title: 'Transaction List',
            description: 'View all your income and expenses'
        },
        img3: {
            title: 'Quick Actions',
            description: 'Add transactions with one tap'
        },
        img4: {
            title: 'Spending Analytics',
            description: 'Track your spending patterns over time'
        },
        img5: {
            title: 'Category Breakdown',
            description: 'See where your money goes'
        },
        img6: {
            title: 'Monthly Reports',
            description: 'Detailed monthly financial reports'
        },
        img7: {
            title: 'Security Settings',
            description: 'Advanced security and privacy features'
        },
        img8: {
            title: 'Data Protection',
            description: 'Your financial data is encrypted and secure'
        },
        img9: {
            title: 'Privacy Controls',
            description: 'Complete control over your data'
        },
        img10: {
            title: 'Biometric Login',
            description: 'Secure fingerprint authentication'
        }
    };
    
    // Initialize first slide
    showSlide(0);
    
    // Navigation button handlers
    prevBtn.addEventListener('click', () => {
        if (!isAnimating) {
            goToSlide(currentSlide - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (!isAnimating) {
            goToSlide(currentSlide + 1);
        }
    });
    
    // Indicator click handlers
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (!isAnimating) {
                goToSlide(index);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !isAnimating) {
            goToSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight' && !isAnimating) {
            goToSlide(currentSlide + 1);
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const sliderContainer = document.querySelector('.slider-container');
    
    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                if (!isAnimating) goToSlide(currentSlide + 1);
            } else {
                // Swipe right - previous slide
                if (!isAnimating) goToSlide(currentSlide - 1);
            }
        }
    }
    
    // Show specific slide
    function showSlide(index) {
        // Update slide positions
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
                animateSlideContent(slide);
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.remove('active');
            if (i === index) {
                indicator.classList.add('active');
            }
        });
        
        // Update slider track position
        const offset = -index * 100;
        sliderTrack.style.transform = `translateX(${offset}%)`;
        
        // Update image information
        const slideId = slides[index].getAttribute('data-slide');
        const info = imageInfo[slideId];
        if (info) {
            imageTitle.textContent = info.title;
            imageDescription.textContent = info.description;
        }
        
        currentSlide = index;
    }
    
    // Go to slide with animation
    function goToSlide(index) {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // Wrap around
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Animate out current slide
        const currentSlideElement = slides[currentSlide];
        const currentScreenshots = currentSlideElement.querySelectorAll('.screenshot');
        
        // Animate screenshots out
        currentScreenshots.forEach((screenshot, i) => {
            const delay = i * 0.05;
            setTimeout(() => {
                screenshot.style.opacity = '0';
                screenshot.style.transform = 'translateY(-30px) scale(0.9)';
            }, delay * 1000);
        });
        
        // Wait for out animation, then show new slide
        setTimeout(() => {
            showSlide(index);
            
            // Reset animation flag after new slide animations complete
            setTimeout(() => {
                isAnimating = false;
            }, 800);
        }, 300);
    }
    
    // Animate slide content
    function animateSlideContent(slide) {
        const screenshot = slide.querySelector('.screenshot');
        const imageInfo = slide.querySelector('.image-info');
        
        // Reset screenshot
        if (screenshot) {
            screenshot.style.opacity = '0';
            screenshot.style.transform = 'translateY(40px) scale(0.8) rotate(5deg)';
            
            // Animate screenshot in
            setTimeout(() => {
                screenshot.style.opacity = '1';
                screenshot.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            }, 100);
        }
        
        // Reset and animate image info
        if (imageInfo) {
            imageInfo.style.opacity = '0';
            imageInfo.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                imageInfo.style.opacity = '1';
                imageInfo.style.transform = 'translateY(0)';
            }, 300);
        }
    }
    
    // Autoplay functionality (optional)
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (!isAnimating) {
                goToSlide(currentSlide + 1);
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Pause autoplay on hover
    const slider = document.querySelector('.preview-slider');
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    
    // Start autoplay (comment out if you don't want autoplay)
    // startAutoplay();
    
    // Pause autoplay when user interacts
    [prevBtn, nextBtn, ...indicators].forEach(element => {
        element.addEventListener('click', () => {
            stopAutoplay();
            setTimeout(startAutoplay, 10000); // Resume after 10 seconds
        });
    });
}

// About Carousel
function initAboutCarousel() {
    const slides = document.querySelectorAll('.content-slide');
    const prevBtn = document.getElementById('aboutPrevBtn');
    const nextBtn = document.getElementById('aboutNextBtn');
    const indicators = document.querySelectorAll('.indicator');
    const contentTrack = document.querySelector('.content-track');
    
    let currentSlide = 0;
    let isAnimating = false;
    let autoplayInterval;
    
    // Initialize first slide
    showSlide(0);
    
    // Navigation button handlers
    prevBtn.addEventListener('click', () => {
        if (!isAnimating) {
            goToSlide(currentSlide - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (!isAnimating) {
            goToSlide(currentSlide + 1);
        }
    });
    
    // Indicator click handlers
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (!isAnimating) {
                goToSlide(index);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !isAnimating) {
            goToSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight' && !isAnimating) {
            goToSlide(currentSlide + 1);
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const contentContainer = document.querySelector('.content-container');
    
    contentContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    contentContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                if (!isAnimating) goToSlide(currentSlide + 1);
            } else {
                // Swipe right - previous slide
                if (!isAnimating) goToSlide(currentSlide - 1);
            }
        }
    }
    
    // Show specific slide
    function showSlide(index) {
        // Update slide positions
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
                animateSlideContent(slide);
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.remove('active');
            if (i === index) {
                indicator.classList.add('active');
            }
        });
        
        // Update track position
        const offset = -index * 100;
        contentTrack.style.transform = `translateX(${offset}%)`;
        
        currentSlide = index;
    }
    
    // Go to slide with animation
    function goToSlide(index) {
        if (isAnimating) return;
        
        isAnimating = true;
        
        // Wrap around
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Animate out current slide
        const currentSlideElement = slides[currentSlide];
        const currentContent = currentSlideElement.querySelector('.content-item');
        
        // Animate content out
        if (currentContent) {
            currentContent.style.opacity = '0';
            currentContent.style.transform = 'translateY(20px)';
        }
        
        // Wait for out animation, then show new slide
        setTimeout(() => {
            showSlide(index);
            
            // Reset animation flag after new slide animations complete
            setTimeout(() => {
                isAnimating = false;
            }, 600);
        }, 300);
    }
    
    // Animate slide content
    function animateSlideContent(slide) {
        const content = slide.querySelector('.content-item');
        const title = slide.querySelector('.content-title');
        const description = slide.querySelector('.content-description');
        const features = slide.querySelector('.content-features');
        
        // Reset elements
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
        }
        
        // Animate content in
        setTimeout(() => {
            if (content) {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }
        }, 100);
        
        // Animate other elements with staggered delays
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(15px)';
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 200);
        }
        
        if (description) {
            description.style.opacity = '0';
            description.style.transform = 'translateY(15px)';
            setTimeout(() => {
                description.style.opacity = '1';
                description.style.transform = 'translateY(0)';
            }, 300);
        }
        
        if (features) {
            features.style.opacity = '0';
            features.style.transform = 'translateY(15px)';
            setTimeout(() => {
                features.style.opacity = '1';
                features.style.transform = 'translateY(0)';
            }, 400);
        }
    }
    
    // Autoplay functionality
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (!isAnimating) {
                goToSlide(currentSlide + 1);
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Pause autoplay on hover
    const carousel = document.querySelector('.about-content');
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    // Start autoplay
    startAutoplay();
    
    // Pause autoplay when user interacts
    [prevBtn, nextBtn, ...indicators].forEach(element => {
        element.addEventListener('click', () => {
            stopAutoplay();
            setTimeout(startAutoplay, 10000); // Resume after 10 seconds
        });
    });
}

// Contact Form
function initContactForm() {
    const contactForm = document.querySelector('#contactForm');
    
    console.log('Contact form initialization:', contactForm ? 'Form found' : 'Form not found');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[name="email"]').value,
                message: this.querySelector('textarea[name="message"]').value
            };
            
            console.log('Form data:', formData);
            
            // Validate form
            if (!formData.name || !formData.email || !formData.message) {
                showFormMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                showFormMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Send email using EmailJS
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                message: formData.message,
                to_name: 'Daniel Gidey', // Your name
                reply_to: formData.email // This sets the reply-to field
            };
            
            console.log('Sending email with params:', templateParams);
            
            emailjs.send('service_mxtatll', 'template_tqqc3uz', templateParams)
                .then(function(response) {
                    console.log('Email sent successfully:', response);
                    showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                    contactForm.reset();
                }, function(error) {
                    console.error('EmailJS error:', error);
                    showFormMessage('Failed to send message. Please try again later.', 'error');
                });
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        text-align: center;
        ${type === 'success' ? 
            'background: rgba(80, 250, 123, 0.1); color: #50fa7b; border: 1px solid #50fa7b;' : 
            'background: rgba(255, 85, 85, 0.1); color: #ff5555; border: 1px solid #ff5555;'
        }
    `;
    
    // Insert message after the form
    const contactForm = document.querySelector('#contactForm');
    contactForm.parentNode.insertBefore(messageDiv, contactForm.nextSibling);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-animate-rotate');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}
