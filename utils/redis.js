import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
  constructor() {
    this.client = createClient();
    this.bindClient = promisify(this.client.get).bind(this.client);

    this.client.on('error', (err) => {
      console.log(err.message);
      this.clientConnected = false;
    });
    this.client.on('connect', () => {
      // console.log('Redis client connected');
      this.clientConnected = true;
    });
  }

  isAlive = () => {
    //console.log('isAlive function called');
    return this.client.connected;
  }

  get = async (key) => {
    //console.log('Get function called');
    const value = await this.bindClient(key);
    return value;
    /*const value = await this.client.get(key);
    return value;*/
  }

  set = async (key, value, duration) => {
    //console.log('Set function called');
    this.client.setex(key, duration, value)
    /*await this.client.set(key, value, {
      EX: duration
    });*/
  }

  del = async (key) => {
    //console.log('Del function called');
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient
