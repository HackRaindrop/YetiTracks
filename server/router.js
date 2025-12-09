//Router - defines all application routes
const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  //Ski run routes
  app.get('/getSkiRuns', mid.requiresLogin, controllers.SkiRun.getSkiRuns);

  //Auth routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  //Maker page routes
  app.get('/maker', mid.requiresLogin, controllers.SkiRun.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.SkiRun.makeSkiRun);
  app.post('/deleteSkiRun', mid.requiresLogin, controllers.SkiRun.deleteSkiRun);

  //Stats page
  app.get('/stats', mid.requiresLogin, controllers.SkiRun.statsPage);

  //Account management
  app.get('/accountManagement', mid.requiresSecure, mid.requiresLogin, controllers.Account.accountManagementPage);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);

  //Premium routes
  app.get('/premium', mid.requiresLogin, controllers.Account.premiumPage);
  app.post('/upgradePremium', mid.requiresLogin, controllers.Account.upgradeToPremium);
  app.post('/togglePremium', mid.requiresLogin, controllers.Account.togglePremium);
  app.get('/getPremiumStatus', mid.requiresLogin, controllers.Account.getPremiumStatus);

  //Default route
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  //404 handler - must be last
  app.use((req, res) => {
    res.status(404).render('notFound');
  });
};

module.exports = router;
