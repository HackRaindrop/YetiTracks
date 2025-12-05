const helper = require('./helper.js');

const React = require('react');
const { createRoot } = require('react-dom/client');

const App = () => (
    <div>
        <h2>Account Management</h2>
        <h3>Change Password</h3>
    </div >
);



const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;