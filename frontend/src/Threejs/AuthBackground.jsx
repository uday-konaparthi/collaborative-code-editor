import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function ThreeBackground() {
  const mountRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Points
    const pointsCount = 80;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Use a texture for glowing points (optional)
    // You can create a simple circle texture or download a small glow png
    const sprite = new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/sprites/disc.png"
    );

    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      map: sprite,
      alphaTest: 0.01,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Lines connecting points
    const maxDistance = 15;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    const lineSegmentsGeometry = new THREE.BufferGeometry();
    let linePositions = [];

    function updateLines() {
      linePositions = [];

      for (let i = 0; i < pointsCount; i++) {
        for (let j = i + 1; j < pointsCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < maxDistance) {
            linePositions.push(
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2],
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2]
            );
          }
        }
      }
      lineSegmentsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
      lineSegmentsGeometry.computeBoundingSphere();
    }

    const lines = new THREE.LineSegments(lineSegmentsGeometry, lineMaterial);
    scene.add(lines);

    // Rotating Wireframe Icosahedron
    const geometryShape = new THREE.IcosahedronGeometry(10, 0);
    const wireframe = new THREE.WireframeGeometry(geometryShape);
    const lineShape = new THREE.LineSegments(wireframe);
    lineShape.material.depthTest = false;
    lineShape.material.opacity = 0.2;
    lineShape.material.transparent = true;
    scene.add(lineShape);

    // Movement speeds
    const speeds = [];
    for (let i = 0; i < pointsCount; i++) {
      speeds.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    // For pulsating points size
    const baseSize = 1.5;

    // Mouse parallax variables
    let mouseX = 0,
      mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function onMouseMove(event) {
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;
    }
    window.addEventListener("mousemove", onMouseMove, false);

    function animate() {
      requestAnimationFrame(animate);

      // Move points
      for (let i = 0; i < pointsCount; i++) {
        positions[i * 3] += speeds[i].x;
        positions[i * 3 + 1] += speeds[i].y;
        positions[i * 3 + 2] += speeds[i].z;

        if (positions[i * 3] > 40 || positions[i * 3] < -40) speeds[i].x = -speeds[i].x;
        if (positions[i * 3 + 1] > 40 || positions[i * 3 + 1] < -40)
          speeds[i].y = -speeds[i].y;
        if (positions[i * 3 + 2] > 40 || positions[i * 3 + 2] < -40)
          speeds[i].z = -speeds[i].z;
      }
      geometry.attributes.position.needsUpdate = true;

      updateLines();

      // Pulsate size with sine wave
      const time = Date.now() * 0.005;
      material.size = baseSize + Math.sin(time) * 0.7;

      // Color shift hue over time
      const h = (Date.now() * 0.0001) % 1; // cycle 0-1
      material.color.setHSL(h, 1, 0.5);

      // Parallax camera movement
      camera.position.x += (mouseX * 20 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 20 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate wireframe shape
      lineShape.rotation.x += 0.0015;
      lineShape.rotation.y += 0.002;

      renderer.render(scene, camera);
    }
    animate();

    // Resize handling
    function onResize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(circle at center, #0a0f1f 0%, #000 100%)",
      }}
    />
  );

}

export default ThreeBackground;
