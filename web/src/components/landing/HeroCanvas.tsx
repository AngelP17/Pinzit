import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const points = useMemo(() => {
    const arr = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i += 1) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    if (reduceMotion) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.011;
    ref.current.rotation.x = state.clock.elapsedTime * 0.004;
  });

  return (
    <group>
      <Points ref={ref} positions={points} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#d5e7f6"
          size={0.038}
          sizeAttenuation
          depthWrite={false}
          opacity={0.34}
        />
      </Points>
    </group>
  );
}

export default function HeroCanvas() {
  const [disabled, setDisabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileQuery = window.matchMedia('(max-width: 640px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setIsMobile(mobileQuery.matches);
      setReduceMotion(motionQuery.matches);
    };
    update();
    mobileQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      mobileQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  if (disabled || isMobile) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 58 }}
        dpr={[1, 1.2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              setDisabled(true);
            },
            false
          );
        }}
      >
        <ambientLight intensity={0.28} />
        <ParticleCloud reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
