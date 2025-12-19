'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// Tree component
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const initialY = position[1];
  const speed = 0.3 + Math.random() * 0.2;
  const offset = Math.random() * Math.PI * 2;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying motion
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed + offset) * 0.02;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * speed * 0.7 + offset) * 0.01;
      // Subtle floating
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 0.5 + offset) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      
      {/* Foliage layers */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#1a5c2e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.45, 0.9, 8]} />
        <meshStandardMaterial color="#22703a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <coneGeometry args={[0.3, 0.7, 8]} />
        <meshStandardMaterial color="#2d8a4a" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Leaf particles
function Leaves() {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 8,
          (Math.random() - 0.5) * 10 - 5,
        ],
        speed: 0.2 + Math.random() * 0.3,
        rotationSpeed: Math.random() * 2,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime;
      
      position.set(
        particle.position[0] + Math.sin(t * particle.speed + particle.offset) * 0.5,
        particle.position[1] - ((t * 0.3 + i) % 8),
        particle.position[2] + Math.cos(t * particle.speed + particle.offset) * 0.3
      );
      
      rotation.set(
        t * particle.rotationSpeed,
        t * particle.rotationSpeed * 0.5,
        0
      );
      quaternion.setFromEuler(rotation);
      
      matrix.compose(position, quaternion, scale);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshStandardMaterial color="#30e87a" transparent opacity={0.7} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// Light rays
function LightRays() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, 4, -5]} rotation={[0, 0, -0.3]}>
      <coneGeometry args={[3, 8, 32, 1, true]} />
      <meshBasicMaterial 
        color="#fffde7" 
        transparent 
        opacity={0.15} 
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Main scene
function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle camera movement based on mouse
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  // Generate tree positions
  const trees = useMemo(() => {
    const positions: { pos: [number, number, number]; scale: number }[] = [];
    
    // Background trees (far)
    for (let i = 0; i < 15; i++) {
      positions.push({
        pos: [(Math.random() - 0.5) * 20, -1, -8 - Math.random() * 5],
        scale: 0.8 + Math.random() * 0.4,
      });
    }
    
    // Mid trees
    for (let i = 0; i < 10; i++) {
      positions.push({
        pos: [(Math.random() - 0.5) * 16, -1.5, -4 - Math.random() * 3],
        scale: 1 + Math.random() * 0.5,
      });
    }
    
    // Foreground trees (sides only)
    positions.push({ pos: [-6, -2, -2], scale: 1.5 });
    positions.push({ pos: [6, -2, -2], scale: 1.4 });
    positions.push({ pos: [-8, -2, -1], scale: 1.8 });
    positions.push({ pos: [8, -2, -1], scale: 1.6 });
    
    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Ambient light */}
      <ambientLight intensity={0.4} color="#a8e6cf" />
      
      {/* Sun light */}
      <directionalLight
        position={[5, 10, -5]}
        intensity={1.5}
        color="#fff9c4"
        castShadow
      />
      
      {/* Fill light */}
      <pointLight position={[-5, 3, 2]} intensity={0.3} color="#81c784" />
      
      {/* Trees */}
      {trees.map((tree, i) => (
        <Tree key={i} position={tree.pos} scale={tree.scale} />
      ))}
      
      {/* Floating leaves */}
      <Leaves />
      
      {/* Light rays */}
      <LightRays />
      
      {/* Ground fog effect */}
      <mesh position={[0, -2, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial 
          color="#112117" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export function ForestScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#112117', 5, 20]} />
        <Scene />
        <Environment preset="forest" background={false} />
      </Canvas>
    </div>
  );
}
