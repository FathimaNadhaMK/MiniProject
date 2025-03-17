
import React, { useState, useEffect } from 'react';
import './EmergencyAlert.css';

const EmergencyAlert = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'Weather',
      title: 'Heavy Rain Alert',
      description: 'Heavy rainfall expected in the next 24 hours',
      severity: 'moderate',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'Medical',
      title: 'Blood Donation Required',
      description: 'Urgent need for O+ blood type at District Hospital',
      severity: 'high',
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: 'Traffic',
      title: 'Road Closure',
      description: 'Main Street closed due to maintenance work',
      severity: 'low',
      timestamp: new Date().toISOString()
    }
  ]);

  return (
    <div className="emergency-container">
      <h1>🚨 Emergency Alerts</h1>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-card ${alert.severity}`}>
            <div className="alert-header">
              <span className="alert-type">{alert.type}</span>
              <span className={`severity-badge ${alert.severity}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            <h2>{alert.title}</h2>
            <p>{alert.description}</p>
            <span className="timestamp">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyAlert;
