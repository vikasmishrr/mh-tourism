import { useState, useEffect, useRef, useCallback } from 'react'
import Scene from './Scene'
import RenderTest from './RenderTest'
import WelcomeSplash from './ui/WelcomeSplash'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [showSplash, setShowSplash] = useState(true)
  const [showRenderTest, setShowRenderTest] = useState(false)
  const videoRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('App component mounted')
  }, [])

  const initializeCamera = useCallback(async () => {
    try {
      // Check for secure context
      if (!window.isSecureContext && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('This app requires HTTPS to access the camera.')
        setLoading(false)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setCameraStream(stream)

      // Set video source
      if (videoRef.current) {
        console.log('Connecting stream to video element')
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        videoRef.current.muted = true
        videoRef.current.style.display = 'block'
        videoRef.current.style.visibility = 'visible'
        videoRef.current.style.opacity = '1'
        
        try {
          await videoRef.current.play()
          console.log('Camera video playing successfully')
        } catch (playErr) {
          console.error('Error playing camera video:', playErr)
        }
      } else {
        console.error('Video ref is null!')
      }

      setLoading(false)
      console.log('Camera initialization complete, loading set to false')
    } catch (err) {
      console.error('Camera initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access and refresh the page.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and refresh.')
      } else {
        setError(`Camera access failed: ${err.message}. Please refresh and try again.`)
      }
      setLoading(false)
    }
  }, [])

  const handleStartFromSplash = useCallback(() => {
    setShowSplash(false)
    initializeCamera()
  }, [initializeCamera])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Toggle render test with '?' key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?') {
        setShowRenderTest(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Ensure video element is visible and connected to stream
  useEffect(() => {
    if (videoRef.current) {
      if (cameraStream) {
        console.log('Setting camera stream to video element')
        videoRef.current.srcObject = cameraStream
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err)
        })
      } else {
        console.log('No camera stream yet, video element ready')
      }
    }
  }, [cameraStream])

  // Force scene container to stay small - override any SDK sizing
  useEffect(() => {
    const enforceSceneSize = () => {
      // Target the scene container div (the one wrapping Scene component)
      const sceneContainer = document.querySelector('.scene-container')
      const canvasOverlay = document.querySelector('.canvas-overlay')
      const canvasElements = document.querySelectorAll('canvas')
      
      // Calculate size based on viewport
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isPortrait = vh > vw
      const isSmall = vw < 480
      
      const safeBottom =
        'env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px) + 20px'
      let targetWidth = '94%'
      let targetHeight = 'auto'
      let maxW = 'min(680px, 96vw)'
      let maxH = `min(860px, calc(100dvh - ${safeBottom}))`

      let topPct = '44%'
      let translateY = '-53%'

      if (!isPortrait) {
        targetWidth = '82%'
        maxW = 'min(760px, 92vw)'
        maxH = `min(600px, calc(100dvh - ${safeBottom}))`
        topPct = '48%'
        translateY = '-50%'
      } else if (isSmall) {
        targetWidth = '96%'
        maxW = 'min(640px, 98vw)'
        maxH = `min(840px, calc(100dvh - ${safeBottom}))`
        topPct = '42%'
        translateY = '-56%'
      } else {
        topPct = '43%'
        translateY = '-55%'
      }

      if (sceneContainer) {
        sceneContainer.style.setProperty('width', targetWidth, 'important')
        sceneContainer.style.setProperty('height', targetHeight, 'important')
        sceneContainer.style.setProperty('max-width', maxW, 'important')
        sceneContainer.style.setProperty('max-height', maxH, 'important')
        sceneContainer.style.setProperty('position', 'absolute', 'important')
        sceneContainer.style.setProperty('top', topPct, 'important')
        sceneContainer.style.setProperty('left', '50%', 'important')
        sceneContainer.style.setProperty(
          'transform',
          `translate(-50%, ${translateY})`,
          'important'
        )
        sceneContainer.style.setProperty('margin', '0', 'important')
        sceneContainer.style.setProperty('padding', '0', 'important')
        sceneContainer.style.setProperty('padding-bottom', '12px', 'important')
        sceneContainer.style.setProperty('box-sizing', 'border-box', 'important')
        sceneContainer.style.setProperty('overflow-y', 'auto', 'important')
        sceneContainer.style.setProperty('overflow-x', 'hidden', 'important')
        sceneContainer.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important')
      }
      
      // Also enforce canvas-overlay if it exists
      if (canvasOverlay) {
        canvasOverlay.style.setProperty('width', targetWidth, 'important')
        canvasOverlay.style.setProperty('height', targetHeight, 'important')
        canvasOverlay.style.setProperty('max-width', maxW, 'important')
        canvasOverlay.style.setProperty('max-height', maxH, 'important')
        canvasOverlay.style.setProperty('position', 'absolute', 'important')
        canvasOverlay.style.setProperty('top', '50%', 'important')
        canvasOverlay.style.setProperty('left', '50%', 'important')
        canvasOverlay.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
      }
      
      // Ensure canvas elements don't exceed container
      canvasElements.forEach(canvas => {
        if (canvas.style.width === '100vw' || canvas.style.height === '100vh' || 
            canvas.width === window.innerWidth || canvas.height === window.innerHeight) {
          canvas.style.setProperty('width', '100%', 'important')
          canvas.style.setProperty('height', '100%', 'important')
          canvas.style.setProperty('max-width', '100%', 'important')
          canvas.style.setProperty('max-height', '100%', 'important')
        }
      })
    }

    let frame = 0
    const scheduleEnforce = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        enforceSceneSize()
      })
    }

    enforceSceneSize()
    window.addEventListener('resize', scheduleEnforce)
    window.addEventListener('orientationchange', scheduleEnforce)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleEnforce)
      window.removeEventListener('orientationchange', scheduleEnforce)
    }
  }, [])

  if (showSplash) {
    return <WelcomeSplash onStart={handleStartFromSplash} />
  }

  // Camera initializing after splash
  if (loading) {
    return (
      <div style={{ 
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          Initializing Camera...
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Please allow camera access to continue
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  console.log('App render - loading:', loading, 'error:', error, 'hasStream:', !!cameraStream)
  console.log('Scene container should render:', !loading && !error && !showRenderTest)

  return (
    <div className="app-container" style={{ 
      background: '#000',
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      zIndex: 0
    }}>
      {/* Camera background - always render, even if no stream yet */}
      <video
        ref={videoRef}
        className="camera-background"
        autoPlay
        playsInline
        muted
        style={{ 
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundColor: '#000',
          minWidth: '100%',
          minHeight: '100%'
        }}
        onLoadedMetadata={() => {
          console.log('Camera video metadata loaded')
        }}
        onPlay={() => {
          console.log('Camera video started playing')
        }}
        onError={(e) => {
          console.error('Camera video error:', e)
        }}
      />
      
      {/* Fallback background if camera not ready */}
      {!cameraStream && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          zIndex: -1
        }}></div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-overlay">
          <div className="error-content">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Render Test Mode - toggle with ? key */}
      {showRenderTest && <RenderTest />}

      {/* 3D Scene - render even if camera not ready */}
      {!loading && !error && !showRenderTest && (
        <div 
          className="scene-container"
          style={{ 
            position: 'absolute',
            top: '43%',
            left: '50%',
            transform: 'translate(-50%, -55%)',
            width: '94%',
            height: 'auto',
            maxWidth: 'min(680px, 96vw)',
            maxHeight: 'min(860px, calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 20px))',
            zIndex: 10,
            pointerEvents: 'auto',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            minWidth: '280px',
            minHeight: '280px',
            margin: '0',
            padding: '0',
            paddingBottom: '12px',
            boxSizing: 'border-box',
          }}>
          <Scene />
        </div>
      )}
      
      {/* Debug overlay - hidden for premium look */}
      {false && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          color: 'black',
          padding: '10px',
          zIndex: 10000,
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '5px',
          border: '2px solid #000'
        }}>
          <div>Loading: {loading.toString()}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
          <div>Stream: {cameraStream ? 'Yes' : 'No'}</div>
          <div>Render Test: {showRenderTest ? 'ON' : 'OFF'} (Press '?' to toggle)</div>
          {videoRef.current && (
            <div>Video Ready: {videoRef.current.readyState}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

