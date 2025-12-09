//Stats page - displays charts and statistics for ski runs
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
const { decode } = require('html-entities');
const {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} = require('recharts');

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

//Locked chart overlay for non-premium users
const LockedChart = ({ title }) => (
    <div className="chart-container locked-chart">
        <h3 className="chart-title">{title}</h3>
        <div className="locked-overlay">
            <p className="locked-text">Premium Feature</p>
            <p className="locked-subtext">Upgrade to Premium to unlock this chart</p>
            <a href="/premium" className="locked-btn">View Premium</a>
        </div>
    </div>
);

//Color mapping for difficulty levels
const DIFFICULTY_COLORS = {
    'Green': '#2ecc71',
    'Blue': '#3498db',
    'Black': '#2c3e50',
    'Double Black': '#1a252f',
    'Off Piste': '#f39c12'
};

//Custom tooltip component for bar charts
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

//Bar chart showing duration per run
const DurationChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map(run => ({
        name: decode(run.slopeName),
        Duration: run.duration
    }));

    return (
        <div className="chart-container">
            <h3 className="chart-title">Duration by Run (min)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="Duration" fill="#3498db" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

//Bar chart showing vertical drop per run
const VerticalDropChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map(run => ({
        name: decode(run.slopeName),
        'Vertical Drop': run.verticalDrop
    }));

    return (
        <div className="chart-container">
            <h3 className="chart-title">Vertical Drop by Run (ft)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="Vertical Drop" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

//Bar chart showing speed per run
const SpeedChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map(run => ({
        name: decode(run.slopeName),
        Speed: run.speed
    }));

    return (
        <div className="chart-container">
            <h3 className="chart-title">Speed by Run (mph)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="Speed" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

//Pie chart showing run distribution by difficulty
const DifficultyPieChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const difficulties = ['Green', 'Blue', 'Black', 'Double Black', 'Off Piste'];

    //Count runs per difficulty
    const counts = {};
    difficulties.forEach(d => counts[d] = 0);
    data.forEach(run => {
        if (counts[run.difficulty] !== undefined) {
            counts[run.difficulty]++;
        }
    });

    const chartData = difficulties
        .filter(d => counts[d] > 0)
        .map(difficulty => ({
            name: difficulty,
            value: counts[difficulty],
            color: DIFFICULTY_COLORS[difficulty]
        }));

    //Custom label with percentage
    const renderCustomLabel = ({ name, percent }) => {
        return `${name} (${(percent * 100).toFixed(0)}%)`;
    };

    return (
        <div className="chart-container">
            <h3 className="chart-title">Runs by Difficulty</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomLabel}
                        outerRadius={100}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

//Summary stats cards component
const SummaryStats = ({ data }) => {
    if (!data || data.length === 0) return null;

    //Calculate stats
    const totalRuns = data.length;
    const totalDuration = data.reduce((sum, run) => sum + run.duration, 0);
    const totalVertical = data.reduce((sum, run) => sum + run.verticalDrop, 0);
    const avgSpeed = (data.reduce((sum, run) => sum + run.speed, 0) / totalRuns).toFixed(1);
    const maxSpeed = Math.max(...data.map(run => run.speed));
    const avgDuration = (totalDuration / totalRuns).toFixed(1);

    return (
        <div className="summary-stats">
            <h3 className="chart-title">Your Stats Summary</h3>
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{totalRuns}</span>
                    <span className="stat-label">Total Runs</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{totalDuration}</span>
                    <span className="stat-label">Total Minutes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{totalVertical.toLocaleString()}</span>
                    <span className="stat-label">Total Vertical (ft)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{avgSpeed}</span>
                    <span className="stat-label">Avg Speed (mph)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{maxSpeed}</span>
                    <span className="stat-label">Max Speed (mph)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{avgDuration}</span>
                    <span className="stat-label">Avg Duration (min)</span>
                </div>
            </div>
        </div>
    );
};

//Main stats page component
const StatsPage = () => {
    const [skiRuns, setSkiRuns] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    //Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                //Parallel fetch for runs and premium status
                const [runsResponse, premiumResponse] = await Promise.all([
                    fetch('/getSkiRuns'),
                    fetch('/getPremiumStatus')
                ]);
                const runsData = await runsResponse.json();
                const premiumData = await premiumResponse.json();
                setSkiRuns(runsData.skiRuns);
                setIsPremium(premiumData.isPremium);
            } catch (err) {
                console.error('Error loading data:', err);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    //Loading state
    if (loading) {
        return (
            <div className="stats-container">
                <h2 className="stats-header">Loading your stats...</h2>
            </div>
        );
    }

    //Empty state
    if (skiRuns.length === 0) {
        return (
            <div className="stats-container">
                <h2 className="stats-header">No Data Yet</h2>
                <p className="stats-empty">Log some ski runs to see your statistics!</p>
                <a href="/maker" className="back-link">← Back to Logger</a>
            </div>
        );
    }

    //Render charts (some locked for free users)
    return (
        <div className="stats-container">
            <AdBanner isPremium={isPremium} />
            
            <h2 className="stats-header">Your Ski Statistics</h2>
            <a href="/maker" className="back-link">← Back to Logger</a>

            <SummaryStats data={skiRuns} />

            <div className="charts-row">
                {isPremium ? (
                    <DurationChart data={skiRuns} />
                ) : (
                    <LockedChart title="Duration by Run (min)" />
                )}
                {isPremium ? (
                    <VerticalDropChart data={skiRuns} />
                ) : (
                    <LockedChart title="Vertical Drop by Run (ft)" />
                )}
            </div>

            <AdBanner isPremium={isPremium} />

            <div className="charts-row">
                <SpeedChart data={skiRuns} />
                <DifficultyPieChart data={skiRuns} />
            </div>
        </div>
    );
};

//Initialize React app
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<StatsPage />);
};

window.onload = init;
