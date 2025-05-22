document.addEventListener('DOMContentLoaded', () => {
    const fogCanvas = document.getElementById('fog-canvas');

    if (!fogCanvas) {
        console.error("Fog Canvas element (#fog-canvas) not found!");
        return;
    }

    const ctx = fogCanvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D rendering context for the canvas.");
        return;
    }

    let svgWidth = window.innerWidth;
    let svgHeight = window.innerHeight;

    // --- Configuration ---
    const NUM_PARTICLES = 1000; // Particle count for denser fog
    const MIN_RADIUS = 50;     // Minimum radius for smaller particles
    const MAX_RADIUS = 100;     // Maximum radius for smaller particles
    const MOUSE_REPEL_RADIUS = 10; // How close the mouse needs to be to affect particles
    const MOUSE_REPEL_STRENGTH = 1; // How strongly particles are pushed away
    // const CANVAS_BLUR_AMOUNT = '5px'; // Canvas-wide blur removed for performance
    // --- End Configuration ---

    const particles = [];
    // let mouseX = -1000; // Initialize mouse position off-screen
    // let mouseY = -1000;

    // Track mouse movements
    // document.addEventListener('mousemove', (event) => {
    //     mouseX = event.clientX;
    //     mouseY = event.clientY;
    // });

    // Set canvas dimensions
    function resizeCanvas() {
        svgWidth = window.innerWidth;
        svgHeight = window.innerHeight;
        fogCanvas.width = svgWidth;
        fogCanvas.height = svgHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size

    function createParticle() {
        const x = Math.random() * svgWidth;
        const y = Math.random() * svgHeight;
        const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
        // For canvas, opacity is handled by globalAlpha or rgba in fillStyle
        const baseOpacity = 0.04 + Math.random() * 0.025; // Slightly increased opacity for gradient visibility
        const color = `250, 255, 255`; // RGB part of the color

        return {
            x: x,
            y: y,
            radius: radius,
            color: color, // Store RGB
            opacity: baseOpacity, // Store opacity
            // Slow, somewhat random movement
            speedX: (Math.random() - 0.1) * 0.5, // Tendency to drift slightly right
            speedY: (Math.random() - 0.1) * 0.5  // Slight vertical drift
        };
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(createParticle());
    }

    function animateFog() {
        // Clear the canvas each frame
        ctx.clearRect(0, 0, svgWidth, svgHeight);

        // Apply blur to the entire canvas context for this frame
        // ctx.filter = `blur(${CANVAS_BLUR_AMOUNT})`; // Removed for performance

        particles.forEach(p => {
            // Update particle position based on its own speed
            p.x += p.speedX;
            p.y += p.speedY;

            // // Mouse repulsion logic
            // const dx = p.x - mouseX;
            // const dy = p.y - mouseY;
            // const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            // if (distanceToMouse < MOUSE_REPEL_RADIUS && distanceToMouse > 0) { // distanceToMouse > 0 to avoid division by zero
            //     const forceDirectionX = dx / distanceToMouse;
            //     const forceDirectionY = dy / distanceToMouse;
            //     // The closer the particle, the stronger the repulsion
            //     const force = (MOUSE_REPEL_RADIUS - distanceToMouse) / MOUSE_REPEL_RADIUS * MOUSE_REPEL_STRENGTH;

            //     p.x += forceDirectionX * force;
            //     p.y += forceDirectionY * force;
            // }

            // Boundary conditions (wrap around for continuous fog)
            if (p.speedX > 0 && p.x - p.radius > svgWidth) { // Moving right, off screen
                p.x = -p.radius;
                p.y = Math.random() * svgHeight; // Re-randomize Y for variety
            } else if (p.speedX < 0 && p.x + p.radius < 0) { // Moving left, off screen
                p.x = svgWidth + p.radius;
                p.y = Math.random() * svgHeight;
            }

            if (p.speedY > 0 && p.y - p.radius > svgHeight) { // Moving down, off screen
                p.y = -p.radius;
            } else if (p.speedY < 0 && p.y + p.radius < 0) { // Moving up, off screen
                p.y = svgHeight + p.radius;
            }

            // Draw the particle
            // To achieve a soft/blurred look without explicit filters (which can be slow on canvas for many items):
            // We draw a circle with a radial gradient that fades to transparent, or simply use globalAlpha.
            // For simplicity and good performance, we'll use globalAlpha.
            const gradient = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius); // Inner radius smaller for softer core
            gradient.addColorStop(0, `rgba(${p.color}, ${p.opacity})`);    // Opaque center
            gradient.addColorStop(0.7, `rgba(${p.color}, ${p.opacity * 0.5})`); // Mid-point fade
            gradient.addColorStop(1, `rgba(${p.color}, 0)`);              // Transparent edge

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // Reset filter after drawing all particles for this frame if other non-blurred things were to be drawn
        // For this specific case, it's not strictly necessary as we clear and redraw everything.
        // ctx.filter = 'none'; 

        requestAnimationFrame(animateFog);
    }

    // Could add a resize listener here to update svgWidth/svgHeight and particle positions if desired

    animateFog();
});