const sequelize = require('./src/config/database');
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB: connection OK');
    process.exit(0);
  } catch (err) {
    console.error('DB: connection ERROR');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();