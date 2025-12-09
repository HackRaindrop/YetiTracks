//SkiRun controller - handles ski run CRUD operations
const models = require('../models');

const { SkiRun, Account } = models;

//Free users limited to 50 runs
const FREE_RUN_LIMIT = 50;

//Create new ski run
const makeSkiRun = async (req, res) => {
  //Validate required fields
  if (!req.body.slopeName || !req.body.duration || !req.body.difficulty
    || !req.body.verticalDrop || !req.body.speed) {
    return res.status(400).json({ error: 'All parameters are required' });
  }

  try {
    //Check premium status
    const account = await Account.findById(req.session.account._id);
    const isPremium = account && account.premiumUser;

    //Enforce run limit for free users
    if (!isPremium) {
      const runCount = await SkiRun.countDocuments({ owner: req.session.account._id });
      if (runCount >= FREE_RUN_LIMIT) {
        return res.status(403).json({
          error: `Free users are limited to ${FREE_RUN_LIMIT} runs. Upgrade to Premium for unlimited runs!`,
        });
      }
    }

    //Build run data
    const skiRunData = {
      slopeName: req.body.slopeName,
      duration: req.body.duration,
      difficulty: req.body.difficulty,
      verticalDrop: req.body.verticalDrop,
      speed: req.body.speed,
      owner: req.session.account._id,
    };

    //Save to database
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

//Render maker page
const makerPage = (req, res) => res.render('app');

//Render stats page
const statsPage = (req, res) => res.render('stats');

//Get all ski runs for current user
const getSkiRuns = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await SkiRun.find(query).select('slopeName duration verticalDrop difficulty speed').lean().exec();

    //Include premium status and limits
    const account = await Account.findById(req.session.account._id);
    const isPremium = account && account.premiumUser;

    return res.json({
      skiRuns: docs,
      runCount: docs.length,
      runLimit: isPremium ? null : FREE_RUN_LIMIT,
      isPremium,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving ski runs!' });
  }
};

//Delete a ski run by ID
const deleteSkiRun = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'Run ID is required' });
  }

  try {
    //Only delete if owned by current user
    const result = await SkiRun.findOneAndDelete({
      _id: req.body.id,
      owner: req.session.account._id,
    });

    if (!result) {
      return res.status(404).json({ error: 'Run not found or not authorized' });
    }

    return res.json({ message: 'Run deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting ski run' });
  }
};

module.exports = {
  makeSkiRun,
  getSkiRuns,
  deleteSkiRun,
  makerPage,
  statsPage,
};
