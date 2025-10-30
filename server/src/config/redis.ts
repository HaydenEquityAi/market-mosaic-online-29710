import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export const getFromCache = async (key: string): Promise<any> => {
  try {
    if (!redisClient.isOpen) {
      return null; // Redis not connected, return null to trigger API call
    }
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // Redis not available, gracefully degrade to no caching
    return null;
  }
};

export const setToCache = async (
  key: string,
  value: any,
  expirationInSeconds: number = 300
): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return; // Redis not connected, skip caching
    }
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    // Redis not available, gracefully skip caching
    // No error logging to avoid spam when Redis is intentionally not configured
  }
};

export const deleteFromCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const clearCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis clear pattern error:', error);
  }
};

export default redisClient;
