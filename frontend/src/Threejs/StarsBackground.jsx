import React from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

const StarsBackground = () => {
  return (
    <Canvas className="absolute top-0 left-0 w-full h-full z-0">
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
    </Canvas>
  );
};

export default StarsBackground;
