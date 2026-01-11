
"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface BackgroundSceneProps {
  weather: 'none' | 'rain' | 'snow' | 'fog';
  terrain: 'none' | 'city' | 'hills' | 'beach';
}

const BackgroundScene = ({ weather, terrain }: BackgroundSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const weatherParticlesRef = useRef<THREE.Points | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x040306, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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


      // Update lights position based on mouse
      const cameraOffset = new THREE.Vector3(mouse.x * 5, mouse.y * 5, camera.position.z + 2);
      cyanLight.position.lerp(cameraOffset.clone().setX(-mouse.x * 10), 0.05);
      purpleLight.position.lerp(cameraOffset.clone().setX(mouse.x * 10), 0.05);

      // Subtle camera movement
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
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
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
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
    const scene = sceneRef.current;
    if (!scene) return;
    
    if (scene.fog) {
        (scene.fog as THREE.FogExp2).density = weather === 'fog' ? 0.015 : 0.001;
    }

    if (weatherParticlesRef.current) {
        if (weather === 'none') {
            weatherParticlesRef.current.visible = false;
            return;
        }

        weatherParticlesRef.current.visible = true;
        const count = weather === 'rain' ? 15000 : 5000;
        const size = weather === 'rain' ? 0.08 : 0.15;
        const color = weather === 'rain' ? 0x00c8ff : 0xffffff;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = Math.random() * 100 - 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
            velocities[i] = weather === 'rain' ? Math.random() * 0.8 + 0.4 : Math.random() * 0.1 + 0.05;
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
        if (weatherParticlesRef.current.material) (weatherParticlesRef.current.material as THREE.Material).dispose();

        weatherParticlesRef.current.geometry = geometry;
        weatherParticlesRef.current.material = material;
    }
  }, [weather]);
  
  // Effect to update terrain
  useEffect(() => {
    if (terrainGroupRef.current) {
      // Clear old terrain
      while (terrainGroupRef.current.children.length > 0) {
        const obj = terrainGroupRef.current.children[0];
        terrainGroupRef.current.remove(obj);
        if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            (obj.material as THREE.Material).dispose();
        }
      }

      let material: THREE.Material;
      switch (terrain) {
        case 'city':
          material = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8, metalness: 0.2 });
          const boxGeo = new THREE.BoxGeometry(1, 1, 1);
          for (let i = 0; i < 100; i++) {
            const building = new THREE.Mesh(boxGeo, material);
            building.position.set(
              (Math.random() - 0.5) * 100,
              Math.random() * 10,
              (Math.random() - 0.5) * 200 - 50
            );
            building.scale.set(
                Math.random() * 3 + 1,
                Math.random() * 20 + 5,
                Math.random() * 3 + 1
            );
            building.position.y = building.scale.y / 2 - 10;
            terrainGroupRef.current.add(building);
          }
          break;
        case 'hills':
            material = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.9, metalness: 0.1, flatShading: true });
            const planeGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
            const position = planeGeo.attributes.position;
            for (let i = 0; i < position.count; i++) {
                const x = position.getX(i);
                const y = position.getY(i);
                position.setZ(i, Math.sin(x/10) * Math.cos(y/10) * 10);
            }
            planeGeo.computeVertexNormals();
            const hills = new THREE.Mesh(planeGeo, material);
            hills.rotation.x = -Math.PI / 2;
            hills.position.y = -10;
            terrainGroupRef.current.add(hills);
            break;
        case 'beach':
            material = new THREE.MeshStandardMaterial({ color: 0x6083c2, transparent: true, opacity: 0.7 });
            const waterGeo = new THREE.PlaneGeometry(200, 200, 100, 100);
            const water = new THREE.Mesh(waterGeo, material);
            water.rotation.x = -Math.PI / 2;
            water.position.y = -9.5;
            terrainGroupRef.current.add(water);
            break;
        case 'none':
        default:
          // Do nothing, leave it empty
          break;
      }
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
