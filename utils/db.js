const { MongoClient } = require("mongodb");

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || "files_manager";
    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      return false;
    } finally {
      await this.client.close();
    }
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
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    return this.client.db().collection("users");
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
