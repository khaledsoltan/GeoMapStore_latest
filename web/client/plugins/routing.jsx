
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { connect } from 'react-redux';
import { addLayer, updateNode, removeLayer } from '../actions/layers';
import { newAnnotation, editAnnotation, storeAnnotationsSession, removeAnnotation, closeAnnotations } from '../plugins/Annotations/actions/annotations';
import { getAnnotationsSession } from '../plugins/Annotations/selectors/annotations';
import { ANNOTATIONS, createAnnotationId } from '../plugins/Annotations/utils/AnnotationsUtils';
import uuidv1 from 'uuid/v1';
import { decode } from '@here/flexpolyline';
import { Glyphicon } from 'react-bootstrap';
const CONTROL_NAME = "Routing_dialog";
import createSampleDialog from '../utils/createSampleDialog';
const Dialog = createSampleDialog(CONTROL_NAME);
import { createPlugin } from '../utils/PluginsUtils';

// Polyline decoder using HERE flexible polyline
function decodePolyline(encoded) {
    if (!encoded) return { coordinates: [], polyline: encoded };
    
    try {
        console.log('Original polyline:', encoded);
        
        // Decode the flexible polyline using HERE's official decoder
        const decoded = decode(encoded);
        console.log('Decoded coordinates:', decoded);
        console.log('Decoded polyline:', decoded.polyline);
        
        // Convert to GeoJSON format [lng, lat] for MapStore2
        // HERE returns [lat, lng] but GeoJSON expects [lng, lat]
        const coordinates = decoded.polyline.map(coord => [coord[1], coord[0]]);
        console.log('Converted coordinates for GeoJSON:', coordinates);
        
        return {
            coordinates: coordinates,
            polyline: encoded
        };
    } catch (error) {
        console.error('Error decoding HERE flexible polyline:', error);
        return { coordinates: [], polyline: encoded };
    }
}

// Utility function to parse lat,lng from string
function parseLatLng(str) {
    if (!str) return null;
    const parts = str.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
    }
    return null;
}

