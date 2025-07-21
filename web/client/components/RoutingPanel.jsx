import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { changeDrawingStatus } from '../actions/draw';
import './RoutingPanel.css';

// HERE API Configuration
const HERE_API_KEY = 'Z8GuSnyImHGYh-ZdUOMaLKiwzeFosqQFfG97fkx9Kpc';
const HERE_BASE_URL = 'https://router.hereapi.com/v8/routes';

// Modern UI Styles
const styles = {
  container: {
    width: '320px',
    maxHeight: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid #e1e5e9',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    padding: '16px 20px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
    borderBottom: '1px solid #e1e5e9'
  },
  content: {
    padding: '20px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    display: 'block',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box'
  },
  inputFocus: {
    borderColor: '#667eea',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
  },
  drawButton: {
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
    color: '#ffffff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)'
  },
  drawingStatus: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
  },
  transportModes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  },
  modeButton: {
    padding: '12px 8px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modeButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
    color: '#ffffff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)'
  },
  trafficToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  checkbox: {
    transform: 'scale(1.1)',
    accentColor: '#667eea'
  },
  toggleLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer'
  },
  routeButton: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#667eea',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  routeButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed'
  },
  routeButtonHover: {
    backgroundColor: '#5a67d8',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  routeResults: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  },
  routeStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  routeStat: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534'
  },
  routeStatus: {
    fontSize: '12px',
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '500'
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  secondaryButton: {
    background: 'none',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  resetButton: {
    background: 'none',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

// CSS Animation for loading spinner
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RoutingPanel = ({ dispatch, tempFeatures = [], features = [], mapState }) => {
  const [mode, setMode] = useState('car');
  const [traffic, setTraffic] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);
  const mapRef = useRef(null);

  // Get map instance from props
  const map = mapState && (mapState.present || mapState);

  // HERE API routing function
  const getRoute = async (origin, dest, transportMode = 'car') => {
    if (!origin || !dest) {
      alert('Please set both source and destination');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: origin,
        destination: dest,
        transportMode: transportMode,
        return: 'summary,polyline',
        apiKey: HERE_API_KEY
      });

      const response = await fetch(`${HERE_BASE_URL}?${params}`);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route);
        
        const duration = Math.round(route.summary.duration / 60);
        const distance = Math.round(route.summary.length / 1000);
        alert(`✅ Route Found!\n\nDuration: ${duration} minutes\nDistance: ${distance} km\nTransport Mode: ${transportMode.toUpperCase()}\n\nRoute has been calculated successfully.`);
      } else {
        alert('❌ No route found!\n\nPlease check your coordinates and try again.');
      }
    } catch (error) {
      console.error('Routing error:', error);
      alert('Error calculating route');
    } finally {
      setLoading(false);
    }
  };

  // Handle drawing mode
  const handleDrawClick = (drawType) => {
    setDrawingMode(drawType);
    setFocusedInput(drawType);
    
    // Clear existing drawing
    dispatch(changeDrawingStatus('clean', '', 'Routing', [], {}));
    
    // Start drawing
    setTimeout(() => {
      dispatch(changeDrawingStatus('start', 'Point', 'Routing', [], { 
        stopAfterDrawing: true
      }));
    }, 100);
  };

  // Handle drawn features
  useEffect(() => {
    if (features && features.length > 0 && drawingMode) {
      const lastFeature = features[features.length - 1];
      if (lastFeature && lastFeature.geometry) {
        const coords = lastFeature.geometry.coordinates;
        const coordString = `${coords[1]}, ${coords[0]}`;
        
        if (drawingMode === 'source') {
          setSource(coordString);
          alert(`📍 Starting point captured!\n\nCoordinates: ${coordString}\n\nNow click the destination 📍 button to set your destination.`);
          // Auto-switch to destination drawing
          setTimeout(() => {
            handleDrawClick('destination');
          }, 1000);
        } else if (drawingMode === 'destination') {
          setDestination(coordString);
          alert(`🎯 Destination captured!\n\nCoordinates: ${coordString}\n\nYou can now calculate your route!`);
        }
        
        setDrawingMode(null);
        setFocusedInput(null);
      }
    }
  }, [features, drawingMode]);

  // Handle routing search
  const handleRoutingSearch = async () => {
    if (!source || !destination) {
      alert('Please set both source and destination');
      return;
    }
    await getRoute(source, destination, mode);
  };

  // Extract coordinates from string
  const extractCoordinates = (coordString) => {
    const match = coordString.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    return match ? [parseFloat(match[2]), parseFloat(match[1])] : null;
  };

  // Reset function
  const handleReset = () => {
    setSource('');
    setDestination('');
    setRouteData(null);
    setMarkers([]);
    setDrawingMode(null);
    setFocusedInput(null);
    alert('🔄 Reset Complete!\n\nAll coordinates, routes, and markers have been cleared.');
  };

  // Swap source and destination
  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div style={styles.container} className="routing-panel-container">
      <style>{spinnerStyle}</style>
      
      <div style={styles.header} className="routing-panel-header">
        🗺️ Route Planner
      </div>
      
      <div style={styles.content}>
        {/* Source Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label} className="routing-label">
            📍 Starting Point
          </label>
          <div style={styles.inputContainer}>
            <input 
              type="text" 
              placeholder="24.7136, 46.6753" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onFocus={() => setFocusedInput('source')}
              onBlur={() => setFocusedInput(null)}
              className="routing-input"
              style={{
                ...styles.input,
                ...(focusedInput === 'source' ? styles.inputFocus : {})
              }}
            />
            <button 
              onClick={() => handleDrawClick('source')}
              className="routing-draw-button"
              style={{
                ...styles.drawButton,
                ...(drawingMode === 'source' ? styles.drawButtonActive : {})
              }}
              title="Draw on map"
            >
              📍
            </button>
          </div>
        </div>

        {/* Destination Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            🎯 Destination
          </label>
          <div style={styles.inputContainer}>
            <input 
              type="text" 
              placeholder="24.7136, 46.6753" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setFocusedInput('destination')}
              onBlur={() => setFocusedInput(null)}
              className="routing-input"
              style={{
                ...styles.input,
                ...(focusedInput === 'destination' ? styles.inputFocus : {})
              }}
            />
            <button 
              onClick={() => handleDrawClick('destination')}
              className="routing-draw-button"
              style={{
                ...styles.drawButton,
                ...(drawingMode === 'destination' ? styles.drawButtonActive : {})
              }}
              title="Draw on map"
            >
              📍
            </button>
          </div>
        </div>

        {/* Drawing Status */}
        {drawingMode && (
          <div style={styles.drawingStatus} className="routing-drawing-status">
            🎯 Click on the map to set {drawingMode === 'source' ? 'starting point' : 'destination'}
          </div>
        )}

        {/* Swap Button */}
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <button 
            onClick={handleSwap}
            className="routing-swap-button"
            style={styles.secondaryButton}
          >
            🔄 Swap
          </button>
        </div>

        {/* Transport Modes */}
        <div style={styles.transportModes} className="routing-transport-modes">
          {[
            { key: 'car', icon: '🚗', label: 'Car' },
            { key: 'twoWheeler', icon: '🛵', label: 'Bike' },
            { key: 'bicycle', icon: '🚲', label: 'Cycle' },
            { key: 'walking', icon: '🚶', label: 'Walk' }
          ].map(m => (
            <button 
              key={m.key} 
              onClick={() => setMode(m.key)}
              className="routing-mode-button"
              style={{
                ...styles.modeButton,
                ...(mode === m.key ? styles.modeButtonActive : {})
              }}
              title={m.label}
            >
              {m.icon}
            </button>
          ))}
        </div>

        {/* Traffic Toggle */}
        <div style={styles.trafficToggle} className="routing-traffic-toggle">
          <input 
            type="checkbox" 
            checked={traffic} 
            onChange={() => setTraffic(!traffic)} 
            style={styles.checkbox}
            id="traffic-toggle"
          />
          <label htmlFor="traffic-toggle" style={styles.toggleLabel} className="routing-toggle-label">
            🚦 Show Traffic
          </label>
        </div>

        {/* Route Results */}
        {routeData && (
          <div style={styles.routeResults} className="routing-route-results">
            <div style={styles.routeStats}>
              <span style={styles.routeStat}>
                ⏱️ {Math.round(routeData.summary.duration / 60)} min
              </span>
              <span style={styles.routeStat}>
                📏 {Math.round(routeData.summary.length / 1000)} km
              </span>
            </div>
            <div style={styles.routeStatus}>
              ✅ Route calculated successfully
            </div>
          </div>
        )}

        {/* Route Button */}
        <button 
          onClick={handleRoutingSearch}
          disabled={!source || !destination || loading}
          className="routing-route-button"
          style={{
            ...styles.routeButton,
            ...((!source || !destination || loading) ? styles.routeButtonDisabled : {})
          }}
        >
          {loading ? (
            <>
              <div style={styles.loadingSpinner} className="routing-loading-spinner"></div>
              Calculating...
            </>
          ) : (
            <>
              🚗 Find Route
            </>
          )}
        </button>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            onClick={handleReset}
            className="routing-reset-button"
            style={styles.resetButton}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectedRoutingPanel = connect(
  state => ({ 
    tempFeatures: state.draw && state.draw.tempFeatures ? state.draw.tempFeatures : [],
    features: state.draw && state.draw.features ? state.draw.features : [],
    mapState: state.map
  })
)(RoutingPanel);

export default ConnectedRoutingPanel; 