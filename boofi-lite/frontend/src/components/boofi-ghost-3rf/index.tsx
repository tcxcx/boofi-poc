// "use client";

// import React, { useRef, useEffect } from "react";
// import { useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import * as THREE from "three";

// export default function BoofiGhost({ audioLevel }) {
//   const { scene, nodes, materials, animations } = useGLTF("/boofi-ghost.glb");
//   const ghostRef = useRef();
//   const mouthRef = useRef();
//   const mixerRef = useRef(new THREE.AnimationMixer());

//   useFrame((state, delta) => {
//     mixerRef.current.update(delta);
//     if (ghostRef.current) {
//       // Simple bobbing animation
//       ghostRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 + 0.1;

//       // Animate mouth based on audio level
//       if (mouthRef.current) {
//         mouthRef.current.scale.y = THREE.MathUtils.clamp(1 + audioLevel * 0.5, 1, 1.5); // Clamped for stability
//       }
//     }
//   });

//   useEffect(() => {
//     if (animations.length > 0 && ghostRef.current) {
//       const action = mixerRef.current.clipAction(animations[0], ghostRef.current);
//       action.play();
//       return () => {
//         action.stop();
//       };
//     }
//   }, [animations]);

//   return (
//     <group ref={ghostRef} dispose={null}>
//       <mesh
//         ref={mouthRef}
//         geometry={nodes.BoofiMouth.geometry}
//         material={materials.BoofiMouthMaterial}
//       />
//       <mesh
//         geometry={nodes.BoofiGhost.geometry}
//         material={materials.BoofiGhostMaterial}
//       />
//     </group>
//   );
// }

// useGLTF.preload("/boofi-ghost.glb");
