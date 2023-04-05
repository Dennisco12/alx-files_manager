import { v4 as uuidv4 } from "uuid";
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';

class AuthController {
  static getConnect(req, res) {
    const Authorization = req.header('Authorization') || '';
    const userData = Authorization.split()[1];

    if (!userData) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const decodedData = Buffer.from(userData, 'base64').toString('utf-8',);

    const email = decodedData.split(':')[0];
    const password = decodeData.split(':')[1];

    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorization' });
    }

    const hashedPassword = sha1(password);

    const users = dbClient.usersCollection();
    users.findOne({
      email,
      password: hashedPassword,
    }, async(err, user) => {
      if (!err) {
        const token = uuidv4();
        const key = `auth_${token}`;
        const duration = 60 * 60 * 24;
        await redisClient.set(key, user.id.toString(), duration);
        res.status(200).send({ token });
      } else {
        res.status(401).send({ error: "Unauthorized" });
      }
    });
  }

  static getDisconnect(req, res) {
    const token = request.header("X-Token");
    if (!token) {
      return res.status(401).send({ error: 'Unauthorization' });
    }
    const key = `auth_${token}`;
    const userId = redisClient.get(key);
    if (!userId) {
      res.status(401).send({ error: 'Unauthorization' });
    } else {
      await redisClient.del(key);
      res.status(204).send({});
    }
  }
}

module.exports = AuthController;
