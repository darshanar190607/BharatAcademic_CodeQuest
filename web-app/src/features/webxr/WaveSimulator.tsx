import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

interface WaveSimulatorProps {
  onExit: () => void;
}

export default function WaveSimulator({ onExit }: WaveSimulatorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !uiRef.current) return;
    const currentMount = mountRef.current;
    
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let waveMesh: THREE.Mesh;
    let raycaster: THREE.Raycaster, pointer: THREE.Vector2;
    let vrButton: HTMLElement;
    let animationId: number;
    let frequency = 2.0;
    let amplitude = 0.5;
    let wavelength = 2.0;
    let time = 0;

    function init() {
      // Scene setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a1a);
      scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 3, 8);
      camera.lookAt(0, 0, 0);

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      currentMount.appendChild(renderer.domElement);

      // VR Button
      vrButton = VRButton.createButton(renderer);
      vrButton.style.bottom = '20px';
      vrButton.style.right = '20px';
      uiRef.current?.appendChild(vrButton);

      // Raycaster for interaction
      raycaster = new THREE.Raycaster();
      pointer = new THREE.Vector2();

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0x00ffff, 1, 10);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);

      // Create wave geometry
      const geometry = new THREE.PlaneGeometry(20, 20, 100, 100);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x004444,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        wireframe: false,
        transparent: true,
        opacity: 0.8
      });

      waveMesh = new THREE.Mesh(geometry, material);
      waveMesh.rotation.x = -Math.PI / 2;
      waveMesh.receiveShadow = true;
      waveMesh.castShadow = true;
      scene.add(waveMesh);

      // Create wave visualization elements
      function createWaveIndicators() {
        const indicators = new THREE.Group();

        // Create wave direction arrows
        for (let i = 0; i < 5; i++) {
          const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
          const arrowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
          });
          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
          arrow.position.set(-8 + i * 4, 0.5, 0);
          arrow.rotation.z = Math.PI / 2;
          indicators.add(arrow);
        }

        // Create frequency indicators
        const freqGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
        const freqMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff00ff,
          emissive: 0xff00ff,
          emissiveIntensity: 0.3
        });

        for (let i = 0; i < 4; i++) {
          const freqIndicator = new THREE.Mesh(freqGeometry, freqMaterial);
          freqIndicator.position.set(-6 + i * 4, 1, 0);
          indicators.add(freqIndicator);
        }

        return indicators;
      }

      const waveIndicators = createWaveIndicators();
      scene.add(waveIndicators);

      // Create electromagnetic spectrum visualization
      function createSpectrum() {
        const spectrum = new THREE.Group();
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        const labels = ['Radio', 'Microwave', 'Infrared', 'Visible', 'UV', 'X-ray', 'Gamma'];

        colors.forEach((color, index) => {
          const boxGeometry = new THREE.BoxGeometry(1, 0.1, 0.5);
          const boxMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
          });
          const box = new THREE.Mesh(boxGeometry, boxMaterial);
          box.position.set(-6 + index * 2, 3, -5);
          spectrum.add(box);
        });

        return spectrum;
      }

      const spectrum = createSpectrum();
      scene.add(spectrum);

      // Wave equation animation
      function updateWave() {
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
          vertex.fromBufferAttribute(positions, i);
          
          // Wave equation: z = A * sin(kx - wt + phase)
          const k = (2 * Math.PI) / wavelength; // Wave number
          const omega = 2 * Math.PI * frequency; // Angular frequency
          
          // Create traveling wave in x direction
          const x = vertex.x;
          const y = vertex.y;
          
          // Calculate wave height
          const distance = Math.sqrt(x * x + y * y);
          const waveHeight = amplitude * Math.sin(k * distance - omega * time);
          
          // Add some complexity with multiple wave sources
          const wave2 = 0.3 * amplitude * Math.sin(k * (x - 5) - omega * time * 1.5);
          const wave3 = 0.2 * amplitude * Math.sin(k * (y + 3) - omega * time * 0.7);
          
          vertex.z = waveHeight + wave2 + wave3;
          
          positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      // Interaction handlers
      const onMouseMove = (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(waveMesh);

        if (intersects.length > 0) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      };

      const onMouseClick = (event: MouseEvent) => {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(waveMesh);

        if (intersects.length > 0) {
          // Create ripple effect at click point
          const point = intersects[0].point;
          createRipple(point.x, point.y);
        }
      };

      function createRipple(x: number, y: number) {
        const rippleGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
        const rippleMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.set(x, 0.01, y);
        ripple.rotation.x = -Math.PI / 2;
        scene.add(ripple);

        // Animate ripple
        let scale = 0.3;
        let opacity = 0.8;
        const rippleAnimation = () => {
          scale += 0.05;
          opacity -= 0.02;
          
          ripple.scale.set(scale, scale, 1);
          rippleMaterial.opacity = opacity;
          
          if (opacity > 0) {
            requestAnimationFrame(rippleAnimation);
          } else {
            scene.remove(ripple);
          }
        };
        rippleAnimation();
      }

      const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      // Animation loop
      function animate() {
        animationId = renderer.setAnimationLoop(animate);
        
        time += 0.016; // ~60fps
        
        // Update wave geometry
        updateWave();
        
        // Rotate wave indicators
        waveIndicators.rotation.y += 0.01;
        
        // Animate spectrum
        spectrum.children.forEach((child, index) => {
          child.position.y = 3 + Math.sin(time * 2 + index * 0.5) * 0.2;
        });

        renderer.render(scene, camera);
      }

      // Event listeners
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('click', onMouseClick);
      window.addEventListener('resize', onWindowResize);

      animate();

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onMouseClick);
        window.removeEventListener('resize', onWindowResize);
        renderer.setAnimationLoop(null);
        
        if (uiRef.current?.contains(vrButton)) {
          uiRef.current.removeChild(vrButton);
        }
        
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
        
        renderer.dispose();
      };
    }

    const cleanup = init();
    return cleanup;
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={mountRef} className="w-full h-full" />
      <div ref={uiRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg pointer-events-auto">
          <h2 className="text-xl font-bold mb-2">Electromagnetic Wave Simulator</h2>
          <p className="text-sm mb-2">Click on the wave to create ripples</p>
          <p className="text-xs text-gray-300">Observe wave propagation and interference patterns</p>
          <div className="mt-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-cyan-400 rounded"></div>
              <span>Wave Field</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Wave Direction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span>Frequency</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onExit} 
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition pointer-events-auto"
        >
          Exit Simulator
        </button>
      </div>
    </div>
  );
}
