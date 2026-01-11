
"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const BackgroundScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040306, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

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

    // Geometric Orbs
    const orbGroup = new THREE.Group();
    const orbGeometry = new THREE.IcosahedronGeometry(1, 0);
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF00FF,
      emissive: 0xFF00FF,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: true,
    });
    
    for (let i = 0; i < 50; i++) {
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      orb.scale.setScalar(Math.random() * 0.2 + 0.1);
      orb.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      orbGroup.add(orb);
    }
    scene.add(orbGroup);

    // Data Particle Streams
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00C8FF,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });
    const dataParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(dataParticles);

    // Digital Rain
    const rainCount = 5000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 150;
        rainPositions[i * 3 + 1] = Math.random() * 100 - 50;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
        rainVelocities[i] = Math.random() * 0.2 + 0.1;
    }
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMaterial = new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 0.15,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.7,
    });
    const digitalRain = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(digitalRain);


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
      
      // Animate orbs
      orbGroup.rotation.y = elapsedTime * 0.05;
      orbGroup.rotation.x = elapsedTime * 0.02;

      // Animate data particles
      const particlePositions = dataParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          particlePositions[i3 + 1] -= 0.05; // Move down
          if (particlePositions[i3 + 1] < -50) {
              particlePositions[i3 + 1] = 50; // Reset to top
          }
      }
      dataParticles.geometry.attributes.position.needsUpdate = true;
      
      // Animate digital rain
      const rainPos = rainGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3 + 1] -= rainVelocities[i];
          if (rainPos[i * 3 + 1] < -50) {
              rainPos[i * 3 + 1] = 50;
          }
      }
      rainGeometry.attributes.position.needsUpdate = true;


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
        // dispose geometries, materials, textures
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                // Check if material is an array
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        starGeometry.dispose();
        starMaterial.dispose();
        orbGeometry.dispose();
        orbMaterial.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        rainGeometry.dispose();
        rainMaterial.dispose();
        grid.geometry.dispose();
        (grid.material as THREE.Material).dispose();

        renderer.dispose();
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      aria-hidden="true"
    />
  );
};

export default BackgroundScene;
