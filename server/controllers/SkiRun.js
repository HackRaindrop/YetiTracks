const models = require('../models');

const { SkiRun } = models;

const makeSkiRun = async (req, res) => {
  if (!req.body.slopeName || !req.body.duration || !req.body.difficulty
    || !req.body.verticalDrop || !req.body.speed) {
    return res.status(400).json({ error: 'All parameters are required' });
  }

  const skiRunData = {
    slopeName: req.body.slopeName,
    duration: req.body.duration,
    difficulty: req.body.difficulty,
    verticalDrop: req.body.verticalDrop,
    speed: req.body.speed,
    owner: req.session.account._id,
  };

  try {
    const newSkiRun = new SkiRun(skiRunData);
    await newSkiRun.save();
    return res.status(201).json({
      slopeName: newSkiRun.slopeName,
      duration: newSkiRun.duration,
      difficulty: newSkiRun.difficulty,
      verticalDrop: newSkiRun.verticalDrop,
      speed: newSkiRun.speed,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Ski run already exists' });
    }
    return res.status(500).json({ error: 'An error occurred' });
  }
};

const makerPage = (req, res) => res.render('app');

const statsPage = (req, res) => res.render('stats');

const getSkiRuns = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await SkiRun.find(query).select('slopeName duration verticalDrop difficulty speed').lean().exec();
    return res.json({ skiRuns: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving ski runs!' });
  }
};

module.exports = {
  makeSkiRun,
  getSkiRuns,
  makerPage,
  statsPage,
};
