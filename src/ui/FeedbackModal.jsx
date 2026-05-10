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

function StarRow({ value, onChange, label, hint }) {
  return (
    <div className="fb-row">
      <span className="fb-row__label">{label}</span>
      <span className="fb-row__hint">{hint}</span>
      <div className="fb-stars" role="group" aria-label={label}>
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
            <div className="fb-panel__head">
              <div>
                <h2 id="fb-dialog-title" className="fb-panel__title">
                  Resort feedback
                </h2>
                <p className="fb-panel__sub">How was your stay? Rate each area below (1–5 stars).</p>
              </div>
              <button type="button" className="fb-close" onClick={onClose} aria-label="Close feedback">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {DIMENSIONS.map((d) => (
                <StarRow
                  key={d.key}
                  label={d.label}
                  hint={d.hint}
                  value={scores[d.key]}
                  onChange={(n) => setScores((s) => ({ ...s, [d.key]: n }))}
                />
              ))}

              <div className="fb-row">
                <label className="fb-row__label" htmlFor="fb-comment">
                  Anything else?
                </label>
                <span className="fb-row__hint">Optional — suggestions, shout-outs, issues…</span>
                <textarea
                  id="fb-comment"
                  className="fb-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what stood out…"
                  maxLength={1200}
                />
              </div>

              <div className="fb-actions">
                <button type="submit" className="fb-submit" disabled={!allRated}>
                  Submit feedback
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="fb-panel__head">
              <div className="fb-thanks" style={{ padding: '8px 0', textAlign: 'left', width: '100%' }}>
                <strong id="fb-dialog-title">Thank you!</strong>
                <p className="fb-panel__sub" style={{ margin: 0 }}>
                  Your ratings help MTDC improve every stay.
                </p>
              </div>
              <button type="button" className="fb-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            <button type="button" className="fb-submit" onClick={onClose}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}
