import React from 'react';

export default function LoadingScreen({ message = "Syncing SentiNews Terminal..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      width: "100%",
      height: "100%",
      flex: 1,
      gap: "24px",
      padding: "40px",
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .ms-spinner {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .ms-dot {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: rotate(225deg);
          animation: msOrbit 5.5s infinite;
        }

        .ms-dot::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--neon-cyan);
          box-shadow: 0 0 10px var(--neon-cyan);
        }

        .ms-dot:nth-child(1) { animation-delay: 0s; }
        .ms-dot:nth-child(2) { animation-delay: 0.24s; }
        .ms-dot:nth-child(3) { animation-delay: 0.48s; }
        .ms-dot:nth-child(4) { animation-delay: 0.72s; }
        .ms-dot:nth-child(5) { animation-delay: 0.96s; }

        @keyframes msOrbit {
          0% {
            transform: rotate(225deg);
            opacity: 1;
            animation-timing-function: ease-out;
          }
          7% {
            transform: rotate(345deg);
            animation-timing-function: linear;
          }
          30% {
            transform: rotate(455deg);
            animation-timing-function: ease-in-out;
          }
          39% {
            transform: rotate(690deg);
            animation-timing-function: linear;
          }
          70% {
            transform: rotate(815deg);
            opacity: 1;
            animation-timing-function: ease-out;
          }
          75% {
            transform: rotate(945deg);
            animation-timing-function: linear;
          }
          76% {
            opacity: 0;
            transform: rotate(945deg);
          }
          100% {
            opacity: 0;
            transform: rotate(945deg);
          }
        }
      `}} />
      
      <div className="ms-spinner">
        <div className="ms-dot" />
        <div className="ms-dot" />
        <div className="ms-dot" />
        <div className="ms-dot" />
        <div className="ms-dot" />
      </div>
      
      {message && (
        <span style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          textAlign: "center",
          marginTop: "4px",
        }}>
          {message}
        </span>
      )}
    </div>
  );
}
