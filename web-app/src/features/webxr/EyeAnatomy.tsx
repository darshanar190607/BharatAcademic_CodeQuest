import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

interface EyeAnatomyProps {
  onExit: () => void;
}

export default function EyeAnatomy({ onExit }: EyeAnatomyProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !uiRef.current) return;
    const currentMount = mountRef.current;
    
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let eyeGroup: THREE.Group;
    let raycaster: THREE.Raycaster, pointer: THREE.Vector2;
    let selectedPart: THREE.Object3D | null = null;
    let vrButton: HTMLElement;
    let infoPanel: HTMLElement | null = null;

    function init() {
      // Scene setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 8);

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
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Create eye group
      eyeGroup = new THREE.Group();
      scene.add(eyeGroup);

      // Eye parts information
      const eyeParts = {
        cornea: { name: 'Cornea', color: 0x87ceeb, description: 'Transparent front part that bends light' },
        iris: { name: 'Iris', color: 0x8b4513, description: 'Controls pupil size and eye color' },
        pupil: { name: 'Pupil', color: 0x000000, description: 'Opening where light enters' },
        lens: { name: 'Lens', color: 0xf0f8ff, description: 'Focuses light onto retina' },
        retina: { name: 'Retina', color: 0xff6b6b, description: 'Light-sensitive tissue at back' },
        opticNerve: { name: 'Optic Nerve', color: 0xffd700, description: 'Carries signals to brain' },
        sclera: { name: 'Sclera', color: 0xffffff, description: 'White outer layer of eye' }
      };

      // Create sclera (white part)
      const scleraGeometry = new THREE.SphereGeometry(2.5, 32, 16);
      const scleraMaterial = new THREE.MeshStandardMaterial({ 
        color: eyeParts.sclera.color,
        roughness: 0.7,
        metalness: 0.1
      });
      const sclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
      sclera.userData = { type: 'sclera', ...eyeParts.sclera };
      eyeGroup.add(sclera);

      // Create cornea (transparent front)
      const corneaGeometry = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
      const corneaMaterial = new THREE.MeshPhysicalMaterial({
        color: eyeParts.cornea.color,
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.9
      });
      const cornea = new THREE.Mesh(corneaGeometry, corneaMaterial);
      cornea.position.z = 2.3;
      cornea.userData = { type: 'cornea', ...eyeParts.cornea };
      eyeGroup.add(cornea);

      // Create iris
      const irisGeometry = new THREE.RingGeometry(0.8, 1.5, 32);
      const irisMaterial = new THREE.MeshStandardMaterial({ 
        color: eyeParts.iris.color,
        roughness: 0.5
      });
      const iris = new THREE.Mesh(irisGeometry, irisMaterial);
      iris.position.z = 2.4;
      iris.userData = { type: 'iris', ...eyeParts.iris };
      eyeGroup.add(iris);

      // Create pupil
      const pupilGeometry = new THREE.CircleGeometry(0.8, 32);
      const pupilMaterial = new THREE.MeshStandardMaterial({ 
        color: eyeParts.pupil.color,
        emissive: 0x000000,
        emissiveIntensity: 0.5
      });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.z = 2.41;
      pupil.userData = { type: 'pupil', ...eyeParts.pupil };
      eyeGroup.add(pupil);

      // Create lens
      const lensGeometry = new THREE.SphereGeometry(0.8, 32, 16);
      const lensMaterial = new THREE.MeshPhysicalMaterial({
        color: eyeParts.lens.color,
        transparent: true,
        opacity: 0.4,
        roughness: 0,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.8
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      lens.scale.set(1, 1, 0.5);
      lens.position.z = 1.5;
      lens.userData = { type: 'lens', ...eyeParts.lens };
      eyeGroup.add(lens);

      // Create retina
      const retinaGeometry = new THREE.SphereGeometry(2.3, 32, 16, 0, Math.PI * 2, 0, Math.PI);
      const retinaMaterial = new THREE.MeshStandardMaterial({ 
        color: eyeParts.retina.color,
        roughness: 0.8,
        emissive: eyeParts.retina.color,
        emissiveIntensity: 0.2
      });
      const retina = new THREE.Mesh(retinaGeometry, retinaMaterial);
      retina.position.z = -0.2;
      retina.userData = { type: 'retina', ...eyeParts.retina };
      eyeGroup.add(retina);

      // Create optic nerve
      const nerveGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
      const nerveMaterial = new THREE.MeshStandardMaterial({ 
        color: eyeParts.opticNerve.color,
        roughness: 0.6
      });
      const opticNerve = new THREE.Mesh(nerveGeometry, nerveMaterial);
      opticNerve.position.set(-1, 0, -2);
      opticNerve.rotation.x = Math.PI / 6;
      opticNerve.userData = { type: 'opticNerve', ...eyeParts.opticNerve };
      eyeGroup.add(opticNerve);

      // Create light rays passing through eye
      function createLightRays() {
        const rayGroup = new THREE.Group();
        const rayCount = 5;
        
        for (let i = 0; i < rayCount; i++) {
          const angle = (i - rayCount / 2) * 0.1;
          const points = [];
          
          // Ray from outside to cornea
          points.push(new THREE.Vector3(-8, angle, 0));
          points.push(new THREE.Vector3(-2.5, angle * 0.8, 0));
          
          // Through cornea (refraction)
          points.push(new THREE.Vector3(2.3, angle * 0.6, 0));
          
          // Through pupil
          points.push(new THREE.Vector3(2.41, angle * 0.5, 0));
          
          // Through lens to retina
          points.push(new THREE.Vector3(1.5, angle * 0.3, 0));
          points.push(new THREE.Vector3(-2.3, angle * 0.1, 0));
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: 0xffff00, 
            opacity: 0.6, 
            transparent: true 
          });
          const line = new THREE.Line(geometry, material);
          rayGroup.add(line);
        }
        
        return rayGroup;
      }

      const lightRays = createLightRays();
      eyeGroup.add(lightRays);

      // Interaction handlers
      const onMouseMove = (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(eyeGroup.children, true);

        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData.type) {
            selectedPart = object;
            document.body.style.cursor = 'pointer';
            
            // Highlight selected part
            eyeGroup.children.forEach(child => {
              if (child.material && child.material.emissive) {
                child.material.emissiveIntensity = 0;
              }
            });
            
            if (object.material && object.material.emissive) {
              object.material.emissiveIntensity = 0.3;
            }
          }
        } else {
          selectedPart = null;
          document.body.style.cursor = 'default';
          
          // Remove highlights
          eyeGroup.children.forEach(child => {
            if (child.material && child.material.emissive) {
              child.material.emissiveIntensity = child.userData.type === 'retina' ? 0.2 : 0;
            }
          });
        }
      };

      const onMouseClick = (event: MouseEvent) => {
        if (selectedPart && selectedPart.userData.name) {
          // Show information panel
          if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.className = 'absolute top-20 left-4 bg-black/80 text-white p-4 rounded-lg max-w-sm';
            uiRef.current?.appendChild(infoPanel);
          }
          
          infoPanel.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${selectedPart.userData.name}</h3>
            <p class="text-sm">${selectedPart.userData.description}</p>
            <button class="mt-2 text-xs text-gray-400 hover:text-white" onclick="this.parentElement.remove()">Close</button>
          `;
        }
      };

      const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      // Animation loop
      function animate() {
        renderer.setAnimationLoop(animate);
        
        // Slowly rotate eye for better viewing
        eyeGroup.rotation.y += 0.003;
        
        // Animate pupil size slightly
        const time = Date.now() * 0.001;
        const pupilScale = 0.8 + Math.sin(time * 2) * 0.1;
        if (pupil) {
          pupil.scale.set(pupilScale, pupilScale, 1);
        }

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
        
        if (infoPanel && infoPanel.parentElement) {
          infoPanel.parentElement.removeChild(infoPanel);
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
    <div className="fixed inset-0 z-[9999] bg-black">
      <div ref={mountRef} className="w-full h-full" />
      <div ref={uiRef} className="absolute inset-0 pointer-events-none text-white font-sans">
        
        {/* Left Info Panel */}
        <div className="absolute top-6 left-6 bg-black/60 border border-gray-700/50 p-5 rounded-xl pointer-events-auto backdrop-blur-sm shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-blue-400">Human Eye Anatomy</h2>
          <p className="text-sm mb-1 font-medium text-gray-200">Click on eye parts to learn more.</p>
          <p className="text-xs text-gray-400">Watch how light passes through the eye.</p>
        </div>

        {/* Massive Exit Button (Top Right) */}
        <button 
          onClick={onExit} 
          className="absolute top-6 right-6 bg-red-600/90 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition duration-200 pointer-events-auto shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Exit Anatomy
        </button>

      </div>
    </div>
  );
}
