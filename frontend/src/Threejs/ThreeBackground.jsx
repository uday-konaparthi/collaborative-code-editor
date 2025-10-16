// components/ThreeBackground.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
  const mountRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const animate = () => {
      requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
        renderer.dispose(); // clean up WebGL context
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default ThreeBackground;
