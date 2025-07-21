// web/client/plugins/Example.jsx
import React from 'react';
import { createPlugin } from '../utils/PluginsUtils';
const style = {
    position: "absolute",
    background: "white",
    top: 50,
    left: 50
};
const Component = () => <div style={style}>Hello</div>;
// export the plugin
export default createPlugin('Example', {
    component: Component
});
