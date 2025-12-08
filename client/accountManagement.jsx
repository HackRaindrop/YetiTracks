const helper = require('./helper.js');

const React = require('react');
const { createRoot } = require('react-dom/client');

const App = () => (
    <form id="passForm" name="passForm" action="/changePassword" method="POST" onSubmit={handlePassChange} className="mainForm">
        <div id="passwordChange">
            <h3>Change Password</h3>
            <label htmlFor="username" > Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass" >Current Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Enter old password" />
            <label htmlFor="newPass" >New Password: </label>
            <input id="newPass" type="password" name="newPass" placeholder="Enter new password" />
            <input className="formSubmit" type="submit" value="Sign in" />
        </div >
    </form>
);

const handlePassChange = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const newPass = e.target.querySelector('#newPass').value;

    if (!username || !pass || !newPass) {
        helper.handleError('Please complete all fields!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, newPass });

    return false;
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;