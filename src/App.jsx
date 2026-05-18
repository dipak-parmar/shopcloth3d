import React, { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => {
      lenis.destroy()
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="main-container">
      {loading && (
        <div className="loader-container">
          <div className="loader-text">Loading Experience</div>
        </div>
      )}
      
      <div className="canvas-wrapper" style={{ height: '100vh', width: '100%', position: 'fixed', top: 0, left: 0 }}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 35 }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#000000']} />
          <Scene />
        </Canvas>
      </div>

      <Overlay />
      
      {/* Scroll area for Lenis/GSAP to work with */}
      <div className="scroll-content" style={{ height: '800vh' }}></div>

      <div className="scroll-indicator">
        <div className="scroll-line"></div>
      </div>
    </div>
  )
}

export default App
