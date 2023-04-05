import sha1 from "sha1";
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Queue from "bull";

const queue = new Queue("queue", "redis://127.0.0.1:6379");

class UsersController {
  static postNew(req, res) {
    if (!req.body.email) {
      res.status(400).send('Missing email');
      return;
    }
    if (!req.body.password) {
      res.status(400).sed('Missing password');
      return;
    }
    const { email } = req.body;
    const { password } = req.body;

    const users = dbClient.db.collection("users");
    users.findOne({"email":email}, (err, users) => {
      if (users) {
        res.status(400).send('Already exist');
        return;
      } else {
        const hashedPass = sha1(password);
        users.insertOne({
	  email,
	  password: hasshedPass,
	})
        .then((result) => {
	  res.status(201).send({ id: result.InsertedId, email });
	  queue.add({ userId: result.insertId });
	})
        .catch((error) => console.log(error));
      }
    });
  }

  static getMe(req, res) {
    const token = req.header("X-Token")
    const key = `auth_${token}`;

    userId = redisClient.get(key);
    if (!userId) {
      res.status(401).send({ error: 'Unauthorized' });
    } else {
      users = dbClient.userCollection();
      users.findOne({
        id: userId
      }, async (err, user) => {
        if (!err) {
	  res.status(200).send({ email: user.email, id: user.id });
	} else {
	  res.status(401).send({ error: 'Unauthorized' });
	}
      })
    }
  }
}
