import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BrainScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        // Transparent background to blend with CSS gradient
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // --- Brain / Neural Network Object ---
        // Create a group to hold everything
        const brainGroup = new THREE.Group();
        // Position the brain to the RIGHT side of the screen
        brainGroup.position.x = 2.5;
        scene.add(brainGroup);

        // 1. Particles (Neurons)
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1500; // Increased count
        const posArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            // Create a sphere shape
            // r is distance from center, theta is latitude, phi is longitude
            const r = 2.5 + (Math.random() - 0.5) * 0.2; // Radius around 2.5 with some variation
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            posArray[i] = r * Math.sin(phi) * Math.cos(theta); // x
            posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta); // y
            posArray[i + 2] = r * Math.cos(phi); // z
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Neural cyan color
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.04, // Slightly larger
            color: 0x00F0FF, // Cyan
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        brainGroup.add(particles);

        // 2. Connections (Synapses) - Optional, can be heavy.
        // Let's add a refined geometric icosphere wireframe overlay for structure
        const geometryWireframe = new THREE.IcosahedronGeometry(2.51, 2);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x7000FF, // Electric Purple
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const wireframeMesh = new THREE.Mesh(geometryWireframe, wireframeMaterial);
        brainGroup.add(wireframeMesh);

        // Core glow
        const coreGeometry = new THREE.IcosahedronGeometry(2.2, 1);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00F0FF,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        brainGroup.add(coreMesh);


        // --- Lights ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00F0FF, 2, 50);
        pointLight.position.set(2, 2, 2);
        scene.add(pointLight);

        // --- Interaction State ---
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- Animation Loop ---
        const animate = () => {
            requestAnimationFrame(animate);

            // Auto rotation + Mouse interaction
            brainGroup.rotation.y += 0.002 + (mouseX * 0.01);
            brainGroup.rotation.x += 0.001 + (mouseY * 0.01);

            // Pulse effect (breathing)
            const time = Date.now() * 0.001;
            const scale = 1 + Math.sin(time) * 0.02;
            brainGroup.scale.set(scale, scale, scale);

            renderer.render(scene, camera);
        };

        animate();

        // --- Resize Handler ---
        const handleResize = () => {
            // Update camera aspect ratio
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            // Update renderer size
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Responsiveness: Move brain to center on mobile, right on desktop
            if (window.innerWidth < 768) {
                brainGroup.position.x = 0;
                brainGroup.scale.set(0.7, 0.7, 0.7);
            } else {
                brainGroup.position.x = 2;
                brainGroup.scale.set(1, 1, 1);
            }
        };
        window.addEventListener('resize', handleResize);
        // Call once to set initial state
        handleResize();


        // --- Scroll Animations (GSAP) ---
        gsap.to(brainGroup.rotation, {
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            },
            y: Math.PI * 4,
        });

        // Move brain to center for the "Clear View" section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "100vh top", // Longer duration to match the spacer
                scrub: 1,
            }
        });

        tl.to(brainGroup.position, {
            x: 0, // Center
            y: 0,
            z: 0.5,
            duration: 1
        });

        // Fade out when cards appear
        gsap.to(brainGroup, {
            scrollTrigger: {
                trigger: "#how-it-works",
                start: "top bottom", // Start fading when cards start entering viewport
                end: "top center",
                scrub: true,
            },
            opacity: 0,
            visible: false
        });

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            particleGeometry.dispose();
            particleMaterial.dispose();
            geometryWireframe.dispose();
            wireframeMaterial.dispose();
            renderer.dispose();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div
            ref={mountRef}
            // Changed z-index from -10 to 0 so it's not hidden behind body background if any
            // Added pointer-events-none only to let clicks pass through to background elements *if needed*,
            // but keeps mousemove listener working on window.
            className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
        />
    );
};

export default BrainScene;
