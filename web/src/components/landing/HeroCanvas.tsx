import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const points = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i += 1) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.035;
    ref.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <group>
      <Points ref={ref} positions={points} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#00f0ff"
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}
