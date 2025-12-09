//Maker page - log ski runs and view run history
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
const { decode } = require('html-entities');

//Handle form submission for new ski run
const handleSkiRun = (e, onSkiRunAdded) => {
    e.preventDefault();
    helper.hideError();

    //Get form values
    const slopeName = e.target.querySelector('#skiRunSlopeName').value;
    const duration = e.target.querySelector('#skiRunDuration').value;
    const difficulty = e.target.querySelector('#skiRunDifficulty').value;
    const verticalDrop = e.target.querySelector('#skiRunVerticalDrop').value;
    const speed = e.target.querySelector('#skiRunSpeed').value;

    //Validate all fields
    if (!slopeName || !duration || !difficulty || !verticalDrop || !speed) {
        helper.handleError("All fields are required!");
        return false;
    }

    helper.sendPost(e.target.action, { slopeName, duration, difficulty, verticalDrop, speed }, onSkiRunAdded);
    return false;
};

//Form component for logging new runs
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

//Ad placeholder for free users
const AdBanner = ({ isPremium }) => {
    if (isPremium) return null;
    
    return (
        <div className="ad-banner">
            <div className="ad-content">
                <span className="ad-label">Advertisement</span>
                <div className="ad-placeholder">
                    <p>Your Ad Here</p>
                    <p className="ad-size">Banner Ad (728x90)</p>
                </div>
                <a href="/premium" className="ad-remove">Remove ads with Premium</a>
            </div>
        </div>
    );
};

//Banner showing run count and limit
const RunLimitBanner = ({ runCount, runLimit, isPremium }) => {
    //Premium users have unlimited
    if (isPremium) {
        return (
            <div className='runLimitBanner premium'>
                Premium User - Unlimited Runs
            </div>
        );
    }

    const remaining = runLimit - runCount;
    const isNearLimit = remaining <= 10;

    return (
        <div className={`runLimitBanner ${isNearLimit ? 'warning' : ''}`}>
            {runCount} / {runLimit} runs used
            {remaining <= 0 ? (
                <span> - <a href='/premium'>Upgrade to Premium</a> for more!</span>
            ) : (
                <span> ({remaining} remaining)</span>
            )}
        </div>
    );
};

//List component displaying all user's ski runs
const SkiRunList = (props) => {
    const [skiRuns, setSkiRuns] = useState(props.skiRuns);
    const [runCount, setRunCount] = useState(0);
    const [runLimit, setRunLimit] = useState(50);
    const [isPremium, setIsPremium] = useState(false);

    //Fetch runs from server
    useEffect(() => {
        const loadSkiRunsFromServer = async () => {
            const response = await fetch('/getSkiRuns');
            const data = await response.json();
            setSkiRuns(data.skiRuns);
            setRunCount(data.runCount || data.skiRuns.length);
            setRunLimit(data.runLimit || 50);
            setIsPremium(data.isPremium || false);
        };
        loadSkiRunsFromServer();
    }, [props.reloadSkiRuns]);

    //Handle delete ski run
    const handleDelete = async (id) => {
        if (!confirm('Delete this ski run?')) return;
        
        try {
            const response = await fetch('/deleteSkiRun', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (data.message) {
                props.triggerReload();
            } else if (data.error) {
                helper.handleError(data.error);
            }
        } catch (err) {
            helper.handleError('Error deleting run');
        }
    };

    //Empty state
    if (skiRuns.length === 0) {
        return (
            <div className='skiRunList'>
                <RunLimitBanner runCount={runCount} runLimit={runLimit} isPremium={isPremium} />
                <h3 className='emptySkiRun'>No Ski Runs Yet! </h3>
            </div>
        );
    }

    //Map runs to display nodes
    const skiRunNodes = skiRuns.map(skiRun => {
        //Return difficulty icon based on level
        const runDifficulty = () => {
            switch (skiRun.difficulty) {
                case 'Green':
                    return <img src='assets/img/greenCircle.png' alt='Green' className='difficultyIcon' />;
                case 'Blue':
                    return <img src='assets/img/blueSquare.png' alt='Blue' className='difficultyIcon' />;
                case 'Black':
                    return <img src='assets/img/blackDiamond.png' alt='Black' className='difficultyIcon' />;
                case 'Double Black':
                    return (
                        <>
                            <img src='assets/img/blackDiamond.png' alt='Double Black' className='difficultyIcon' />
                            <img src='assets/img/blackDiamond.png' alt='Double Black' className='difficultyIcon' />
                        </>
                    );
                case 'Off Piste':
                    return <span className='offPiste'>Off Piste</span>;
                default:
                    return null;
            }
        };
        return (
            <div key={skiRun._id} className='skiRun'>
                <img src='assets/img/yeti.png' alt='yeti icon' className='skiRunIcon' />
                <div>
                    <h3 className='skiRunSlopeName'>{decode(skiRun.slopeName)}</h3>
                    <h3 className='skiRunDuration'>Duration: {skiRun.duration} min</h3>
                    <h3 className='skiRunSpeed'>Speed: {skiRun.speed} mph</h3>
                    <h3 className='skiRunDifficulty'>{runDifficulty()}</h3>
                    <h3 className='skiRunVerticalDrop'>Vertical Drop: {skiRun.verticalDrop} ft</h3>
                </div>
                <button className='deleteBtn' onClick={() => handleDelete(skiRun._id)}>×</button>
            </div>
        );
    });

    return (
        <div className='skiRunList'>
            <RunLimitBanner runCount={runCount} runLimit={runLimit} isPremium={isPremium} />
            {skiRunNodes}
        </div>
    );
};

//Main app component
const App = () => {
    const [reloadSkiRuns, setReloadSkiRuns] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    //Check premium status on mount
    useEffect(() => {
        const checkPremium = async () => {
            try {
                const response = await fetch('/getPremiumStatus');
                const data = await response.json();
                setIsPremium(data.isPremium);
            } catch (err) {
                console.error('Error checking premium:', err);
            }
        };
        checkPremium();
    }, []);

    return (
        <div>
            <AdBanner isPremium={isPremium} />
            <div id='makeSkiRun'>
                <SkiRunForm triggerReload={() => setReloadSkiRuns(!reloadSkiRuns)} />
            </div>
            <div id='skiRuns'>
                <SkiRunList skiRuns={[]} reloadSkiRuns={reloadSkiRuns} triggerReload={() => setReloadSkiRuns(!reloadSkiRuns)} />
            </div>
            <AdBanner isPremium={isPremium} />
        </div>
    );
};

//Initialize React app
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
