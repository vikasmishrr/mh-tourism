import { useEffect, useRef, useState } from 'react'
import { useVideoStore } from '../store'
import { sceneVideoConfigs } from '../config/sceneVideos'
import TempleVideoCard from './TempleVideoCard'
import FeedbackModal from './FeedbackModal'
import './ar-vr-video-showcase.css'

export default function ArVrVideoShowcase({
  onVideoPlaying,
  exploreUrl = 'https://example.com',
}) {
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const mainVideoRef = useRef(null)
  const filmstripRef = useRef(null)
  const heroRef = useRef(null)

  const activeConfig =
    sceneVideoConfigs.find((v) => v.id === activeVideoId) || sceneVideoConfigs[0]

  useEffect(() => {
    const stage = heroRef.current
    if (!stage) return

    let touchStartX = 0
    let touchEndX = 0
    let isSwiping = false

    const goNext = () => {
      const i = sceneVideoConfigs.findIndex((v) => v.id === activeVideoId)
      if (i < sceneVideoConfigs.length - 1) setActiveVideo(sceneVideoConfigs[i + 1].id)
    }
    const goPrev = () => {
      const i = sceneVideoConfigs.findIndex((v) => v.id === activeVideoId)
      if (i > 0) setActiveVideo(sceneVideoConfigs[i - 1].id)
    }

    function handleStart(e) {
      isSwiping = true
      touchStartX = e.touches ? e.touches[0].clientX : e.clientX
      touchEndX = touchStartX
    }
    function handleMove(e) {
      if (!isSwiping) return
      touchEndX = e.touches ? e.touches[0].clientX : e.clientX
    }
    function handleEnd() {
      if (!isSwiping) return
      isSwiping = false
      const deltaX = touchEndX - touchStartX
      if (Math.abs(deltaX) < 52) return
      if (deltaX < 0) goNext()
      else goPrev()
    }

    stage.addEventListener('touchstart', handleStart, { passive: true })
    stage.addEventListener('touchmove', handleMove, { passive: true })
    stage.addEventListener('touchend', handleEnd, { passive: true })

    let mouseDown = false
    const onDown = (e) => {
      mouseDown = true
      handleStart(e)
    }
    const onMove = (e) => {
      if (mouseDown) handleMove(e)
    }
    const onUp = () => {
      if (mouseDown) {
        mouseDown = false
        handleEnd()
      }
    }
    stage.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      stage.removeEventListener('touchstart', handleStart)
      stage.removeEventListener('touchmove', handleMove)
      stage.removeEventListener('touchend', handleEnd)
      stage.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [activeVideoId, setActiveVideo])

  const scrollFilmstrip = (dir) => {
    filmstripRef.current?.scrollBy({ left: dir * 112, behavior: 'smooth' })
  }

  const requestMainFullscreen = () => {
    const v = mainVideoRef.current
    if (!v) return
    if (typeof v.webkitEnterFullscreen === 'function') {
      try {
        v.webkitEnterFullscreen()
        return
      } catch {
        /* fall through */
      }
    }
    const fs = v.requestFullscreen || v.webkitRequestFullscreen
    fs?.call(v).catch(() => {})
  }

  const openExternal = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`ar-vr-showcase${detailsOpen ? '' : ' ar-vr-showcase--minimal'}`}>
      <div className="ar-vr-showcase__ambient" aria-hidden />

      <div className="ar-dest-card">
        {!detailsOpen && (
          <button
            type="button"
            className="ar-dest-card__restore"
            onClick={() => setDetailsOpen(true)}
            aria-label="Show details"
          >
            ☰ Details
          </button>
        )}
        <button
          type="button"
          className="ar-dest-card__close"
          onClick={() => setDetailsOpen((o) => !o)}
          aria-label={detailsOpen ? 'Collapse details panel' : 'Expand details'}
          aria-expanded={detailsOpen}
        >
          <span aria-hidden>×</span>
        </button>

        <div className="ar-dest-card__grid">
          <aside className={`ar-dest-card__info${detailsOpen ? '' : ' ar-dest-card__info--hidden'}`}>
            <h1 className="ar-dest-card__title">Maharashtra Tourism</h1>
            <p className="ar-dest-card__tagline">Nature&apos;s balconies, vibrant cities &amp; serene escapes.</p>
            <div className="ar-dest-card__rating" aria-label="rating">
              <span className="ar-dest-card__star">★</span>
              <span className="ar-dest-card__rating-num">4.8</span>
              <span className="ar-dest-card__rating-count">(2.1k)</span>
            </div>
            <p className="ar-dest-card__desc">
              Discover MTDC through cinematic clips — from vineyards and valleys to Mumbai&apos;s energy and waterfront adventures.
            </p>

            <div className="ar-dest-card__actions">
              <button type="button" className="ar-dest-card__btn ar-dest-card__btn--primary" onClick={() => openExternal(exploreUrl)}>
                Explore More
              </button>
              <button type="button" className="ar-dest-card__btn ar-dest-card__btn--ghost" onClick={() => setFeedbackOpen(true)}>
                Feedback
              </button>
            </div>
          </aside>

          <section className="ar-dest-card__media">
            <div className="ar-dest-card__hero" ref={heroRef}>
              <div className="ar-dest-card__hero-frame">
                <TempleVideoCard
                  videoSrc={activeConfig.videoSrc}
                  templeName={activeConfig.label}
                  onVideoPlaying={onVideoPlaying}
                  hideTitleOverlay
                  videoElementRef={mainVideoRef}
                />
                <button type="button" className="ar-dest-card__expand" onClick={requestMainFullscreen} aria-label="Expand video">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ar-dest-card__filmstrip-wrap">
              <div className="ar-dest-card__filmstrip" ref={filmstripRef} role="tablist" aria-label="Clips">
                {sceneVideoConfigs.map((cfg) => (
                  <button
                    key={cfg.id}
                    type="button"
                    role="tab"
                    aria-selected={cfg.id === activeVideoId}
                    className={`ar-dest-card__thumb${cfg.id === activeVideoId ? ' ar-dest-card__thumb--active' : ''}`}
                    onClick={() => setActiveVideo(cfg.id)}
                  >
                    <span className="ar-dest-card__thumb-caption">{cfg.experienceLabel}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="ar-dest-card__filmstrip-next" onClick={() => scrollFilmstrip(1)} aria-label="More thumbnails">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
