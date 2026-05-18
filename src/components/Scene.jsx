import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  Float, 
  Environment, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  PerspectiveCamera,
  Text,
  Center
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { Bloom, EffectComposer, Noise, DepthOfField, Vignette } from '@react-three/postprocessing'

// Generate 8 different shapes/colors for models
const MODELS_DATA = [
  { color: '#00f2ff', name: 'CYBER CORE', desc: 'Advanced neural interface with zero latency architecture.' },
  { color: '#ff0055', name: 'NEON PULSE', desc: 'Biometric sensory feedback loop for immersive environments.' },
  { color: '#7000ff', name: 'VOID SHIFT', desc: 'Quantum phase displacement module for spatial navigation.' },
  { color: '#00ff77', name: 'FLUX ENGINE', desc: 'Sustainable energy harvest system using kinetic friction.' },
  { color: '#fffb00', name: 'AURA SHIELD', desc: 'Adaptive electromagnetic barrier for extreme conditions.' },
  { color: '#ff7700', name: 'TITAN SHELL', desc: 'High-density carbon fiber chassis with thermal regulation.' },
  { color: '#0077ff', name: 'PRISM LINK', desc: 'Multi-spectrum optical transmitter for secure data sync.' },
  { color: '#ffffff', name: 'ZENITH ONE', desc: 'The ultimate synthesis of form, function, and future tech.' }
]

function Model({ data, index, scrollProgress }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const { viewport } = useThree()
  
  // Calculate horizontal position based on index and scroll
  // We want models to be spaced out horizontally
  const spacing = 12
  const totalWidth = MODELS_DATA.length * spacing
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Infinite loop logic for position
    // scrollProgress goes from 0 to MODELS_DATA.length
    let xPos = (index * spacing) - (scrollProgress * spacing)
    
    // Wrap around for infinite effect
    while (xPos > totalWidth / 2) xPos -= totalWidth
    while (xPos < -totalWidth / 2) xPos += totalWidth
    
    groupRef.current.position.x = xPos
    
    // Focus logic based on distance from center (0)
    const distanceFromCenter = Math.abs(xPos)
    const focusThreshold = 2
    const maxFocusDistance = spacing
    
    // Scale and opacity
    const scale = THREE.MathUtils.lerp(1.2, 0.5, Math.min(distanceFromCenter / maxFocusDistance, 1))
    groupRef.current.scale.setScalar(scale)
    
    // Update material based on focus
    if (meshRef.current.material) {
      const opacity = THREE.MathUtils.lerp(1, 0.1, Math.min(distanceFromCenter / focusThreshold, 1))
      meshRef.current.material.opacity = opacity
      meshRef.current.material.transparent = true
      
      // Blur effect is simulated with post-processing, but we can darken side models
      const intensity = THREE.MathUtils.lerp(1.5, 0.2, Math.min(distanceFromCenter / focusThreshold, 1))
      meshRef.current.material.emissiveIntensity = intensity
    }

    // Auto-rotate if in center
    if (distanceFromCenter < focusThreshold) {
      meshRef.current.rotation.y += delta * 0.5
    } else {
      // Slow down rotation when moving away
      meshRef.current.rotation.y += delta * 0.1
    }
    
    // Idle floating
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.2
  })

  // Choose a geometry based on index to have 8 different models
  const Geometry = useMemo(() => {
    const geometries = [
      new THREE.TorusKnotGeometry(1, 0.3, 128, 32),
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.DodecahedronGeometry(1.2, 0),
      new THREE.TorusGeometry(1, 0.4, 32, 100),
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.CapsuleGeometry(0.8, 1, 4, 32),
      new THREE.SphereGeometry(1.2, 64, 64)
    ]
    return geometries[index % geometries.length]
  }, [index])

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef} geometry={Geometry}>
          <MeshDistortMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={1}
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </mesh>
        
        {/* Rim Light Glow Effect */}
        <pointLight color={data.color} intensity={2} distance={5} />
      </Float>
    </group>
  )
}

function Scene() {
  const scrollProgress = useRef(0)
  const { mouse } = useThree()
  const cameraRef = useRef()

  useEffect(() => {
    // Sync scrollProgress with GSAP ScrollTrigger
    gsap.to(scrollProgress, {
      current: MODELS_DATA.length,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrub
        onUpdate: (self) => {
          scrollProgress.current = self.progress * MODELS_DATA.length
          // Custom event to update UI
          window.dispatchEvent(new CustomEvent('scrollUpdate', { detail: self.progress }))
        }
      }
    })
  }, [])

  useFrame((state, delta) => {
    // Parallax camera effect
    if (cameraRef.current) {
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, mouse.x * 2, 0.05)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, mouse.y * 2, 0.05)
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 10]} fov={35} />
      
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      {MODELS_DATA.map((data, i) => (
        <Model 
          key={i} 
          index={i} 
          data={data} 
          scrollProgress={scrollProgress.current} 
        />
      ))}

      {/* Fog and Particles */}
      <fog attach="fog" args={['#000000', 5, 20]} />
      
      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          intensity={1.5} 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          height={300} 
        />
        <DepthOfField 
          focusDistance={0} 
          focalLength={0.02} 
          bokehScale={5} 
          height={480} 
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  )
}

export default Scene
