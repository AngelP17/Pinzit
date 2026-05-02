import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const points = useMemo(() => {
    const count = 720;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Wider horizontal spread, flatter vertical for editorial feel
      arr[i * 3 + 0] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current || reduceMotion) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.02;
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#f5f1e8"
        size={0.022}
        sizeAttenuation
        depthWrite={false}
        opacity={0.22}
      />
    </Points>
  );
}

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
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

  if (disabled || isMobile || !isWebGLAvailable()) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              setDisabled(true);
            },
            false,
          );
        }}
      >
        <ambientLight intensity={0.18} />
        <ParticleField reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
