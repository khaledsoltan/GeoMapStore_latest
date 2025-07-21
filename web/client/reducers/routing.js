/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TOGGLE_CONTROL } from '../actions/controls';
import { CHANGE_DRAWING_STATUS, GEOMETRY_CHANGED } from '../actions/draw';

// Reducer that handles control state for the routing plugin
export default (state = { 
    text: "SAMPLE TEXT", 
    enabled: false,
    drawnPoints: [],
    isDrawing: false
}, action) => {
    switch (action.type) {
        case TOGGLE_CONTROL:
            if (action.control === 'Routing_dialog') {
                return {
                    ...state,
                    enabled: action.property === 'enabled' ? !state.enabled : action.property
                };
            }
            return state;
        case CHANGE_DRAWING_STATUS:
            if (action.owner === 'routing') {
                return {
                    ...state,
                    isDrawing: action.status === 'start' || action.status === 'drawOrEdit'
                };
            }
            return state;
        case GEOMETRY_CHANGED:
            if (action.features && action.features.length > 0) {
                return {
                    ...state,
                    drawnPoints: action.features.map(feature => ({
                        id: feature.id,
                        geometry: feature.geometry,
                        properties: feature.properties || {}
                    }))
                };
            }
            return state;
        default:
            return state;
    }
};