const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const SkiRunSchema = new mongoose.Schema({
  slopeName: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  duration: {
    type: Number,
    min: 0,
    required: true,
  },
  difficulty: {
    type: Number,
    min: 0,
    required: true,
  },
  verticalDrop: {
    type: Number,
    min: 0,
    required: true,
  },
  speed: {
    type: Number,
    min: 1,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

SkiRunSchema.statics.toAPI = (doc) => ({
  slopeName: doc.slopeName,
  duration: doc.duration,
  difficulty: doc.difficulty,
  verticalDrop: doc.verticalDrop,
  speed: doc.speed,
});

const SkiRunModel = mongoose.model('SkiRun', SkiRunSchema);
module.exports = SkiRunModel;
