import { createClient } from 'redis';

// Redis-based cache for production performance
class RedisCache {
  constructor() {
    this.client = null;
    this.connected = false;
    this.fallbackCache = new Map(); // Always initialize fallback
    this.init();
  }

  async init() {
    try {
      const redisConfig = {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      };
      
      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }
      
      this.client = createClient(redisConfig);
      
      this.client.on('error', (err) => {
        console.log('⚠️ Redis connection failed, using memory cache');
        this.connected = false;
      });
      
      this.client.on('connect', () => console.log('🔌 Redis connecting...'));
      this.client.on('ready', () => {
        console.log('✅ Redis ready for production');
        this.connected = true;
      });
      
      await this.client.connect();
    } catch (error) {
      console.log('💾 Using memory cache (Redis unavailable)');
      this.connected = false;
    }
  }

  async set(key, value, ttlMs = 30000) {
    try {
      if (this.connected && this.client?.isReady) {
        await this.client.setEx(key, Math.floor(ttlMs / 1000), JSON.stringify(value));
      } else {
        this.fallbackCache?.set(key, { value, expiry: Date.now() + ttlMs });
      }
    } catch (error) {
      if (!this.fallbackCache) this.fallbackCache = new Map();
      this.fallbackCache.set(key, { value, expiry: Date.now() + ttlMs });
    }
  }

  async get(key) {
    try {
      if (this.connected && this.client?.isReady) {
        const result = await this.client.get(key);
        return result ? JSON.parse(result) : null;
      } else {
        if (!this.fallbackCache) return null;
        const cached = this.fallbackCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        }
        this.fallbackCache.delete(key);
        return null;
      }
    } catch (error) {
      if (!this.fallbackCache) return null;
      const cached = this.fallbackCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }
      return null;
    }
  }

  async setRoomStatus(buildingNo, roomNo, status) {
    const key = `room:${buildingNo}-${roomNo}`;
    await this.set(key, status, 15000); // 15 sec TTL
  }

  async getRoomStatus(buildingNo, roomNo) {
    const key = `room:${buildingNo}-${roomNo}`;
    return await this.get(key);
  }

  async setConflictCheck(roomKey, timeKey, hasConflict) {
    const key = `conflict:${roomKey}-${timeKey}`;
    await this.set(key, hasConflict, 10000); // 10 sec TTL
  }

  async getConflictCheck(roomKey, timeKey) {
    const key = `conflict:${roomKey}-${timeKey}`;
    return await this.get(key);
  }

  async invalidateRoom(buildingNo, roomNo) {
    const roomKey = `room:${buildingNo}-${roomNo}`;
    try {
      if (this.connected && this.client?.isReady) {
        await this.client.del(roomKey);
        const keys = await this.client.keys(`conflict:${buildingNo}-${roomNo}-*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (error) {
      // Silent fail for Redis errors
    }
    
    // Always clean fallback cache
    if (this.fallbackCache) {
      this.fallbackCache.delete(roomKey);
      // Clean related conflict cache in fallback
      for (const [key] of this.fallbackCache) {
        if (key.startsWith(`conflict:${buildingNo}-${roomNo}-`)) {
          this.fallbackCache.delete(key);
        }
      }
    }
  }

  async delete(key) {
    try {
      if (this.connected && this.client?.isReady) {
        await this.client.del(key);
      }
    } catch (error) {
      // Silent fail for Redis errors
    }
    
    // Always clean fallback
    if (this.fallbackCache) {
      this.fallbackCache.delete(key);
    }
  }

  async clear() {
    if (this.connected) {
      await this.client.flushAll();
    } else {
      this.fallbackCache?.clear();
    }
  }
}

export const cache = new RedisCache();