"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BoofiGhost from "@/components/boofi-ghost";

export default function AvatarScene({ audioLevel }: { audioLevel: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <BoofiGhost audioLevel={audioLevel} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
