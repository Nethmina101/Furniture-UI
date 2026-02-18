import React from 'react'

export default function About() {
  return (
    <div className="card">
      <h1>About</h1>
      <p className="muted">
        This React app is built for the PUSL3122 scenario: an in-store designer logs in,
        creates a room and visualises furniture layouts in 2D and 3D.
      </p>
      <div className="callout">
        <strong>Note:</strong> The earlier chess “Rxf8” summary you pasted is not used
        as functional input for this app. The app is based on the coursework scenario
        requirements.
      </div>
      <p className="muted">
        Data is stored locally in your browser (LocalStorage) for easy demo and speed.
      </p>
    </div>
  )
}
