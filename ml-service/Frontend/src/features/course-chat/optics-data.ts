
export const opticsCourse = {
    courseTitle: "Comprehensive Optics",
    recommendedStudyTime: "10 hours",
    outline: [
        { id: 1, title: "Fundamentals of Ray Optics", points: ["Rectilinear propagation", "Reflection & Refraction", "TIR", "Dispersion"], completed: false },
        { id: 2, title: "Mirrors and Lenses", points: ["Spherical Mirrors", "Lens Maker’s Equation", "Magnification"], completed: false },
        { id: 3, title: "Optical Instruments", points: ["The Human Eye", "Microscopes", "Telescopes", "Aberrations"], completed: false },
        { id: 4, title: "Wave Nature of Light", points: ["Huygens’ Principle", "Coherence", "Phase & Path Difference"], completed: false },
        { id: 5, title: "Interference", points: ["Superposition", "YDSE", "Thin Films", "Newton's Rings"], completed: false },
        { id: 6, title: "Diffraction", points: ["Single Slit Diffraction", "Diffraction Grating", "Resolving Power"], completed: false },
        { id: 7, title: "Polarization", points: ["Polarization States", "Brewster’s Law", "Malus’s Law", "Birefringence"], completed: false },
        { id: 8, title: "Electromagnetic Optics", points: ["Maxwell’s Equations", "Poynting Vector", "Fresnel Equations"], completed: false },
        { id: 9, title: "Lasers and Fiber Optics", points: ["Stimulated Emission", "Resonators", "Numerical Aperture"], completed: false },
        { id: 10, title: "Introduction to Quantum Optics", points: ["Photoelectric Effect", "Wave-Particle Duality", "Blackbody Radiation"], completed: false },
    ],
    content: {
        1: {
            STATIC_READING: `
        <h2>Unit 1: Fundamentals of Ray Optics - Deep Physical Understanding</h2>
        
        <h3>Rectilinear Propagation: Why Light Travels in Straight Lines</h3>
        <p>Light travels in straight lines through uniform media, a phenomenon you observe daily when dust particles become visible in sunlight streaming through a window. But why does light behave this way? The answer lies in the wave nature of light and how it propagates through space.</p>
        <p>When light moves through a medium, every point on its wavefront acts as a source of secondary wavelets, spreading out in all directions. However, these wavelets don't all contribute equally to the forward motion of light. The wavelets interfere with each other—some reinforcing, others canceling out.</p>
        <p>The crucial insight is that only in the forward direction do these secondary wavelets arrive in phase with each other, meaning their peaks and troughs align. In all other directions, the wavelets from different points arrive out of phase and destructively interfere, canceling each other out. This constructive interference in the forward direction and destructive interference in all other directions creates the illusion that light travels in perfectly straight lines.</p>
        
        <h3>Reflection and Refraction: The Principle of Least Time</h3>
        <p>The behavior of light at interfaces between different media reveals one of nature's most elegant principles. When light encounters a boundary between air and water or air and glass, it either bounces back (reflects) or changes direction as it enters the new medium (refracts). Both phenomena follow from a single profound idea proposed by Pierre de Fermat: light always takes the path that requires the least time to travel between two points.</p>
        <p>The physical mechanism behind this speed change involves the interaction between light and matter. When light enters a material like glass, the oscillating electric field of the light wave causes electrons in the atoms to oscillate. These oscillating electrons then re-emit light waves. The emitted waves interfere with the original wave in a way that creates an effective slower speed for the combined wave.</p>
        
        <h3>Total Internal Reflection: When Light Cannot Escape</h3>
        <p>One of the most striking optical phenomena occurs when light tries to travel from a dense medium like glass or water into a less dense medium like air. Under certain conditions, instead of refracting out into the air, the light reflects entirely back into the dense medium. This is total internal reflection, and it's the principle behind fiber optic cables that carry internet signals around the world.</p>
        <p>What happens if you increase the angle of incidence beyond this critical angle? Refraction would require the light to bend more than ninety degrees, which would mean the light ray curves backward—an impossibility. Nature resolves this impossibility by not allowing any light to refract out at all. Instead, all the light reflects back into the dense medium.</p>
        
        <h3>Dispersion: The Physics Behind Rainbows</h3>
        <p>When white sunlight passes through a prism or water droplets, it spreads into a rainbow spectrum of colors. This dispersion reveals a crucial fact: the refractive index of materials is not a single constant number but depends on the wavelength of light.</p>
        <p>The physical origin of this wavelength dependence lies in how light interacts with electrons in materials. Since blue light slows down more than red light in glass, it has a higher refractive index. When white light enters a prism at an angle, each color component bends according to its refractive index. Blue light experiences more bending (greater deviation) while red light bends less. When the light exits the prism on the other side, it refracts again, further separating the colors.</p>
        <img src="/src/assets/img1.jpg" alt="Ray Optics" />
      `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic showing a light ray sadly bending as it enters water, saying 'I miss being straight!'."
        },
        2: {
            STATIC_READING: `
        <h2>Unit 2: Mirrors and Lenses - Deep Physical Understanding</h2>
        <h3>Spherical Mirrors: The Geometry of Reflection</h3>
        <p>The key to understanding this convergence lies in the law of reflection, which states that the angle of incidence equals the angle of reflection, measured from the perpendicular to the surface at that point. The focal length is exactly half the radius of curvature.</p>
        <h3>How Concave Mirrors Form Images</h3>
        <p>When an object is placed far beyond the focal point, light rays diverging from each point on the object hit the mirror and converge again after reflection, forming a real, inverted image. When the object is placed between the focal point and the mirror's surface, the reflected rays diverge, creating a virtual, upright, and magnified image.</p>
        <h3>The Physics of Convex Mirrors</h3>
        <p>Convex mirrors curve outward and cause parallel rays to diverge. They always produce virtual, upright, and smaller images, which is why they are used for wide-angle viewing in car side mirrors.</p>
        <h3>Lenses: Refraction Through Curved Surfaces</h3>
        <p>A convex lens is thicker at its center and converges light. A concave lens is thinner at the center and diverges light. The power of a lens depends on the curvature of its surfaces and the refractive index of its material, as described by the Lens Maker's Equation.</p>
        <h3>Magnification: The Geometry of Image Formation</h3>
        <p>Magnification describes how much larger or smaller an image appears. Real images are always inverted, while virtual images are always upright. The magnification depends on the object and image distances.</p>
        <img src="/src/assets/img2.jpg" alt="Lenses" />
      `,
            VIDEO: "Oh4m8Ees-3Q",
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic showing a convex lens acting as a dating app, matching light rays to a single 'focal point'."
        },
        3: {
            STATIC_READING: `
            <h2>Unit 3: Optical Instruments</h2>
            <h3>Human Eye:</h3>
            <ul>
                <li><strong>Myopia (Nearsighted):</strong> Image forms <em>before</em> retina. Correct with <strong>Concave lens</strong>.</li>
                <li><strong>Hyperopia (Farsighted):</strong> Image forms <em>behind</em> retina. Correct with <strong>Convex lens</strong>.</li>
            </ul>
            <h3>Compound Microscope:</h3>
            <p>Two lenses: Objective (small aperture/focal length) and Eyepiece (large aperture/focal length).</p>
            <p>Total Magnification: $$M \\approx \\frac{L}{f_o} \\times \\frac{D}{f_e}$$ (where $L$ is tube length, $D$ is near point 25cm).</p>
            <h3>Astronomical Telescope:</h3>
            <p>Objective has large focal length (to gather light); Eyepiece has small focal length.</p>
            <p>Magnification: $$M = \\frac{f_o}{f_e}$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of a telescope wearing glasses, one lens concave and one convex, saying 'Now I can see near and far!'"
        },
        4: {
            STATIC_READING: `
            <h2>Unit 4: Wave Nature of Light</h2>
            <h3>Huygens’ Principle:</h3>
            <p>Every point on a wavefront is a source of secondary spherical wavelets. The new wavefront is the tangent to these wavelets.</p>
            <h3>Wavefronts:</h3>
            <ul>
                <li>Point source $\\to$ Spherical wavefront.</li>
                <li>Distant source (infinity) $\\to$ Planar wavefront.</li>
            </ul>
            <h3>Phase & Path Difference:</h3>
            <p>The bridge between geometry and waves.</p>
            <p>$$\\Delta \\phi = \\frac{2\\pi}{\\lambda} \\Delta x$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic showing a single point on a wave creating its own little waves, like a ripple in a pond."
        },
        5: {
            STATIC_READING: `
            <h2>Unit 5: Interference</h2>
            <p><strong>Concept:</strong> Superposition of coherent waves (waves with constant phase difference).</p>
            <h3>Young’s Double Slit Experiment (YDSE):</h3>
            <ul>
                <li><strong>Constructive Interference (Bright Fringe):</strong> Path diff $\\Delta x = n\\lambda$.</li>
                <li><strong>Destructive Interference (Dark Fringe):</strong> Path diff $\\Delta x = (n + 0.5)\\lambda$.</li>
            </ul>
            <h3>Fringe Width ($\\beta$):</h3>
            <p>$$\\beta = \\frac{\\lambda D}{d}$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of two waves holding hands and becoming a giant wave, with the caption 'Constructive Relationship Goals'."
        },
        6: {
            STATIC_READING: `
            <h2>Unit 6: Diffraction</h2>
            <p><strong>Concept:</strong> Bending of light around obstacles roughly the same size as the wavelength $\\lambda$.</p>
            <h3>Single Slit Diffraction:</h3>
            <p>Condition for <strong>Minima</strong> (Dark spots): $$a \\sin \\theta = n\\lambda$$</p>
            <h3>Rayleigh Criterion (Resolution):</h3>
            <p>Two objects are resolved when the diffraction maximum of one falls on the first minimum of the other. Angular resolution limit: $$\\theta = 1.22 \\frac{\\lambda}{D}$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of a light wave squeezing through a narrow gap and then spreading out, saying 'Freedom!'"
        },
        7: {
            STATIC_READING: `
            <h2>Unit 7: Polarization</h2>
            <p><strong>Concept:</strong> Restricting the vibration of the electric field vector to a single plane.</p>
            <h3>Malus’s Law:</h3>
            <p>$$I = I_0 \\cos^2 \\theta$$</p>
            <h3>Brewster’s Law:</h3>
            <p>Light reflected from a surface is completely polarized if the reflected and refracted rays are $90^\\circ$ apart. $$\\tan \\theta_p = n$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of a 'bouncer' Polaroid letting only vertically aligned light waves into a club."
        },
        8: {
            STATIC_READING: `
            <h2>Unit 8: Electromagnetic Optics</h2>
            <h3>EM Wave Nature:</h3>
            <p>Light consists of oscillating Electric ($E$) and Magnetic ($B$) fields perpendicular to each other and to the direction of propagation ($v$).</p>
            <p><strong>Speed of Light:</strong> $$c = \\frac{1}{\\sqrt{\\mu_0 \\epsilon_0}}$$</p>
            <p><strong>Relation of Fields:</strong> $E = cB$.</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic showing an Electric wave and a Magnetic wave dancing perfectly in sync as they travel."
        },
        9: {
            STATIC_READING: `
            <h2>Unit 9: Lasers and Fiber Optics</h2>
            <p><strong>LASER:</strong> Requires <strong>Population Inversion</strong> and <strong>Stimulated Emission</strong>.</p>
            <h3>Fiber Optics:</h3>
            <p>Works on <strong>Total Internal Reflection</strong>. Core refractive index ($n_1$) must be greater than cladding index ($n_2$).</p>
            <p><strong>Numerical Aperture (NA):</strong> $$NA = \\sqrt{n_1^2 - n_2^2}$$</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of a photon telling another photon, 'Hey, let's make a clone of you!' - demonstrating stimulated emission."
        },
        10: {
            STATIC_READING: `
            <h2>Unit 10: Introduction to Quantum Optics</h2>
            <h3>Photon Energy:</h3>
            <p>$$E = h \\nu = \\frac{hc}{\\lambda}$$</p>
            <h3>Photoelectric Effect:</h3>
            <p>Proves particle nature of light. $$h\\nu = \\Phi + K_{max}$$</p>
            <h3>Wave-Particle Duality:</h3>
            <p>Light acts as a wave (interference/diffraction) and a particle (photoelectric effect).</p>
        `,
            '3D_VISUALS': { type: 'embed', url: 'https://sketchfab.com/models/2bda6b05667f4685bc2aa9dc56b70d32/embed' },
            COMIC: "A comic of a photon wearing a wave costume and a particle costume, saying 'I'm complicated!'"
        }
    },
    quiz: {
        1: [
            { question: "What is the formula for Snell's Law?", options: ["n1*sin(θ1) = n2*sin(θ2)", "n1*cos(θ1) = n2*cos(θ2)", "n1*tan(θ1) = n2*tan(θ2)", "n2*sin(θ1) = n1*sin(θ2)"], answer: "n1*sin(θ1) = n2*sin(θ2)" },
            { question: "Total Internal Reflection occurs when light travels from a ___ to a ___ medium.", options: ["Rarer to Denser", "Denser to Rarer", "Denser to Denser", "Rarer to Rarer"], answer: "Denser to Rarer" },
        ],
        2: [
            { question: "What is the lens maker's equation?", options: ["1/f = (n-1)(1/R1 - 1/R2)", "1/f = (n+1)(1/R1 - 1/R2)", "1/f = (n-1)(1/R1 + 1/R2)", "1/f = (n+1)(1/R1 + 1/R2)"], answer: "1/f = (n-1)(1/R1 - 1/R2)" },
            { question: "A negative magnification implies the image is...", options: ["Virtual and Erect", "Real and Inverted", "Virtual and Inverted", "Real and Erect"], answer: "Real and Inverted" },
        ],
        3: [
            { question: "Myopia is corrected using a ___ lens.", options: ["Convex", "Concave", "Cylindrical", "Plano-convex"], answer: "Concave" },
            { question: "The magnification of an astronomical telescope is given by...", options: ["fo * fe", "fo / fe", "fe / fo", "fo + fe"], answer: "fo / fe" },
        ],
        4: [
            { question: "A distant star provides what type of wavefront?", options: ["Spherical", "Cylindrical", "Planar", "Elliptical"], answer: "Planar" },
            { question: "What is the relationship between phase difference (Δφ) and path difference (Δx)?", options: ["Δφ = (2π/λ)Δx", "Δφ = (λ/2π)Δx", "Δx = (2π/λ)Δφ", "Δφ = 2πλΔx"], answer: "Δφ = (2π/λ)Δx" },
        ],
        5: [
            { question: "In YDSE, the condition for a bright fringe is path difference = ?", options: ["nλ", "(n+0.5)λ", "nλ/2", "(n+1)λ"], answer: "nλ" },
            { question: "Fringe width (β) in YDSE is proportional to...", options: ["Distance between slits (d)", "Wavelength (λ)", "1 / Wavelength (λ)", "1 / Distance to screen (D)"], answer: "Wavelength (λ)" },
        ],
        6: [
            { question: "The condition for the first minimum in single-slit diffraction is:", options: ["a sin(θ) = λ", "a sin(θ) = 1.22λ", "d sin(θ) = nλ", "a sin(θ) = 0.5λ"], answer: "a sin(θ) = λ" },
            { question: "The Rayleigh Criterion is used to determine...", options: ["Magnification", "Intensity", "Polarization", "Resolution"], answer: "Resolution" },
        ],
        7: [
            { question: "According to Malus's Law, if the angle between polarizer and analyzer is 90 degrees, the transmitted intensity is...", options: ["I_0", "I_0 / 2", "0", "I_0 / 4"], answer: "0" },
            { question: "Brewster's angle (θp) is given by...", options: ["sin(θp) = n", "cos(θp) = n", "tan(θp) = n", "cot(θp) = n"], answer: "tan(θp) = n" },
        ],
        8: [
            { question: "In an electromagnetic wave, the E and B fields are...", options: ["Parallel to each other", "Perpendicular to each other", "At a 45-degree angle", "In the same direction of propagation"], answer: "Perpendicular to each other" },
            { question: "The speed of light in a vacuum is given by:", options: ["sqrt(μ0/ε0)", "1/sqrt(μ0ε0)", "μ0ε0", "1/(μ0ε0)"], answer: "1/sqrt(μ0ε0)" },
        ],
        9: [
            { question: "Which phenomenon is the basis for laser operation?", options: ["Spontaneous Emission", "Stimulated Emission", "Absorption", "Blackbody Radiation"], answer: "Stimulated Emission" },
            { question: "Fiber optics work on the principle of...", options: ["Diffraction", "Interference", "Total Internal Reflection", "Polarization"], answer: "Total Internal Reflection" },
        ],
        10: [
            { question: "The energy of a photon is given by...", options: ["E = mc^2", "E = hν", "E = 1/2 mv^2", "E = V/I"], answer: "E = hν" },
            { question: "The photoelectric effect demonstrates the ___ nature of light.", options: ["Wave", "Particle", "Electromagnetic", "Transverse"], answer: "Particle" },
        ]
    }
};
