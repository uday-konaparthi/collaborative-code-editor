import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

const NotFound = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Glowing cubes (404 effect)
    const cubeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#00ffff",
      emissive: "#00ffff",
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
    });

    for (let i = 0; i < 40; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 10
      );
      cube.rotation.set(Math.random() * 2, Math.random() * 2, 0);
      cubeGroup.add(cube);
    }

    scene.add(cubeGroup);

    const light = new THREE.PointLight(0x00ffff, 1.5);
    light.position.set(2, 3, 4);
    scene.add(light);

    const animate = () => {
      requestAnimationFrame(animate);
      cubeGroup.rotation.y += 0.002;
      cubeGroup.rotation.x += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    // Clean up renderer
    return () => {
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" />

      <div className="z-10 text-center px-6 py-12">
        <h1 className="text-6xl font-extrabold text-cyan-400 drop-shadow-lg mb-6 animate-pulse">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4">
          Page Not Found in the Code Universe
        </h2>
        <p className="text-cyan-200 mb-8 max-w-xl mx-auto">
          The page you're looking for might have been deleted, renamed, or moved into a parallel dimension.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
