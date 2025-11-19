const models = require('../models');

const { Domo } = models;

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.attack || !req.body.health || !req.body.level) {
    return res.status(400).json({ error: 'All parameters are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    attack: req.body.attack,
    health: req.body.health,
    level: req.body.level,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({
      name: newDomo.name,
      age: newDomo.age,
      attack: newDomo.attack,
      health: newDomo.health,
      level: newDomo.level,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }
    return res.status(500).json({ error: 'An error occurred' });
  }
};

const makerPage = (req, res) => res.render('app');

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age health attack level').lean().exec();
    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

const trainDomo = async (req, res) => {
  if (!req.body.domoId || !req.body.stat) {
    return res.status(400).json({ error: 'Domo ID and stat are required' });
  }

  try {
    const domo = await Domo.findOne({ _id: req.body.domoId, owner: req.session.account._id });

    if (!domo) {
      return res.status(404).json({ error: 'Domo not found' });
    }

    // Train the specified stat
    switch (req.body.stat) {
      case 'attack':
        domo.attack += 5;
        break;
      case 'health':
        domo.health += 10;
        break;
      case 'level':
        domo.level += 1;
        break;
      default:
        return res.status(400).json({ error: 'Invalid stat type' });
    }

    await domo.save();
    return res.json({
      message: `${domo.name} trained successfully!`,
      domo: {
        name: domo.name,
        age: domo.age,
        attack: domo.attack,
        health: domo.health,
        level: domo.level,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred while training' });
  }
};

const trainingPage = (req, res) => res.render('training');

module.exports = {
  makeDomo,
  getDomos,
  makerPage,
  trainDomo,
  trainingPage,
};