// Function to fetch route from HERE API
async function fetchRoute(start, end, mode = 'car') {
    const apiKey = "Z8GuSnyImHGYh-ZdUOMaLKiwzeFosqQFfG97fkx9Kpc";
    
    // Map mode to HERE API transport modes
    let transportMode;
    switch (mode) {
        case 'motorcycle':
            transportMode = 'motorcycle';
            break;
        case 'bike':
            transportMode = 'bicycle';
            break;
        case 'walk':
            transportMode = 'pedestrian';
            break;
        case 'truck':
            transportMode = 'truck';
            break;
        default:
            transportMode = 'car';
    }
    
    const url = `https://router.hereapi.com/v8/routes?transportMode=${transportMode}&routingMode=fast&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&return=polyline,summary,actions,instructions&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch route: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

const Routing = ({ text, dispatch, annotationSession }) => {
    // Routing state
    const [routingStart, setRoutingStart] = useState('');
    const [routingEnd, setRoutingEnd] = useState('');
    const [routingMode, setRoutingMode] = useState('car');
    const [routeResult, setRouteResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [routeLayerId, setRouteLayerId] = useState(null);
    const [hasRouteResults, setHasRouteResults] = useState(false);

    // Update Start/End when annotationSession changes
    React.useEffect(() => {
        if (annotationSession && Array.isArray(annotationSession.features)) {
            const points = annotationSession.features.filter(f => f.geometry && f.geometry.type === 'Point');
            if (points[0] && Array.isArray(points[0].geometry.coordinates)) {
                const [lng, lat] = points[0].geometry.coordinates;
                setRoutingStart(`${lat?.toFixed(6) || ''}, ${lng?.toFixed(6) || ''}`);
            }
            if (points[1] && Array.isArray(points[1].geometry.coordinates)) {
                const [lng, lat] = points[1].geometry.coordinates;
                setRoutingEnd(`${lat?.toFixed(6) || ''}, ${lng?.toFixed(6) || ''}`);
            }
        }
    }, [annotationSession]);

    // Function to create a new annotation for drawing points
    const createPointAnnotation = (title = 'Point Layer') => {
        const annotationId = createAnnotationId('point-drawing');
        console.log('Creating point annotation with ID:', annotationId);
        
        // Create the annotation layer
        const annotationLayer = {
            id: annotationId,
            title: title,
            type: "vector",
            features: [],
            style: {
                format: 'geostyler',
                body: {
                    rules: [
                        {
                            name: 'Point Style',
                            filter: ['==', 'annotationType', 'Point'],
                            symbolizers: [{
                                kind: 'Mark',
                                color: '#ff0000',
                                radius: 8,
                                strokeColor: '#ffffff',
                                strokeWidth: 2
                            }]
                        }
                    ]
                }
            },
            visibility: true,
            rowViewer: ANNOTATIONS
        };
        
        // Add the layer to the map
        dispatch(addLayer(annotationLayer));
        
        // Create annotation session
        const session = {
            id: annotationId,
            features: [],
            style: annotationLayer.style
        };
        
        dispatch(storeAnnotationsSession(session));
        
        // Open the annotation editor
        setTimeout(() => {
            dispatch(editAnnotation(annotationId));
        }, 100);
        
        return annotationId;
    };

    // Function to get coordinates from existing annotation points
    const getCoordinatesFromAnnotation = (pointIndex = 0) => {
        if (annotationSession && Array.isArray(annotationSession.features)) {
            const points = annotationSession.features.filter(f => f.geometry && f.geometry.type === 'Point');
            if (points[pointIndex] && Array.isArray(points[pointIndex].geometry.coordinates)) {
                const [lng, lat] = points[pointIndex].geometry.coordinates;
                return `${lat?.toFixed(6) || ''}, ${lng?.toFixed(6) || ''}`;
            }
        }
        return null;
    };

    // Function to create a separate routing layer
    const createRoutingLayer = (routeData, startPoint, endPoint) => {
        const routeId = createAnnotationId('routing-result');
        console.log('Creating routing layer with ID:', routeId);
        
        try {
            const decoded = decode(routeData.routes[0].sections[0].polyline);
            const routeCoordinates = decoded.polyline.map(coord => [coord[1], coord[0]]);
            
            // Get route color based on transport mode
            const getRouteColor = (mode) => {
                switch (mode) {
                    case 'motorcycle': return '#FF6B35';
                    case 'bike': return '#4ECDC4';
                    case 'walk': return '#45B7D1';
                    case 'truck': return '#96CEB4';
                    default: return '#0072BC';
                }
            };
            
            const routeLayer = {
                id: routeId,
                title: `Routing Result (${routingMode})`,
                type: "vector",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: routeCoordinates
                        },
                        properties: {
                            title: 'Route',
                            annotationType: "LineString",
                            id: uuidv1(),
                            startPoint: startPoint,
                            endPoint: endPoint,
                            transportMode: routingMode,
                            distance: routeData.routes[0].sections[0].summary.length,
                            duration: routeData.routes[0].sections[0].summary.duration
                        }
                    }
                ],
                style: {
                    format: 'geostyler',
                    body: {
                        rules: [
                            {
                                name: 'Route Line Style',
                                filter: ['==', 'annotationType', 'LineString'],
                                symbolizers: [{
                                    kind: 'Line',
                                    color: getRouteColor(routingMode),
                                    width: 4,
                                    opacity: 1
                                }]
                            }
                        ]
                    }
                },
                visibility: true,
                rowViewer: ANNOTATIONS
            };
            
            // Add the route layer to the map
            dispatch(addLayer(routeLayer));
            setRouteLayerId(routeId);
            
            return routeId;
        } catch (error) {
            console.error('Error creating routing layer:', error);
            throw error;
        }
    };

    // Function to remove routing layer
    const removeRoutingLayer = () => {
        if (routeLayerId) {
            dispatch(removeLayer(routeLayerId));
            setRouteLayerId(null);
        }
    };

    // Handler for getting route
    const handleGetRoute = async () => {
        const start = parseLatLng(routingStart);
        const end = parseLatLng(routingEnd);
        
        if (!start || !end) {
            setError('Please provide valid start and end coordinates');
            return;
        }

        setLoading(true);
        setError(null);
        setRouteResult(null);
        setHasRouteResults(false);

        try {
            const data = await fetchRoute(start, end, routingMode);
            setRouteResult(data);
            
            if (data.routes && data.routes[0] && data.routes[0].sections && data.routes[0].sections[0].polyline) {
                // Remove existing route layer if any
                removeRoutingLayer();
                
                // Create new routing layer
                const routeId = createRoutingLayer(data, routingStart, routingEnd);
                
                // Set route results flag to resize popup
                setHasRouteResults(true);
                
                alert(`Route created successfully!\n\nTransport Mode: ${routingMode}\nRoute layer ID: ${routeId}\nDistance: ${(data.routes[0].sections[0].summary.length / 1000).toFixed(2)} km\nDuration: ${Math.round(data.routes[0].sections[0].summary.duration / 60)} min\n\nCheck the TOC to see the new "Routing Result" layer!`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler for reset
    const handleRoutingReset = () => {
        setRoutingStart('');
        setRoutingEnd('');
        setRouteResult(null);
        setError(null);
        setHasRouteResults(false);
        removeRoutingLayer();
    };

    return (
        <Dialog floating title="🗺️ Route Planner" className="Routing-dialog" style={{
            marginLeft: hasRouteResults ? 100 : 250, 
            height: '600px', 
            maxHeight: hasRouteResults ? '650px' : '550px',
            width:'650px',
            top: '2vh',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: 'none'
        }}>
            <div style={{ 
                padding: '0', 
                Width: '650px', 
                height: '600px', 
                overflowY: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px'
            }}>
                
                {/* Header */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    padding: '20px 30px',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}>
                    <h3 style={{ 
                        margin: '0', 
                        color: '#2c3e50', 
                        fontSize: '24px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        🗺️ Route Planner
                    </h3>
                    <p style={{ 
                        margin: '8px 0 0 0', 
                        color: '#7f8c8d', 
                        fontSize: '14px',
                        fontWeight: '400'
                    }}>
                        Plan your journey with multiple transport options
                    </p>
                </div>

                {/* Main Content */}
                <div style={{
                    background: 'rgba(255,255,255,0.98)',
                    padding: '18px',
                    minHeight: '600px', 
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px'
                }}>
                    
                    {/* Input Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f8fafd 0%, #e8f4fd 100%)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '18px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 20px 0', 
                            color: '#2c3e50', 
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📍 Route Points
                        </h4>
                        
                        {/* Start field */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                🟢 Start Location
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    className="form-control"
                                    style={{ 
                                        flex: 1, 
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e1e8ed',
                                        fontSize: '14px',
                                        background: '#fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                    placeholder="Enter coordinates (lat, lng) or click 📍 to create point"
                                    value={routingStart}
                                    onChange={(e) => setRoutingStart(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-primary"
                                    title="Create point annotation for start location"
                                    onClick={() => {
                                        const coordinates = getCoordinatesFromAnnotation(0);
                                        if (coordinates) {
                                            setRoutingStart(coordinates);
                                            alert(`Start coordinates set: ${coordinates}`);
                                        } else {
                                            const annotationId = createPointAnnotation(' Point Layer');
                                            alert(`Point annotation created!\n\nLayer ID: ${annotationId}\n\nDraw a point on the map, then use the 📍 button again to get its coordinates.`);
                                        }
                                    }}
                                    style={{ 
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #007bff',
                                        background: '#fff',
                                        color: '#007bff',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        minWidth: '50px'
                                    }}
                                >
                                    📍
                                </button>
                            </div>
                        </div>
                        
                        {/* End field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                🏁 End Location
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    className="form-control"
                                    style={{ 
                                        flex: 1, 
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e1e8ed',
                                        fontSize: '14px',
                                        background: '#fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                    placeholder="Enter coordinates (lat, lng) or click 📍 to create point"
                                    value={routingEnd}
                                    onChange={(e) => setRoutingEnd(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-primary"
                                    title="Create point annotation for end location"
                                    onClick={() => {
                                        const coordinates = getCoordinatesFromAnnotation(1);
                                        if (coordinates) {
                                            setRoutingEnd(coordinates);
                                            alert(`End coordinates set: ${coordinates}`);
                                        } else {
                                            const annotationId = createPointAnnotation('End Point Layer');
                                            alert(`Point annotation created!\n\nLayer ID: ${annotationId}\n\nDraw a point on the map, then use the 📍 button again to get its coordinates.`);
                                        }
                                    }}
                                    style={{ 
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #007bff',
                                        background: '#fff',
                                        color: '#007bff',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        minWidth: '50px'
                                    }}
                                >
                                    📍
                                </button>
                            </div>
                        </div>
                        
                        {/* Transport mode dropdown */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500', 
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>
                                🚗 Transport Mode
                            </label>
                            <select
                                value={routingMode}
                                onChange={e => setRoutingMode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e1e8ed',
                                    fontSize: '14px',
                                    background: '#fff',
                                    color: '#2c3e50',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    appearance: 'none',
                                    outline: 'none',
                                    marginBottom: '0'
                                }}
                            >
                                <option value="car">🚗 Car</option>
                                <option value="scooter">🏍️ Scooter</option>
                                <option value="bike">🚲 Bike</option>
                                <option value="walk">🚶 Walk</option>
                                <option value="truck">🚛 Truck</option>
                            </select>
                        </div>
                        
                        {/* Get Route Button */}
                        <button
                            className="btn btn-primary"
                            style={{ 
                                width: "100%", 
                                padding: '14px 20px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={handleGetRoute}
                            disabled={!routingStart || !routingEnd || loading}
                        >
                            {loading ? '🔄 Calculating Route...' : '🗺️ Calculate Route'}
                        </button>

                        {/* Error Display */}
                        {error && (
                            <div style={{ 
                                color: '#dc3545', 
                                marginTop: '15px', 
                                padding: '12px 16px', 
                                background: '#f8d7da', 
                                borderRadius: '8px',
                                border: '1px solid #f5c6cb',
                                fontSize: '14px'
                            }}>
                                ❌ {error}
                            </div>
                        )}
                    </div>

                    {/* Route Results */}
                    {routeResult && routeResult.routes && routeResult.routes[0] && (
                        <div style={{
                            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                            borderRadius: '16px',
                            padding: '25px',
                            marginBottom: '25px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ 
                                margin: '0 0 20px 0', 
                                color: '#2c3e50', 
                                fontSize: '18px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📊 Route Summary
                            </h4>
                            
                            {/* Route Stats */}
                            <div
                              style={{
                                width: '800px',
                                overflowX: 'auto',
                                marginBottom: '18px'
                              }}
                            >
                              <div className="route-summary-flex">
                                <div className="route-summary-card" style={{ border: '1px solid #e1e8ed', color: '#007bff' }}>
                                  <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#007bff' }}>
                                    {(routeResult.routes[0].sections[0].summary.length / 1000).toFixed(1)}
                                  </div>
                                  <div style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: 500 }}>DISTANCE (KM)</div>
                                </div>
                                <div className="route-summary-card" style={{ border: '1px solid #e1e8ed', color: '#28a745' }}>
                                  <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#28a745' }}>
                                    {Math.round(routeResult.routes[0].sections[0].summary.duration / 60)}
                                  </div>
                                  <div style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: 500 }}>DURATION (MIN)</div>
                                </div>
                                <div className="route-summary-card" style={{ border: '1px solid #e1e8ed', color: '#ffc107' }}>
                                  <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#ffc107' }}>
                                    {((routeResult.routes[0].sections[0].summary.length / 1000) / (routeResult.routes[0].sections[0].summary.duration / 3600)).toFixed(1)}
                                  </div>
                                  <div style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: 500 }}>AVG SPEED (KM/H)</div>
                                </div>
                                <div className="route-summary-card" style={{ border: '1px solid #e1e8ed', color: '#6f42c1' }}>
                                  <div style={{ fontSize: '1.5em', fontWeight: 700, color: '#6f42c1' }}>
                                    {routingMode.toUpperCase()}
                                  </div>
                                  <div style={{ fontSize: '0.9em', color: '#6c757d', fontWeight: 500 }}>MODE</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Route Controls */}
                            {routeLayerId && (
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    marginBottom: '20px'
                                }}>
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={removeRoutingLayer}
                                        style={{ 
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid #dc3545',
                                            background: '#fff',
                                            color: '#dc3545',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        🗑️ Remove Route
                                    </button>
                                    <button
                                        className="btn btn-outline-info"
                                        onClick={() => dispatch(editAnnotation(routeLayerId))}
                                        style={{ 
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid #17a2b8',
                                            background: '#fff',
                                            color: '#17a2b8',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        ✏️ Edit Route
                                    </button>
                                </div>
                            )}
                            
                            {/* Instructions */}
                            <div>
                                <h5 style={{ 
                                    margin: '0 0 15px 0', 
                                    color: '#2c3e50', 
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🧭 Turn-by-Turn Instructions
                                </h5>
                                <div style={{ 
                                    maxHeight: hasRouteResults ? 350 : 250, 
                                    overflowY: 'auto', 
                                    background: '#fff', 
                                    borderRadius: '12px', 
                                    padding: '20px',
                                    border: '1px solid #e1e8ed'
                                }}>
                                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                        {routeResult.routes[0].sections[0].actions.map((action, idx) => (
                                            <li key={idx} style={{ 
                                                marginBottom: '12px', 
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                color: '#2c3e50'
                                            }}>
                                                {action.instruction}
                                                {action.length > 0 && (
                                                    <span style={{ 
                                                        color: '#6c757d', 
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        marginLeft: '8px'
                                                    }}> 
                                                        ({action.length}m)
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        <button 
                            className="btn btn-outline-secondary" 
                            onClick={handleRoutingReset}
                            style={{ 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #6c757d',
                                background: '#fff',
                                color: '#6c757d',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            🔄 Reset All
                        </button>
                        
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#6c757d',
                            textAlign: 'right'
                        }}>
                            Powered by HERE Maps API
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

import Message from './locale/Message';

// this is the empty reducer file to work with.
import reducer from '../reducers/Routing';

// SAMPLE CONNECTIONS TO THE STATE
const ConnectedPlugin = connect(
    state => ({
        text: state.Routing.text,
        annotationSession: getAnnotationsSession(state)
    })
)(Routing);

// control actions/reducer
// it's useful to store simple setting like open closed dialogs and so on here, in order
// to be reset on map load
import { toggleControl } from '../actions/controls';

/**
 * RoutingPlugin. A dialog window that can be opened from the burger menu.
 * This is a good point to start developing your plugin.
 * - Connect the state to Routing component
 * - Connect actions to dispatch to the Routing component (create an actionCreators file for custom actions)
 * - Edit your reducers/Routing.js file to handle the `Routing` piece of global redux state.
 * - Add epics...
 */
export default createPlugin("Routing", {
    component: ConnectedPlugin,
    containers: {
        SidebarMenu: {
            name: 'heart',
            position: 1500,
            text: <Message msgId="settings"/>,
            icon: <Glyphicon glyph="heart" />,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            priority: 1,
            doNotHide: true
        }
    },
    reducers: {
        Routing: reducer // REDUCER will be used to create the `Routing` part of global redux state (keys of the "reducers" are pieces of state)
    }
});