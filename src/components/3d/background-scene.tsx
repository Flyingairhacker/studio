
"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface BackgroundSceneProps {
  weather: 'none' | 'rain' | 'snow' | 'fog' | 'storm' | 'sunny' | 'dusk' | 'night';
  terrain: 'none' | 'city' | 'hills' | 'beach' | 'forest' | 'desert' | 'mountains';
}

const BackgroundScene = ({ weather, terrain }: BackgroundSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const weatherParticlesRef = useRef<THREE.Points | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);
  const vehiclesGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x040306, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    if (mountRef.current.children.length === 0) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Starfield
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.5,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    weatherParticlesRef.current = new THREE.Points();
    scene.add(weatherParticlesRef.current);

    terrainGroupRef.current = new THREE.Group();
    scene.add(terrainGroupRef.current);

    vehiclesGroupRef.current = new THREE.Group();
    scene.add(vehiclesGroupRef.current);

    // Cyber Grid Floor
    const grid = new THREE.GridHelper(200, 100, 0x00C8FF, 0x00C8FF);
    (grid.material as THREE.Material).opacity = 0.1;
    (grid.material as THREE.Material).transparent = true;
    grid.position.y = -10;
    scene.add(grid);

    // Lights
    const cyanLight = new THREE.PointLight(0x00c8ff, 50, 100, 2);
    cyanLight.position.set(0, 0, 0);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xff00ff, 50, 100, 2);
    purpleLight.position.set(0, 0, 0);
    scene.add(purpleLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Mouse movement
    const mouse = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Handle resize
    const onWindowResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Animate stars
      stars.rotation.y = elapsedTime * 0.01;
      
      // Animate weather particles
      if (weatherParticlesRef.current?.geometry?.attributes?.position) {
        const positions = (weatherParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const velocities = (weatherParticlesRef.current.geometry.userData.velocities as Float32Array);
        for(let i=0; i<positions.length / 3; i++) {
            positions[i*3 + 1] -= velocities[i];
            if (positions[i*3+1] < -50) positions[i*3+1] = 50;
        }
        weatherParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      // Animate terrain
      if (terrainGroupRef.current) {
        terrainGroupRef.current.position.z += 0.02;
        if(terrainGroupRef.current.position.z > 50) terrainGroupRef.current.position.z = -150;
      }

      // Animate vehicles
      if (vehiclesGroupRef.current && cameraRef.current) {
          vehiclesGroupRef.current.children.forEach((vehicle) => {
              const speed = vehicle.userData.speed || 0.1;
              vehicle.position.z += speed;
              if (vehicle.position.z > cameraRef.current.position.z) {
                  vehicle.position.z = -200;
                  vehicle.position.x = (Math.random() - 0.5) * 100;
              }
          });
      }

      // Update lights position based on mouse
      const cameraOffset = new THREE.Vector3(mouse.x * 5, mouse.y * 5, camera.position.z + 2);
      cyanLight.position.lerp(cameraOffset.clone().setX(-mouse.x * 10), 0.05);
      purpleLight.position.lerp(cameraOffset.clone().setX(mouse.x * 10), 0.05);

      // Subtle camera movement
      if (cameraRef.current && sceneRef.current) {
        cameraRef.current.position.x += (mouse.x * 2 - cameraRef.current.position.x) * 0.02;
        cameraRef.current.position.y += (mouse.y * 2 - cameraRef.current.position.y) * 0.02;
        cameraRef.current.lookAt(sceneRef.current.position);
        renderer.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current && renderer.domElement) {
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                object.geometry.dispose();
                const material = object.material as THREE.Material | THREE.Material[];
                if (Array.isArray(material)) {
                    material.forEach(mat => mat.dispose());
                } else if(material) {
                    material.dispose();
                }
            }
        });
        renderer.dispose();
        if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Effect to update weather
  useEffect(() => {
    const currentScene = sceneRef.current;
    const currentRenderer = rendererRef.current;
    if (!currentScene || !currentRenderer) return;
    
    currentRenderer.setClearColor(0x000000, 0);

    if (currentScene.fog) {
        (currentScene.fog as THREE.FogExp2).density = weather === 'fog' ? 0.015 : 0.001;
    }
    
    // Time of day
    if (weather === 'sunny') {
        currentRenderer.setClearColor(0x87CEEB, 1);
        if (currentScene.fog) currentScene.fog.color.set(0x87CEEB);
    } else if (weather === 'dusk') {
        currentRenderer.setClearColor(0x23192d, 1);
        if (currentScene.fog) currentScene.fog.color.set(0x23192d);
    } else {
        if (currentScene.fog) currentScene.fog.color.set(0x040306);
    }

    if (weatherParticlesRef.current) {
        if (weather === 'none' || weather === 'sunny' || weather === 'dusk' || weather === 'night') {
            weatherParticlesRef.current.visible = false;
            return;
        }

        weatherParticlesRef.current.visible = true;
        let count = 5000;
        if(weather === 'rain') count = 15000;
        if(weather === 'storm') count = 25000;

        const size = weather === 'rain' || weather === 'storm' ? 0.08 : 0.15;
        const color = weather === 'rain' || weather === 'storm' ? 0x00c8ff : 0xffffff;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = Math.random() * 100 - 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
            let speed = Math.random() * 0.1 + 0.05;
            if(weather === 'rain') speed = Math.random() * 0.8 + 0.4;
            if(weather === 'storm') speed = Math.random() * 1.5 + 0.8;
            velocities[i] = speed;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.userData.velocities = velocities;

        const material = new THREE.PointsMaterial({
            size,
            color,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.7,
        });

        if (weatherParticlesRef.current.geometry) weatherParticlesRef.current.geometry.dispose();
        const currentMaterial = weatherParticlesRef.current.material as THREE.Material | THREE.Material[];
        if (Array.isArray(currentMaterial)) {
            currentMaterial.forEach(mat => mat.dispose());
        } else if (currentMaterial) {
            currentMaterial.dispose();
        }

        weatherParticlesRef.current.geometry = geometry;
        weatherParticlesRef.current.material = material;
    }
  }, [weather]);
  
  // Effect to update terrain
  useEffect(() => {
    if (terrainGroupRef.current) {
      while (terrainGroupRef.current.children.length > 0) {
        const obj = terrainGroupRef.current.children[0];
        terrainGroupRef.current.remove(obj);
        if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const material = obj.material as THREE.Material | THREE.Material[];
            if (Array.isArray(material)) material.forEach(m => m.dispose());
            else material.dispose();
        }
      }
    }
     if (vehiclesGroupRef.current) {
        while (vehiclesGroupRef.current.children.length > 0) {
            const obj = vehiclesGroupRef.current.children[0];
            vehiclesGroupRef.current.remove(obj);
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                (obj.material as THREE.Material).dispose();
            }
        }
    }

    let material: THREE.Material;
    switch (terrain) {
      case 'city':
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        for (let i = 0; i < 300; i++) {
          const building = new THREE.Mesh(boxGeo, buildingMaterial);
          building.position.set(
            (Math.random() - 0.5) * 150,
            0,
            (Math.random() - 0.5) * 300 - 100
          );
          building.scale.set(
              Math.random() * 4 + 2,
              Math.random() * 40 + 10,
              Math.random() * 4 + 2
          );
          building.position.y = building.scale.y / 2 - 10;
          terrainGroupRef.current?.add(building);
        }
        
        // Add vehicles
        const vehicleGeo = new THREE.BoxGeometry(0.5, 0.2, 1);
        for (let i = 0; i < 100; i++) {
            const vehicleMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00c8ff : 0xff00ff });
            const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
            vehicle.position.set(
                (Math.random() - 0.5) * 100,
                -9.5,
                (Math.random() - 1) * 200
            );
            vehicle.userData.speed = Math.random() * 0.2 + 0.1;
            vehiclesGroupRef.current?.add(vehicle);
        }

        // Add Tron bike
        const bikeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        const bike = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 2), bikeMat);
        bike.position.set(0, -9.4, -20);
        bike.userData.speed = 0.5;
        vehiclesGroupRef.current?.add(bike);

        // Add people
        const personGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const personMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        for (let i = 0; i < 500; i++) {
            const person = new THREE.Mesh(personGeo, personMat);
            person.position.set(
                 (Math.random() - 0.5) * 150,
                -9.75,
                (Math.random() - 0.5) * 300 - 100
            );
            terrainGroupRef.current?.add(person);
        }

        break;
      case 'hills':
      case 'mountains':
      case 'forest':
          const color = terrain === 'forest' ? 0x228B22 : 0x696969;
          material = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.1, flatShading: true });
          const planeGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
          const position = planeGeo.attributes.position;
          const peakHeight = terrain === 'mountains' ? 25 : 10;
          for (let i = 0; i < position.count; i++) {
              const x = position.getX(i);
              const y = position.getY(i);
              const noise = Math.sin(x/15) * Math.cos(y/15) * peakHeight;
              position.setZ(i, noise);
          }
          planeGeo.computeVertexNormals();
          const ground = new THREE.Mesh(planeGeo, material);
          ground.rotation.x = -Math.PI / 2;
          ground.position.y = -10;
          terrainGroupRef.current?.add(ground);
          
          if (terrain === 'forest') {
              const treeGeo = new THREE.ConeGeometry(0.5, 3, 8);
              const treeMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
              for(let i=0; i<200; i++){
                  const tree = new THREE.Mesh(treeGeo, treeMat);
                  const x = (Math.random() - 0.5) * 200;
                  const z = (Math.random() - 0.5) * 200;
                  const y = -8.5; 
                  tree.position.set(x, y, z);
                  terrainGroupRef.current?.add(tree);
              }
          }
          break;
      case 'beach':
      case 'desert':
            const groundColor = terrain === 'beach' ? 0xF0E68C : 0xC2B280;
            const waterColor = terrain === 'beach' ? 0x6083c2 : 0x000000;
            material = new THREE.MeshStandardMaterial({ color: waterColor, transparent: true, opacity: 0.7 });
            const waterGeo = new THREE.PlaneGeometry(200, 200, 1, 1);
            const water = new THREE.Mesh(waterGeo, material);
            water.rotation.x = -Math.PI / 2;
            water.position.y = -9.5;
            terrainGroupRef.current?.add(water);

            const groundMat = new THREE.MeshStandardMaterial({color: groundColor, roughness: 1, metalness: 0});
            const groundPlane = new THREE.PlaneGeometry(200,100,50,50);
            const groundPos = groundPlane.attributes.position;
            for (let i = 0; i < groundPos.count; i++) {
              const x = groundPos.getX(i);
              const y = groundPos.getY(i);
              groundPos.setZ(i, Math.sin(x/5) * Math.sin(y/5) * 2);
          }
            const sand = new THREE.Mesh(groundPlane, groundMat);
            sand.rotation.x = -Math.PI / 2;
            sand.position.y = -9;
            sand.position.z = -50;
            terrainGroupRef.current?.add(sand);
          break;
      case 'none':
      default:
        // Do nothing, leave it empty
        break;
    }
  }, [terrain]);


  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      aria-hidden="true"
    />
  );
};

export default BackgroundScene;
