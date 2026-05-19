const app = require('../server/server');
const { ensureConnection } = require('../server/server');

// Vercel Serverless Function handler
module.exports = async (req, res) => {
  await ensureConnection();
  return app(req, res);
};
