import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { LoaderCircleIcon } from 'lucide-react';

//============================================================================
// 1. Three.js Background Component
// This component creates the dynamic, low-shade WebGL background.
//============================================================================
const ThreeBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Guard against running in non-browser environments
        if (typeof window === 'undefined') {
            return;
        }

        const currentMount = mountRef.current;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // --- Shader Material ---
        // This is where the magic happens. We create a plane that fills the screen
        // and apply a custom shader to it for the animated gradient effect.
        const uniforms = {
            u_time: { value: 0.0 },
            u_mouse: { value: new THREE.Vector2() },
            u_resolution: { value: new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight) },
            u_color1: { value: new THREE.Color(0x0a0a2a) }, // Dark blue
            u_color2: { value: new THREE.Color(0x1a0a2a) }, // Dark purple
        };

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_time;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            varying vec2 vUv;

            // Simplex Noise function for organic movement
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 scaledUv = vUv * 2.0; // Scale UV for more interesting patterns
                
                // Create a time-driven, noise-based value for smooth animation
                float noise = snoise(scaledUv + u_time * 0.1);
                
                // Create a base gradient
                vec3 baseColor = mix(u_color1, u_color2, vUv.y + noise * 0.1);

                // Add a subtle ripple effect from the mouse
                float mouseDist = distance(vUv, u_mouse);
                float mouseEffect = smoothstep(0.3, 0.0, mouseDist) * 0.2;
                
                // Combine base color with mouse effect
                vec3 finalColor = baseColor + mouseEffect;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const geometry = new THREE.PlaneGeometry(2, 2); // Fills the viewport
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // --- Event Listeners & Animation ---
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            uniforms.u_resolution.value.set(currentMount.clientWidth, currentMount.clientHeight);
        };

        const handleMouseMove = (event) => {
            uniforms.u_mouse.value.set(event.clientX / window.innerWidth, 1.0 - event.clientY / window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        const clock = new THREE.Clock();
        const animate = () => {
            uniforms.u_time.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // --- Cleanup ---
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            currentMount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default ThreeBackground