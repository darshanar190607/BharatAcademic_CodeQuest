import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

interface OpticsLaboratoryProps {
  onExit: () => void;
}

export default function OpticsLaboratory({ onExit }: OpticsLaboratoryProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !uiRef.current) return;
    const currentMount = mountRef.current;
    
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let raycaster: THREE.Raycaster, pointer: THREE.Vector2;
    let lenses: THREE.Mesh[] = [];
    let mirrors: THREE.Mesh[] = [];
    let lightRays: THREE.Line[] = [];
    let selectedObject: THREE.Object3D | null = null;
    let vrButton: HTMLElement;

    // Ray tracing for optics simulation
    class OpticsRay {
      origin: THREE.Vector3;
      direction: THREE.Vector3;
      intensity: number;
      color: THREE.Color;

      constructor(origin: THREE.Vector3, direction: THREE.Vector3, intensity = 1.0) {
        this.origin = origin.clone();
        this.direction = direction.clone().normalize();
        this.intensity = intensity;
        this.color = new THREE.Color(0xff0000); // Red laser
      }

      trace(scene: THREE.Scene): THREE.Vector3[] {
        const points: THREE.Vector3[] = [this.origin];
        let currentOrigin = this.origin.clone();
        let currentDirection = this.direction.clone();
        let currentIntensity = this.intensity;

        for (let bounce = 0; bounce < 10; bounce++) {
          let hitFound = false;

          // Check intersection with lenses
          lenses.forEach(lens => {
            const intersection = this.intersectLens(currentOrigin, currentDirection, lens);
            if (intersection && !hitFound) {
              points.push(intersection.point);
              // Refraction through lens
              const refracted = this.refract(currentDirection, intersection.normal, 1.5); // Glass refractive index
              currentOrigin = intersection.point.clone().add(refracted.clone().multiplyScalar(0.01));
              currentDirection = refracted;
              currentIntensity *= 0.9; // Some light loss
              hitFound = true;
            }
          });

          // Check intersection with mirrors
          mirrors.forEach(mirror => {
            const intersection = this.intersectMirror(currentOrigin, currentDirection, mirror);
            if (intersection && !hitFound) {
              points.push(intersection.point);
              // Reflection from mirror
              const reflected = this.reflect(currentDirection, intersection.normal);
              currentOrigin = intersection.point.clone().add(reflected.clone().multiplyScalar(0.01));
              currentDirection = reflected;
              currentIntensity *= 0.8; // Some light loss
              hitFound = true;
            }
          });

          if (!hitFound) {
            // No intersection, extend ray to edge of scene
            const endPoint = currentOrigin.clone().add(currentDirection.multiplyScalar(20));
            points.push(endPoint);
            break;
          }

          if (currentIntensity < 0.1) break; // Ray too weak
        }

        return points;
      }

      intersectLens(origin: THREE.Vector3, direction: THREE.Vector3, lens: THREE.Mesh): any {
        const ray = new THREE.Raycaster(origin, direction);
        const intersects = ray.intersectObject(lens);
        return intersects.length > 0 ? intersects[0] : null;
      }

      intersectMirror(origin: THREE.Vector3, direction: THREE.Vector3, mirror: THREE.Mesh): any {
        const ray = new THREE.Raycaster(origin, direction);
        const intersects = ray.intersectObject(mirror);
        return intersects.length > 0 ? intersects[0] : null;
      }

      reflect(incident: THREE.Vector3, normal: THREE.Vector3): THREE.Vector3 {
        return incident.clone().sub(normal.clone().multiplyScalar(2 * incident.dot(normal)));
      }

      refract(incident: THREE.Vector3, normal: THREE.Vector3, ior: number): THREE.Vector3 {
        const n1 = 1.0; // Air
        const n2 = ior;
        const ratio = n1 / n2;
        const cosI = -incident.dot(normal);
        const sinT2 = ratio * ratio * (1.0 - cosI * cosI);
        
        if (sinT2 > 1.0) return incident; // Total internal reflection
        
        const cosT = Math.sqrt(1.0 - sinT2);
        return incident.clone().multiplyScalar(ratio).add(normal.clone().multiplyScalar(ratio * cosI - cosT));
      }
    }

    function init() {
      // Scene setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 1.6, 5);

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

      // Create optical table
      const tableGeometry = new THREE.BoxGeometry(10, 0.2, 6);
      const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = -1;
      table.receiveShadow = true;
      scene.add(table);

      // Create convex lens
      const lensGeometry = new THREE.SphereGeometry(0.8, 32, 16);
      const lensMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.9,
        ior: 1.5
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      lens.scale.set(0.3, 1, 1);
      lens.position.set(-2, 0, 0);
      lens.userData = { type: 'lens', name: 'Convex Lens' };
      scene.add(lens);
      lenses.push(lens);

      // Create concave mirror
      const mirrorGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true, 0, Math.PI);
      const mirrorMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1,
        side: THREE.DoubleSide
      });
      const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
      mirror.position.set(2, 0, 0);
      mirror.rotation.y = Math.PI / 2;
      mirror.userData = { type: 'mirror', name: 'Concave Mirror' };
      scene.add(mirror);
      mirrors.push(mirror);

      // Create laser source
      const laserGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const laserMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const laserSource = new THREE.Mesh(laserGeometry, laserMaterial);
      laserSource.position.set(-5, 0, 0);
      laserSource.userData = { type: 'laser', name: 'Laser Source' };
      scene.add(laserSource);

      // Update light rays
      function updateLightRays() {
        // Remove old rays
        lightRays.forEach(ray => scene.remove(ray));
        lightRays = [];

        // Create new rays from laser
        const laserPos = laserSource.position;
        const rayDirections = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(1, 0.1, 0),
          new THREE.Vector3(1, -0.1, 0),
          new THREE.Vector3(1, 0, 0.1),
          new THREE.Vector3(1, 0, -0.1)
        ];

        rayDirections.forEach(dir => {
          const opticsRay = new OpticsRay(laserPos, dir);
          const points = opticsRay.trace(scene);
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: 0xff0000, 
            opacity: 0.8, 
            transparent: true 
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          lightRays.push(line);
        });
      }

      updateLightRays();

      // Interaction handlers
      const onMouseMove = (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects([...lenses, ...mirrors, laserSource]);

        if (intersects.length > 0) {
          selectedObject = intersects[0].object;
          document.body.style.cursor = 'pointer';
        } else {
          selectedObject = null;
          document.body.style.cursor = 'default';
        }
      };

      const onMouseClick = (event: MouseEvent) => {
        if (selectedObject) {
          // Rotate selected object
          selectedObject.rotation.y += Math.PI / 4;
          updateLightRays();
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
        
        // Slowly rotate lenses for visual effect
        lenses.forEach((lens, index) => {
          lens.rotation.y += 0.005 * (index + 1);
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
    <div className="fixed inset-0 z-[9999] bg-black">
      <div ref={mountRef} className="w-full h-full" />
      <div ref={uiRef} className="absolute inset-0 pointer-events-none text-white font-sans">
        
        {/* Left Info Panel */}
        <div className="absolute top-6 left-6 bg-black/60 border border-gray-700/50 p-5 rounded-xl pointer-events-auto backdrop-blur-sm shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-blue-400">Optics Laboratory</h2>
          <p className="text-sm mb-1 font-medium text-gray-200">Click on optical elements to rotate them.</p>
          <p className="text-xs text-gray-400">Watch how light rays interact with lenses and mirrors.</p>
        </div>

        {/* Massive Exit Button (Top Right) */}
        <button 
          onClick={onExit} 
          className="absolute top-6 right-6 bg-red-600/90 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition duration-200 pointer-events-auto shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Exit Laboratory
        </button>

      </div>
    </div>
  );
}
