import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';


export default function WebXRDemo({ onExit }: { onExit: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !uiRef.current) return;
    const currentMount = mountRef.current;
    
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: PointerLockControls;
    let water: THREE.Mesh;
    const clock = new THREE.Clock();
    let vrButton: HTMLElement;

    // Game elements
    const targets: THREE.Mesh[] = [];
    let score = 0;
    const gameDuration = 60; // 60 seconds
    let timeLeft = gameDuration;
    let isGameOver = false;
    let spawnInterval: number;
    let gameTimerInterval: number;

    const scoreDisplay = uiRef.current.querySelector('#score-display');
    const timerDisplay = uiRef.current.querySelector('#timer-display');
    const finalScoreDisplay = uiRef.current.querySelector('#final-score');
    const gameOverScreen = uiRef.current.querySelector('#game-over-screen') as HTMLDivElement;
    const instructionsScreen = uiRef.current.querySelector('#instructions-screen') as HTMLDivElement;

    function animate() {
        if (!renderer || isGameOver) return; // Stop animation if renderer is not ready or game is over
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Animate water
        const positions = water.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = 0.2 * Math.sin(positions.getX(i) * 0.2 + time * 1.5) + 0.1 * Math.sin(positions.getZ(i) * 0.3 + time * 2.0);
            positions.setY(i, y);
        }
        positions.needsUpdate = true;
        water.geometry.computeVertexNormals();
        
        // Animate targets
        targets.forEach(target => {
            target.position.y += Math.sin(time * 2 + target.id) * 0.01;
            target.rotation.x += delta * 0.5;
            target.rotation.y += delta * 0.5;
        });

        renderer.render(scene, camera);
    }
    
    function init() {
        // ========== SCENE SETUP ==========
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xa0a0a0, 10, 80);

        // ========== CAMERA ==========
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1.6, 0);

        // ========== RENDERER ==========
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.xr.enabled = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        currentMount.appendChild(renderer.domElement);
        
        vrButton = VRButton.createButton( renderer );
        vrButton.style.bottom = '20px';
        vrButton.style.right = '20px';
        uiRef.current?.appendChild(vrButton);

        // ========== SKYBOX & LIGHTING ==========
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        new RGBELoader()
            .setDataType(THREE.HalfFloatType)
            .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr', (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.background = envMap;
                scene.environment = envMap;
                texture.dispose();
                pmremGenerator.dispose();
            });

        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(10, 15, 10);
        sun.castShadow = true;
        sun.shadow.camera.top = 15;
        sun.shadow.camera.bottom = -15;
        sun.shadow.camera.left = -15;
        sun.shadow.camera.right = 15;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        scene.add(sun);
        scene.add(new THREE.AmbientLight(0x404040, 1));

        // ========== WATER ==========
        const waterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x006994,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8,
        });
        water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.receiveShadow = true;
        scene.add(water);

        // ========== CONTROLS ==========
        controls = new PointerLockControls(camera, renderer.domElement);

        const onPointerLockChange = () => {
            if(controls.isLocked) {
                instructionsScreen.style.display = 'none';
            }
        };
        const onPointerLockError = () => console.error('PointerLockControls: Unable to lock pointer');
        document.addEventListener('pointerlockchange', onPointerLockChange);
        document.addEventListener('pointerlockerror', onPointerLockError);
        
        const startButton = instructionsScreen.querySelector('button');
        startButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            if(!isGameOver) controls.lock();
        });
        
        // ========== GAME LOGIC ==========
        const raycaster = new THREE.Raycaster();
        const targetGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const targetMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            emissive: 0x661a00,
            roughness: 0.1,
            metalness: 0.5,
        });

        function spawnTarget() {
            if (isGameOver) return;
            const target = new THREE.Mesh(targetGeometry, targetMaterial.clone());
            target.position.set(
                (Math.random() - 0.5) * 80,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 80
            );
            target.castShadow = true;
            scene.add(target);
            targets.push(target);

            setTimeout(() => {
                if (scene.getObjectById(target.id)) {
                    scene.remove(target);
                    const index = targets.indexOf(target);
                    if (index > -1) targets.splice(index, 1);
                }
            }, 5000);
        }

        function shoot() {
            if (!controls.isLocked) return;
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.intersectObjects(targets);
            if (intersects.length > 0) {
                const hitTarget = intersects[0].object as THREE.Mesh;
                scene.remove(hitTarget);
                const index = targets.indexOf(hitTarget);
                if (index > -1) targets.splice(index, 1);
                score += 100;
                if(scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
            }
        }
        window.addEventListener('click', shoot);
        
        // Start game
        spawnInterval = window.setInterval(spawnTarget, 1000);
        gameTimerInterval = window.setInterval(() => {
            if (controls.isLocked && !isGameOver) {
                timeLeft--;
                if(timerDisplay) timerDisplay.textContent = `Time: ${timeLeft}`;
                if (timeLeft <= 0) {
                    isGameOver = true;
                    if(finalScoreDisplay) finalScoreDisplay.textContent = `Final Score: ${score}`;
                    gameOverScreen.style.display = 'flex';
                    controls.unlock();
                    clearInterval(gameTimerInterval);
                    clearInterval(spawnInterval);
                }
            }
        }, 1000);

        // ========== EVENT LISTENERS ==========
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);

        // ========== START ANIMATION & CLEANUP ==========
        renderer.setAnimationLoop(animate);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('click', shoot);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            document.removeEventListener('pointerlockerror', onPointerLockError);
            clearInterval(spawnInterval);
            clearInterval(gameTimerInterval);
            renderer.setAnimationLoop(null);
            if(uiRef.current?.contains(vrButton)) {
                uiRef.current.removeChild(vrButton);
            }
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }
    
    const cleanup = init();
    return cleanup;

  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={mountRef} className="w-full h-full cursor-pointer" />
      <div ref={uiRef} className="absolute inset-0 pointer-events-none text-white font-mono select-none">
          {/* In-Game UI */}
          <div className="absolute top-4 left-4 p-2 bg-black/30 rounded">
              <p id="score-display">Score: 0</p>
              <p id="timer-display">Time: 60</p>
          </div>
          <div id="crosshair-y" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 rounded-full"></div>
          <div id="crosshair-x" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-white/50 rounded-full"></div>
          
           {/* Instructions Screen */}
          <div id="instructions-screen" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center pointer-events-auto">
              <h2 className="text-4xl font-bold mb-4">Target Practice</h2>
              <p className="max-w-md mb-8">Your focus has dropped! Let's get you back in the zone. Aim with your mouse and click to shoot the floating targets.</p>
              <button className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition pointer-events-auto">Click to Start</button>
              <button onClick={onExit} className="absolute top-4 right-4 bg-gray-800/60 font-bold py-2 px-4 rounded-lg hover:bg-gray-900/80 pointer-events-auto">Back to Learning</button>
          </div>

          {/* Game Over Screen */}
          <div id="game-over-screen" style={{display: 'none'}} className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center pointer-events-auto">
              <h2 className="text-5xl font-bold mb-4">Time's Up!</h2>
              <p id="final-score" className="text-3xl mb-8">Final Score: 0</p>
              <button onClick={onExit} className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition pointer-events-auto">Return to Learning</button>
          </div>
      </div>
    </div>
  );
}