const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleTraining = (e, domoId, stat, onTrainingComplete) => {
    e.preventDefault();
    helper.hideError();

    if (!domoId || !stat) {
        helper.handleError("Please select a valid Domo and stat!");
        return false;
    }

    helper.sendPost('/train', { domoId, stat }, onTrainingComplete);
    return false;
};

const TrainingList = (props) => {
    const [domos, setDomos] = useState(props.domos);
    const [selectedDomo, setSelectedDomo] = useState(null);

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
            <div className='trainingArea'>
                <h3 className='emptyDomo'>No Domos to Train! Create some first!</h3>
            </div>
        );
    }

    const handleTrainStat = (stat) => {
        if (!selectedDomo) {
            helper.handleError("Please select a Domo first!");
            return;
        }
        handleTraining(
            { preventDefault: () => { } },
            selectedDomo._id,
            stat,
            props.triggerReload
        );
    };

    const domoNodes = domos.map(domo => {
        const isSelected = selectedDomo && selectedDomo._id === domo._id;
        return (
            <div
                key={domo._id}
                className={`domo ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDomo(domo)}
                style={{ cursor: 'pointer', border: isSelected ? '3px solid #4CAF50' : '1px solid #ccc' }}
            >
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
        <div>
            <div className='domoList'>
                <h2>Select a Domo to Train:</h2>
                {domoNodes}
            </div>
            {selectedDomo && (
                <div className='trainingPanel'>
                    <h2>Training {selectedDomo.name}</h2>
                    <p>Choose a stat to improve:</p>
                    <div className='trainingButtons'>
                        <button
                            className='trainButton attackButton'
                            onClick={() => handleTrainStat('attack')}
                        >
                            Train Attack (+5)
                        </button>
                        <button
                            className='trainButton healthButton'
                            onClick={() => handleTrainStat('health')}
                        >
                            Train Health (+10)
                        </button>
                        <button
                            className='trainButton levelButton'
                            onClick={() => handleTrainStat('level')}
                        >
                            Level Up (+1)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [reloadDomos, setReloadDomos] = useState(false);

    return (
        <div>
            <div id='training'>
                <TrainingList domos={[]} reloadDomos={reloadDomos} triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;

