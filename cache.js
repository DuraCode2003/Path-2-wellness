const redis = require('redis');
const { promisify } = require('util');
const logger = require('./logger');

class Cache {
  constructor() {
    if (process.env.REDIS_URL) {
      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          tls: process.env.REDIS_TLS === 'true',
          rejectUnauthorized: false,
        },
      });
    } else {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
      });
    }

    // Promisify Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.flushAsync = promisify(this.client.flushall).bind(this.client);
    this.keysAsync = promisify(this.client.keys).bind(this.client);
    this.expireAsync = promisify(this.client.expire).bind(this.client);
    this.ttlAsync = promisify(this.client.ttl).bind(this.client);

    // Error handling
    this.client.on('error', (error) => {
      logger.error(`Redis error: ${error.message}`);
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  /**
   * Get value from cache by key
   * @param {string} key - Cache key
   * @returns {Promise<*>} - Cached value or null if not found/expired
   */
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional expiration
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} - True if successful
   */
  async set(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.setAsync(key, stringValue, 'EX', ttl);
      } else {
        await this.setAsync(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} - True if successful
   */
  async del(key) {
    try {
      const result = await this.delAsync(key);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all keys from cache (use with caution in production)
   * @returns {Promise<boolean>} - True if successful
   */
  async flush() {
    try {
      await this.flushAsync();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param {string} pattern - Pattern to match keys against
   * @returns {Promise<Array>} - Array of matching keys
   */
  async keys(pattern = '*') {
    try {
      return await this.keysAsync(pattern);
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Set key expiration
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - True if expiration was set
   */
  async expire(key, ttl) {
    try {
      const result = await this.expireAsync(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get time to live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds, -2 if key doesn't exist, -1 if key has no TTL
   */
  async ttl(key) {
    try {
      return await this.ttlAsync(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -2; // Key doesn't exist
    }
  }

  /**
   * Cache middleware for Express routes
   * @param {number} ttl - Cache TTL in seconds
   * @returns {Function} - Express middleware function
   */
  middleware(ttl = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl || req.url}`;

      try {
        // Try to get cached data
        const cachedData = await this.get(key);
        
        if (cachedData) {
          logger.debug(`Cache hit for ${key}`);
          return res.json(cachedData);
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = (body) => {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.set(key, body, ttl).catch(error => {
              logger.error('Error setting cache:', error);
            });
          }
          originalJson.call(res, body);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Invalidate cache for specific keys or patterns
   * @param {string|Array} keys - Single key, array of keys, or pattern
   * @returns {Promise<number>} - Number of keys deleted
   */
  async invalidate(keys) {
    try {
      if (!keys) return 0;
      
      let keysToDelete = [];
      
      if (Array.isArray(keys)) {
        keysToDelete = keys;
      } else if (keys.includes('*')) {
        // Handle pattern matching
        keysToDelete = await this.keys(keys);
      } else {
        // Single key
        keysToDelete = [keys];
      }

      if (keysToDelete.length === 0) return 0;
      
      // Delete all matching keys
      const result = await this.delAsync(keysToDelete);
      logger.debug(`Invalidated ${result} cache keys`);
      return result;
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      return 0;
    }
  }
}

// Create and export a singleton instance
const cache = new Cache();

// Handle process termination
process.on('SIGINT', () => {
  cache.client.quit();
  process.exit(0);
});

module.exports = cache;
