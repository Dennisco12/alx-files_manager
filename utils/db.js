import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const dbName = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    this.client.connect().then(() => {
      this.db = this.client.db(`${dbName}`);
    }).catch((err) => {
      console.log(err.message);
    });
    /*MongoClient.connect(`mongodb://${HOST}:${PORT}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }, (err, client) => {
      if (!err) {
        console.log('Mongo succesfully connected');
        this.db = client.db(dbName);
        this.allUsers = this.db.collection('users');
        this.allFiles = this.db.collection('files');
      } else {
        console.log('Mongo client not connected:', err.message);
        this.db = false;
      }
    });*/
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.allUsers.countDocuments();
    /*const doc = 'users';
    const allUsers = doc.find({}).toArray();
    return allUsers.length;*/
  }

  async nbFiles() {
    return this.allFiles.countDocuments();
    /*const doc = 'files';
    const allFiles = doc.find({}).toArray();
    return allFiles.length;*/
  }
}

const dbClient = new DBClient();
export default dbClient;
