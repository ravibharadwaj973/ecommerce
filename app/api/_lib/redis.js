// app/api/_lib/redis.js
import { createClient } from 'redis';

const redisClientSingleton = () => {
  const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: 'redis-18371.c114.us-east-1-4.ec2.cloud.redislabs.com',
      port: 18371
    }
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  
  // Start the connection
  client.connect();
  
  return client;
};

// Use globalThis to prevent multiple connections during Next.js hot-reloading
const globalForRedis = globalThis;

const redis = globalForRedis.redis || redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;