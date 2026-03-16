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
        <strong>Note:</strong> This React application allows users to design and visualize room layouts with furniture placement in both 2D and 3D views. The system enables a designer to log in, create a room, and arrange furniture interactively to explore different layout options. The application focuses on user interface design, interactive visualisation, and front-end web development concepts.
      </div>
      <p className="muted">
        Data is stored locally in your browser (LocalStorage) for easy demo and speed.
      </p>
    </div>
  )
}
