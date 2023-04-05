import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    const url = `mongodb://${HOST}:${PORT}/${dbName}`;
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    /*this.client.connect().then(() => {
      this.db = this.client.db(`${dbName}`);
    }).catch((err) => {
      console.log(err.message);
    });*/
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    } finally {
      await this.client.close();
    }
    //return Boolean(this.db);
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const users = this.client.db().collection("users");
      const count = await users.countDocuments();
      return count;
    } catch (error) {
      return -1;
    } finally {
      await this.client.close();
    }
    //return this.allUsers.countDocuments();
    /*const doc = 'users';
    const allUsers = doc.find({}).toArray();
    return allUsers.length;*/
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const files = this.client.db().collection("files");
      const count = await files.countDocuments();
      return count;
    } catch (error) {
      return -1;
    } finally {
      await this.client.close();
    }
    //return this.allFiles.countDocuments();
    /*const doc = 'files';
    const allFiles = doc.find({}).toArray();
    return allFiles.length;*/
  }

  async usersCollection() {
    return this.client.db().collection("users");
  }
}

const dbClient = new DBClient();
export default dbClient;
