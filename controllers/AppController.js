import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static Status(req, res) {
    const msg = {
      "redis": redisClient.isAlive(),
      "db": dbClient.isAlive()
    }
    res.status(200).send(msg);
  }

  static stats(req, res) {
    const users = dbClient.nbUsers();
    const files = dbClient.nbFiles();
    res.status(200).send({ "users": users, "files": files });
  }
}

export default AppController;
