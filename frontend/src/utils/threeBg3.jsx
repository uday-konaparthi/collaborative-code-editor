import * as THREE from "three";
import { useEffect, useRef } from "react";

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Geometry & material
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00fff6, metalness: 0.5, roughness: 0.2 });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      knot.rotation.x += 0.01;
      knot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default ThreeBackground;
