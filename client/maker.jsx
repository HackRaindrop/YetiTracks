const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const attack = e.target.querySelector('#domoAttack').value;
    const health = e.target.querySelector('#domoHealth').value;
    const level = e.target.querySelector('#domoLevel').value;

    if (!name || !age || !attack || !health || !level) {
        helper.handleError("All fields are required!");
        return false;
    }

    helper.sendPost(e.target.action, { name, age, attack, health, level }, onDomoAdded);
    return false;
};

const DomoForm = (props) => {
    return (
        <form id='domoForm'
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name='domoForm'
            action='/maker'
            method='POST'
            className='domoForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id='domoName' type='text' name='name' placeholder='Domo Name' />

            <label htmlFor='age'>Age: </label>
            <input id='domoAge' type='number' min='0' name='age' />

            <label htmlFor='attack'>Attack: </label>
            <input id='domoAttack' type='number' min='0' name='attack' />

            <label htmlFor='health'>Health: </label>
            <input id='domoHealth' type='number' min='0' name='health' />

            <label htmlFor='level'>Level: </label>
            <input id='domoLevel' type='number' min='1' name='level' />

            <input className='makeDomoSubmit' type='submit' value='Make a Domo' />
        </form>
    );
};

const DomoList = (props) => {
    const [domos, setDomos] = useState(props.domos);

    useEffect(() => {
        const loadDomosFromServer = async () => {
            const response = await fetch('/getDomos');
            const data = await response.json();
            setDomos(data.domos);
        };
        loadDomosFromServer();
    }, [props.reloadDomos]);

    if (domos.length === 0) {
        return (
            <div className='domoList'>
                <h3 className='emptyDomo'>No Domos Yet! </h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => {
        return (
            <div key={domo.id} className='domo'>
                <img src='assets/img/domoface.jpeg' alt='domo face' className='domoFace' />
                <div>
                    <h3 className='domoName'>{domo.name}</h3>
                    <h3 className='domoAge'>Age: {domo.age}</h3>
                    <h3 className='domoLevel'>Level: {domo.level}</h3>
                    <h3 className='domoAttack'>Attack: {domo.attack}</h3>
                    <h3 className='domoHealth'>Health: {domo.health}</h3>
                </div>
            </div>
        );
    });

    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    );
};

const App = () => {
    const [reloadDomos, setReloadDomos] = useState(false);

    return (
        <div>
            <div id='makeDomo'>
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
            <div id='domos'>
                <DomoList domos={[]} reloadDomos={reloadDomos} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;