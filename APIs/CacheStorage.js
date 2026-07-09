import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Cache entry structure:
 * {
 *     [cacheKey]: {
 *       data: any,
 *       timestamp: number,
 *       ttlMs: number
 *     }
 * }
 */

export class CacheStorage {
	static APPLICATION_PREFIX = "";
	static MAX_CACHE_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

	prefix;

	/**
	 * Set application cache key prefix
	 * @param {string} prefix - App name
	 */
	static setApplicationPrefix(prefix){
		CacheStorage.APPLICATION_PREFIX = prefix;
	}

	/**
	 * sets time for cache to be outdated
	 * @param {string} timeMS - time until expiry in Miliseconds
	 */
	static setMaxCacheAge(timeMS){
		CacheStorage.MAX_CACHE_AGE_MS = timeMS;
	}

	constructor(prefix){
		this.prefix = prefix;
	};

	/**
	 * Read from cache
	 * @param {string} namespace - API namespace
	 * @param {string} key - Cache key
	 * @returns {Promise<any|null>} Cached data or null if expired/missing
	 */
	async read(key) {
		//TODO: class should check date of cache and if null before returning data.
		let fullKey = CacheStorage.APPLICATION_PREFIX + "." + this.prefix + "." + key;
		try {
			const data = await AsyncStorage.getItem(fullKey);

			if (!data) {
				return null;
			}
			else{
				return data;
			}

		} catch (err) {
			console.error(`Error reading cache for ${key}:`, err);
			return null;
		}
	}

	/**
	 * Write to cache
	 * @param {string} namespace - API namespace
	 * @param {string} key - Cache key
	 * @param {any} data - Data to cache
	 * @param {number} ttlMs - Time to live in milliseconds
	 * @returns {Promise<void>}
	 */
	async write(key, data) {
		let fullKey = CacheStorage.APPLICATION_PREFIX + "." + this.prefix + "." + key;
		try {
			await AsyncStorage.setItem(fullKey, data);
		} catch (err) {
			console.error(`Error writing cache for ${key}:`, err);
		}
	}

	/**
	 * Clear all cached data
	 * @returns {Promise<void>}
	 */
	async clearAll() {
		try {
			await AsyncStorage.removeItem(CACHE_STORAGE_KEY);
			console.log("All API cache cleared");
		} catch (err) {
			console.error("Error clearing all cache:", err);
		}
	}

	/**
	 * Get cache statistics
	 * @returns {Promise<object>} Cache stats with size, entries per namespace, etc.
	 */
	async getStats() {
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
			if (!rawCache) {
				return {
					totalSize: 0,
					namespaces: {},
					totalEntries: 0,
				};
			}

			const cacheStore = JSON.parse(rawCache);
			const stats = {
				totalSize: rawCache.length,
				namespaces: {},
				totalEntries: 0,
			};

			Object.entries(cacheStore).forEach(([namespace, entries]) => {
				const entryCount = Object.keys(entries).length;
				stats.namespaces[namespace] = {
					entries: entryCount,
					keys: Object.keys(entries),
				};
				stats.totalEntries += entryCount;
			});

			return stats;
		} catch (err) {
			console.error("Error getting cache stats:", err);
			return null;
		}
	}

	/**
	 * Get remaining TTL for a cached item
	 * @param {string} namespace - API namespace
	 * @param {string} key - Cache key
	 * @returns {Promise<number|null>} Remaining TTL in ms, or null if not found/expired
	 */
	async getTimeRemaining(key) {
//				timestamp: Date.now(),
//				ttlMs,

		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);

			if (!rawCache) {
				return null;
			}

			const cacheStore = JSON.parse(rawCache);

			if (!cacheStore[namespace] || !cacheStore[namespace][key]) {
				return null;
			}

			const entry = cacheStore[namespace][key];
			const { timestamp, ttlMs } = entry;
			const elapsed = Date.now() - timestamp;
			const remaining = CacheStorage.MAX_CACHE_AGE_MS - elapsed;

			return remaining > 0 ? remaining : null;
		} catch (err) {
			console.error(`Error getting TTL for ${namespace}:${key}:`, err);
			return null;
		}
	}

	getExpiryDate(){
		return Date.now() +  CacheStorage.MAX_CACHE_AGE_MS;
	}
}