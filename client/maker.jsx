const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
const { decode } = require('html-entities')

const handleSkiRun = (e, onSkiRunAdded) => {
    e.preventDefault();
    helper.hideError();

    const slopeName = e.target.querySelector('#skiRunSlopeName').value;
    const duration = e.target.querySelector('#skiRunDuration').value;
    const difficulty = e.target.querySelector('#skiRunDifficulty').value;
    const verticalDrop = e.target.querySelector('#skiRunVerticalDrop').value;
    const speed = e.target.querySelector('#skiRunSpeed').value;

    if (!slopeName || !duration || !difficulty || !verticalDrop || !speed) {
        helper.handleError("All fields are required!");
        return false;
    }

    helper.sendPost(e.target.action, { slopeName, duration, difficulty, verticalDrop, speed }, onSkiRunAdded);
    return false;
};

const SkiRunForm = (props) => {
    return (
        <form id='skiRunForm'
            onSubmit={(e) => handleSkiRun(e, props.triggerReload)}
            name='skiRunForm'
            action='/maker'
            method='POST'
            className='skiRunForm'
        >
            <label htmlFor='slopeName'>Slope Name: </label>
            <input id='skiRunSlopeName' type='text' name='slopeName' placeholder='Slope Name' />

            <label htmlFor='duration'>Duration (min): </label>
            <input id='skiRunDuration' type='number' min='0' name='duration' />

            <label htmlFor='difficulty'>Difficulty: </label>
            <select id='skiRunDifficulty' name='difficulty'>
                <option value='Green'>Green</option>
                <option value='Blue'>Blue</option>
                <option value='Black'>Black</option>
                <option value='Double Black'>Double Black</option>
                <option value='Off Piste'>Off Piste</option>
            </select>

            <label htmlFor='verticalDrop'>Vertical Drop (ft): </label>
            <input id='skiRunVerticalDrop' type='number' min='0' name='verticalDrop' />

            <label htmlFor='speed'>Speed (mph): </label>
            <input id='skiRunSpeed' type='number' min='1' name='speed' />

            <input className='makeSkiRunSubmit' type='submit' value='Log Ski Run' />
        </form>
    );
};

const SkiRunList = (props) => {
    const [skiRuns, setSkiRuns] = useState(props.skiRuns);

    useEffect(() => {
        const loadSkiRunsFromServer = async () => {
            const response = await fetch('/getSkiRuns');
            const data = await response.json();
            setSkiRuns(data.skiRuns);
        };
        loadSkiRunsFromServer();
    }, [props.reloadSkiRuns]);

    if (skiRuns.length === 0) {
        return (
            <div className='skiRunList'>
                <h3 className='emptySkiRun'>No Ski Runs Yet! </h3>
            </div>
        );
    }

    const skiRunNodes = skiRuns.map(skiRun => {
        const runDifficulty = () => {
            switch (skiRun.difficulty) {
                case 'Green':
                    return 'assets/img/greenCircle.png';
                case 'Blue':
                    return 'assets/img/blueSquare.png';
                case 'Black':
                    return 'assets/img/blackDiamond.png';
                case 'Double Black':
                    return <img src='assets/img/blackDiamond.png' alt='black diamond' />
            }
        }
        return (
            <div key={skiRun.id} className='skiRun'>
                <img src='assets/img/yeti.png' alt='yeti icon' className='skiRunIcon' />
                <div>
                    <h3 className='skiRunSlopeName'>{decode(skiRun.slopeName)}</h3>
                    <h3 className='skiRunDuration'>Duration: {skiRun.duration} min</h3>
                    <h3 className='skiRunSpeed'>Speed: {skiRun.speed} mph</h3>
                    <h3 className='skiRunDifficulty'>Difficulty: {runDifficulty}</h3>
                    <h3 className='skiRunVerticalDrop'>Vertical Drop: {skiRun.verticalDrop} ft</h3>
                </div>
            </div>
        );
    });

    return (
        <div className='skiRunList'>
            {skiRunNodes}
        </div>
    );
};

const App = () => {
    const [reloadSkiRuns, setReloadSkiRuns] = useState(false);

    return (
        <div>
            <div id='makeSkiRun'>
                <SkiRunForm triggerReload={() => setReloadSkiRuns(!reloadSkiRuns)} />
            </div>
            <div id='skiRuns'>
                <SkiRunList skiRuns={[]} reloadSkiRuns={reloadSkiRuns} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
