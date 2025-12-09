//Premium page - upgrade/downgrade subscription
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//Premium benefits display
const PremiumFeatures = () => (
    <div className="premium-features">
        <h3>Premium Benefits:</h3>
        <ul>
            <li>Unlimited ski run tracking</li>
            <li>Advanced statistics and charts</li>
            <li>Ad-free experience</li>
        </ul>
    </div>
);

//Pricing card component
const PricingCard = ({ title, price, period, features, isPremium, onUpgrade, onToggle }) => (
    <div className={`pricing-card ${isPremium && title === 'Premium' ? 'premium-active' : ''}`}>
        <h3 className="pricing-title">{title}</h3>
        <div className="pricing-price">
            <span className="price-amount">${price}</span>
            <span className="price-period">/{period}</span>
        </div>
        <ul className="pricing-features">
            {features.map((feature, index) => (
                <li key={index}>{feature}</li>
            ))}
        </ul>
        {!isPremium && title === 'Premium' && (
            <button className="upgrade-btn" onClick={onUpgrade}>
                Upgrade Now
            </button>
        )}
        {isPremium && title === 'Premium' && (
            <button className="toggle-btn" onClick={onToggle}>
                Cancel Premium
            </button>
        )}
        {!isPremium && title === 'Free' && (
            <div className="current-plan">Current Plan</div>
        )}
    </div>
);

//Main premium page component
const PremiumPage = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    //Check premium status on mount
    useEffect(() => {
        const checkPremiumStatus = async () => {
            try {
                const response = await fetch('/getPremiumStatus');
                const data = await response.json();
                setIsPremium(data.isPremium);
            } catch (err) {
                console.error('Error checking premium status:', err);
            }
            setLoading(false);
        };
        checkPremiumStatus();
    }, []);

    //Upgrade to premium
    const handleUpgrade = async () => {
        try {
            const response = await fetch('/upgradePremium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.message) {
                setMessage(data.message);
                setIsPremium(true);
            } else if (data.error) {
                setMessage(data.error);
            }
        } catch (err) {
            setMessage('Error processing upgrade');
        }
    };

    //Toggle premium on/off
    const handleToggle = async () => {
        try {
            const response = await fetch('/togglePremium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.message) {
                setMessage(data.message);
                setIsPremium(data.isPremium);
            } else if (data.error) {
                setMessage(data.error);
            }
        } catch (err) {
            setMessage('Error toggling premium');
        }
    };

    //Loading state
    if (loading) {
        return (
            <div className="premium-container">
                <h2 className="premium-header">Loading...</h2>
            </div>
        );
    }

    //Feature lists
    const freeFeatures = [
        'Track up to 50 ski runs',
        'Basic statistics (Speed, Difficulty)',
        'View run history',
    ];

    const premiumFeatures = [
        'Unlimited ski runs',
        'All charts unlocked (Duration, Vertical Drop)',
        'Ad-free experience',
    ];

    return (
        <div className="premium-container">
            <h2 className="premium-header">YetiTracks Premium</h2>
            <p className="premium-subtitle">Take your skiing to the next level!</p>

            {message && <div className="premium-message">{message}</div>}

            <div className="pricing-cards">
                <PricingCard
                    title="Free"
                    price="0"
                    period="forever"
                    features={freeFeatures}
                    isPremium={isPremium}
                    onUpgrade={handleUpgrade}
                    onToggle={handleToggle}
                />
                <PricingCard
                    title="Premium"
                    price="4.99"
                    period="month"
                    features={premiumFeatures}
                    isPremium={isPremium}
                    onUpgrade={handleUpgrade}
                    onToggle={handleToggle}
                />
            </div>

            <p className="premium-disclaimer">
                *This is a proof of concept. No actual payment is processed.
            </p>
        </div>
    );
};

//Initialize React app
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<PremiumPage />);
};

window.onload = init;
