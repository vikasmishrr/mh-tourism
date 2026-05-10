import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

export default function TempleVideoCard({
  videoSrc,
  templeName,
  onVideoPlaying,
  hideTitleOverlay = false,
  videoElementRef,
}) {
  const videoRef = useRef(null)

  const setVideoEl = (el) => {
    videoRef.current = el
    if (videoElementRef) videoElementRef.current = el
  }
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const previousVideoRef = useRef(null)

  // Enable audio on user interaction
  useEffect(() => {
    if (audioEnabled) return

    const videoEl = videoRef.current
    if (!videoEl) return

    const enableAudioOnReady = async () => {
      if (videoEl.readyState >= 3 && videoEl.paused === false) {
        try {
          videoEl.muted = false
          videoEl.volume = 1.0
          setAudioEnabled(true)
        } catch (err) {
          const enableOnInteraction = async () => {
            try {
              if (videoEl) {
                videoEl.muted = false
                videoEl.volume = 1.0
                await videoEl.play()
                setAudioEnabled(true)
              }
            } catch (e) {
              // Still blocked
            }
          }
          const events = ['touchstart', 'touchend', 'mousedown', 'click']
          events.forEach(event => {
            document.addEventListener(event, enableOnInteraction, { once: true, passive: true })
          })
        }
      }
    }

    if (videoEl.readyState >= 3 && !videoEl.paused) {
      enableAudioOnReady()
    } else {
      const handlePlaying = () => {
        enableAudioOnReady()
      }
      videoEl.addEventListener('playing', handlePlaying, { once: true })
      return () => {
        videoEl.removeEventListener('playing', handlePlaying)
      }
    }
  }, [audioEnabled])

  // Update video source when videoSrc changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return

    const videoEl = videoRef.current
    
    if (videoEl.src && videoEl.src !== videoSrc) {
      previousVideoRef.current = videoEl.src
    }

    setVideoReady(false)
    
    if (videoEl.src && videoEl.src !== videoSrc) {
      videoEl.style.opacity = '0.98'
    }
    
    videoEl.src = videoSrc
    videoEl.muted = !audioEnabled
    videoEl.load()
    
    const playVideo = () => {
      if (videoEl.readyState >= 3) {
        requestAnimationFrame(() => {
          videoEl.style.opacity = '1'
        })
        setVideoReady(true)
        
        const playPromise = videoEl.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!audioEnabled) {
                try {
                  videoEl.muted = false
                  videoEl.volume = 1.0
                  setAudioEnabled(true)
                } catch (err) {
                  videoEl.muted = true
                }
              } else {
                videoEl.muted = false
              }
              if (onVideoPlaying) onVideoPlaying()
            })
            .catch(() => {
              videoEl.muted = true
              videoEl.play().then(() => {
                if (onVideoPlaying) onVideoPlaying()
              })
            })
        }
      }
    }

    if (videoEl.readyState >= 3) {
      playVideo()
    } else {
      const handleReady = () => {
        if (videoEl.readyState >= 3) {
          playVideo()
        }
      }
      
      videoEl.addEventListener('canplaythrough', handleReady, { once: true })
      videoEl.addEventListener('loadeddata', handleReady, { once: true })
      videoEl.addEventListener('canplay', handleReady, { once: true })
    }
  }, [videoSrc, audioEnabled, onVideoPlaying])

  return (
    <div className="temple-video-card">
      <div className="video-wrapper">
        <video
          ref={setVideoEl}
          className="temple-video-player"
          autoPlay
          loop
          muted={!audioEnabled}
          playsInline
          preload="auto"
          volume={1}
        />
        
        {!videoReady && (
          <div className="video-loader">
            <div className="spinner"></div>
          </div>
        )}
        
        {!hideTitleOverlay && (
          <div className="temple-name-overlay">
            <h2>{templeName}</h2>
          </div>
        )}
      </div>

      <style>{`
        .temple-video-card {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .video-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.9);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .temple-video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .temple-name-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          z-index: 1;
        }

        .temple-name-overlay h2 {
          margin: 0;
          color: white;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          line-height: 1.3;
        }

        @media (max-width: 480px) {
          .temple-name-overlay h2 {
            font-size: 16px;
          }
          
          .temple-name-overlay {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}

TempleVideoCard.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  templeName: PropTypes.string.isRequired,
  onVideoPlaying: PropTypes.func,
  hideTitleOverlay: PropTypes.bool,
  videoElementRef: PropTypes.shape({ current: PropTypes.any }),
}

