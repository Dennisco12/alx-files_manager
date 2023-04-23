const dbClient = require("../utils/db");
const redisClient = require("../utils/redis");

const AppController = {
  async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = await dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  },

  async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    res.status(200).json({ users, files });
  },
};

module.exports = AppController;
