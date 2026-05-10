import { useEffect, useState } from 'react'
import './feedback-modal.css'

const STORAGE_KEY = 'mtdc_resort_feedback'

const DIMENSIONS = [
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    hint: 'Rooms, bathrooms & resort upkeep',
  },
  { key: 'food', label: 'Food & dining', hint: 'Breakfast, meals & quality' },
  { key: 'vibes', label: 'Vibes & ambience', hint: 'Atmosphere, comfort & scenery' },
  { key: 'service', label: 'Staff & service', hint: 'Helpfulness & responsiveness' },
]

function StarRow({ value, onChange, label, hint, required }) {
  return (
    <div className="fb-row">
      <span className="fb-row__label">
        {label}
        {required ? <span className="fb-row__req">Required</span> : null}
      </span>
      <span className="fb-row__hint">{hint}</span>
      <div className="fb-stars" role="group" aria-label={label} aria-required={required}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`fb-star${n <= value ? ' fb-star--on' : ''}`}
            onClick={() => onChange(n)}
            aria-pressed={n <= value}
            aria-label={`${label}: ${n} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FeedbackModal({ open, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(DIMENSIONS.map((d) => [d.key, 0]))
  )
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setScores(Object.fromEntries(DIMENSIONS.map((d) => [d.key, 0])))
      setComment('')
      setSubmitted(false)
    }
  }, [open])

  const allRated = DIMENSIONS.every((d) => scores[d.key] >= 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!allRated) return

    const entry = {
      ts: Date.now(),
      ratings: { ...scores },
      comment: comment.trim(),
      destination: typeof window !== 'undefined' ? window.location.href : '',
    }

    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      prev.push(entry)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prev))
    } catch {
      /* ignore quota / privacy mode */
    }

    setSubmitted(true)
  }

  if (!open) return null

  return (
    <div className="fb-overlay" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fb-dialog-title">
        {!submitted ? (
          <>
            <header className="fb-panel__head">
              <div className="fb-panel__intro">
                <h2 id="fb-dialog-title" className="fb-panel__title">
                  Resort feedback
                </h2>
                <p className="fb-panel__sub">
                  Rate each area from 1–5 stars. All sections below are required before you can submit.
                </p>
              </div>
              <button type="button" className="fb-close" onClick={onClose} aria-label="Close feedback">
                ×
              </button>
            </header>

            <div className="fb-panel__body">
              <form id="fb-form" className="fb-form" onSubmit={handleSubmit}>
                {DIMENSIONS.map((d) => (
                  <StarRow
                    key={d.key}
                    label={d.label}
                    hint={d.hint}
                    required
                    value={scores[d.key]}
                    onChange={(n) => setScores((s) => ({ ...s, [d.key]: n }))}
                  />
                ))}

                <div className="fb-row fb-row--optional">
                  <label className="fb-row__label" htmlFor="fb-comment">
                    Anything else?
                    <span className="fb-row__tag">Optional</span>
                  </label>
                  <span className="fb-row__hint">Suggestions, shout-outs, issues…</span>
                  <textarea
                    id="fb-comment"
                    className="fb-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what stood out…"
                    maxLength={1200}
                  />
                </div>
              </form>
            </div>

            <footer className="fb-panel__footer">
              <p className="fb-panel__hint-foot" role="status">
                {!allRated ? 'Complete all star ratings to enable submit.' : 'Ready to send.'}
              </p>
              <button type="submit" form="fb-form" className="fb-submit" disabled={!allRated}>
                Submit feedback
              </button>
            </footer>
          </>
        ) : (
          <>
            <header className="fb-panel__head">
              <div className="fb-panel__intro fb-thanks">
                <strong id="fb-dialog-title">Thank you!</strong>
                <p className="fb-panel__sub">Your ratings help MTDC improve every stay.</p>
              </div>
              <button type="button" className="fb-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </header>
            <div className="fb-panel__body fb-panel__body--thanks">
              <button type="button" className="fb-submit" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
