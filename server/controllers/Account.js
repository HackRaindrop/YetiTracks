//Account controller - handles auth and premium features
const models = require('../models');

const { Account } = models;

//Render login page
const loginPage = (req, res) => res.render('login');

//Render account management page
const accountManagementPage = (req, res) => res.render('accountManagement');

//Logout and destroy session
const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

//Authenticate user login
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/maker' });
  });
};

//Create new user account
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

//Change user password
const changePassword = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const newPass = `${req.body.newPass}`;

  if (!username || !pass || !newPass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Invalid username or passworld' });
    }

    try {
      const hash = await Account.generateHash(newPass);
      await Account.findByIdAndUpdate(account._id, { password: hash });
      const updatedAccount = await Account.findById(account._id);
      req.session.account = Account.toAPI(updatedAccount);
      return res.json({ redirect: '/maker' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'An internal error occurred' });
    }
  });
};

//Render premium page
const premiumPage = (req, res) => res.render('premium');

//Get user's premium status
const getPremiumStatus = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id);
    return res.json({ isPremium: account.premiumUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error checking premium status' });
  }
};

//Upgrade to premium (proof of concept)
const upgradeToPremium = async (req, res) => {
  try {
    await Account.findByIdAndUpdate(req.session.account._id, { premiumUser: true });
    return res.json({ message: 'Successfully upgraded to Premium!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error upgrading to premium' });
  }
};

//Toggle premium on/off (for demo)
const togglePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id);
    const newStatus = !account.premiumUser;
    await Account.findByIdAndUpdate(req.session.account._id, { premiumUser: newStatus });
    return res.json({
      isPremium: newStatus,
      message: newStatus ? 'Premium activated!' : 'Premium deactivated',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error toggling premium' });
  }
};

module.exports = {
  loginPage,
  accountManagementPage,
  changePassword,
  logout,
  login,
  signup,
  premiumPage,
  getPremiumStatus,
  upgradeToPremium,
  togglePremium,
};
