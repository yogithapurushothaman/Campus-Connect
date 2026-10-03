import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function PurpleOctahedronCrystal() {
  const groupRef = useRef();
  const crystalRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.x += delta * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.6;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.6}>
      <group ref={groupRef}>
        {/* Main Outer Translucent Glass Octahedron */}
        <mesh ref={crystalRef}>
          <octahedronGeometry args={[1.7, 0]} />
          <meshPhysicalMaterial
            color="#9333EA"
            emissive="#581C87"
            emissiveIntensity={0.25}
            transmission={0.7}
            opacity={0.95}
            transparent={true}
            roughness={0.08}
            thickness={2.2}
            ior={1.6}
            reflectivity={0.95}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>

        {/* Glowing Neon Purple Edges */}
        <mesh>
          <octahedronGeometry args={[1.71, 0]} />
          <meshBasicMaterial color="#E9D5FF" wireframe opacity={0.9} transparent />
        </mesh>

        {/* Secondary Inner Core Crystal for Depth */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[1.0, 0]} />
          <meshPhysicalMaterial
            color="#C084FC"
            emissive="#7E22CE"
            emissiveIntensity={0.4}
            transmission={0.4}
            roughness={0.1}
            thickness={1.5}
          />
        </mesh>

        {/* Deep Inner Wireframe Accent */}
        <mesh>
          <octahedronGeometry args={[0.7, 0]} />
          <meshBasicMaterial color="#F3E8FF" wireframe opacity={0.6} transparent />
        </mesh>
      </group>
    </Float>
  );
}

export const FloatingNexus3D = ({ height = '350px' }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        pointerEvents: 'none',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 6.8], fov: 45 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 8]} intensity={3.0} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#C084FC" />
        <pointLight position={[0, 0, 3]} intensity={3.5} color="#A855F7" distance={10} />
        <PurpleOctahedronCrystal />
      </Canvas>
    </div>
  );
};
