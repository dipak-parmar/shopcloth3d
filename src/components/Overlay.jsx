import React, { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

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

function Overlay() {
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const infoRef = useRef()

  useEffect(() => {
    const handleScroll = (e) => {
      const p = e.detail
      setProgress(p)
      
      // Calculate which index is in center
      // Since it's infinite, we use modulo
      const index = Math.round(p * MODELS_DATA.length) % MODELS_DATA.length
      if (index !== currentIndex) {
        // Animate text change
        gsap.to(infoRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            setCurrentIndex(index)
            gsap.to(infoRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out'
            })
          }
        })
      }
    }

    window.addEventListener('scrollUpdate', handleScroll)
    return () => window.removeEventListener('scrollUpdate', handleScroll)
  }, [currentIndex])

  return (
    <div className="overlay">
      <nav className="navbar">
        <div className="logo">PV_SHOP</div>
        <div className="nav-links">
          <a href="#" className="nav-link">Showroom</a>
          <a href="#" className="nav-link">Specs</a>
          <a href="#" className="nav-link">Order</a>
        </div>
      </nav>

      <div className="model-info" ref={infoRef}>
        <h1 className="model-name">{MODELS_DATA[currentIndex].name}</h1>
        <p className="model-desc">{MODELS_DATA[currentIndex].desc}</p>
      </div>

      <footer className="footer">
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentIndex + 1) / MODELS_DATA.length * 100}%` }}
            ></div>
          </div>
          <div className="counter">
            0{currentIndex + 1} / 0{MODELS_DATA.length}
          </div>
        </div>
        
        <div className="meta-info" style={{ textAlign: 'right', fontSize: '0.7rem', opacity: 0.4, letterSpacing: '2px' }}>
          CORE_LATENCY: 0.002MS<br />
          UPTIME: 99.99%<br />
          STATUS: OPTIMAL
        </div>
      </footer>
    </div>
  )
}

export default Overlay
