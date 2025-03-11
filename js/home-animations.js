// Home Page Animations and Effects

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js for background effects
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 40,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#6366f1"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 0.5,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#8b5cf6",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.6
                        }
                    },
                    "push": {
                        "particles_nb": 3
                    }
                }
            },
            "retina_detect": true
        });
    } else {
        console.warn('particles.js is not loaded');
    }

    // Animate property card
    const propertyCard = document.querySelector('.floating-property-card');
    if (propertyCard) {
        // Add 3D tilt effect
        propertyCard.addEventListener('mousemove', function(e) {
            const card = this.getBoundingClientRect();
            const centerX = card.left + card.width / 2;
            const centerY = card.top + card.height / 2;
            const posX = e.clientX - centerX;
            const posY = e.clientY - centerY;
            
            const rotateX = posY * -0.05;
            const rotateY = posX * 0.05;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        propertyCard.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            this.style.transition = 'transform 0.5s ease';
        });
    }

    // Animate counters
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the faster
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const isFloat = target.toString().includes('.');
        const decimals = isFloat ? (target.toString().split('.')[1] || '').length : 0;
        
        const updateCount = () => {
            const count = parseFloat(counter.innerText.replace(/[^\d.-]/g, '')) || 0;
            const increment = target / speed;
            
            if (count < target) {
                let newValue = count + increment;
                if (newValue > target) newValue = target;
                
                counter.innerText = `${prefix}${isFloat ? newValue.toFixed(decimals) : Math.floor(newValue)}${suffix}`;
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = `${prefix}${target}${suffix}`;
            }
        };
        
        // Start counter animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(counter);
    });

    // Animate blockchain node connections
    const connections = document.querySelectorAll('.connection');
    connections.forEach(connection => {
        // Create data flow animation
        setInterval(() => {
            const dataParticle = document.createElement('div');
            dataParticle.classList.add('data-particle');
            dataParticle.style.position = 'absolute';
            dataParticle.style.width = '6px';
            dataParticle.style.height = '6px';
            dataParticle.style.borderRadius = '50%';
            dataParticle.style.backgroundColor = '#6366f1';
            dataParticle.style.left = '0';
            dataParticle.style.top = '50%';
            dataParticle.style.transform = 'translateY(-50%)';
            dataParticle.style.opacity = '0.7';
            dataParticle.style.zIndex = '2';
            
            connection.appendChild(dataParticle);
            
            // Animate particle
            setTimeout(() => {
                dataParticle.style.transition = 'all 2s cubic-bezier(.5, 0, .5, 1)';
                dataParticle.style.left = '100%';
                dataParticle.style.opacity = '0';
            }, 50);
            
            // Remove particle after animation
            setTimeout(() => {
                dataParticle.remove();
            }, 2000);
        }, Math.random() * 2000 + 1000); // Random interval between 1-3 seconds
    });
    
    // Scroll-triggered animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in, .fade-up, .fade-right, .fade-left');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.9) {
                element.classList.add('visible');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
});

// Add WebGL background (if available)
function initWebGLBackground() {
    try {
        const canvas = document.createElement('canvas');
        canvas.id = 'webgl-background';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-2';
        document.querySelector('.hero').appendChild(canvas);
        
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create a grid of particles
        const particleGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.4 });
        
        const particles = new THREE.Group();
        
        for (let i = 0; i < 200; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position
            particle.position.x = Math.random() * 20 - 10;
            particle.position.y = Math.random() * 20 - 10;
            particle.position.z = Math.random() * 20 - 10;
            
            // Store original position for animation
            particle.userData.originalPosition = { 
                x: particle.position.x, 
                y: particle.position.y, 
                z: particle.position.z 
            };
            
            // Random speed for animation
            particle.userData.speed = Math.random() * 0.01 + 0.005;
            
            particles.add(particle);
        }
        
        scene.add(particles);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate particle group
            particles.rotation.y += 0.001;
            
            // Animate individual particles
            particles.children.forEach(particle => {
                particle.position.y += Math.sin(Date.now() * particle.userData.speed) * 0.01;
                particle.position.x += Math.cos(Date.now() * particle.userData.speed) * 0.01;
            });
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
    } catch (error) {
        console.warn('WebGL background could not be initialized:', error);
    }
}

// Optional: Initialize WebGL if Three.js is available
if (typeof THREE !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initWebGLBackground);
} 