import { readCache, writeCache, clearNamespaceCache } from "./cacheStorage";
import Game from "../models/Game";
import Deal from "../models/Deal";
import Store from "../models/Store";

class DealsList{
    
    #deals = [];
    #games = [];
    #stores = [];
    #sharkClient = new CheapSharkClient();

    #USE_CACHE = false; //TODO: finish implementing CacheStorage model
    #MAX_CACHE_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
    #DEALS_CACHE_KEY = "DealsCache"
    #GAMES_CACHE_KEY = "GamesCache"
    #STORES_CACHE_KEY = "StoresCache"

    getGames() { return this.#games; }

    getGame(ID){ return this.#games.get(ID); }

    getDeals() { return this.#deals; }

    getStores() { return this.#stores; }

    clearCache() {
        try {
            await clearNamespaceCache(this.NAMESPACE);
            console.log("CheapShark cache cleared");
        } catch (err) {
            console.error("Error clearing CheapShark cache:", err);
        }
    }

    initData(options = {}) {
    // this function tries to get data from cache. if cache is empty or outdated, it gets new data from api

        //try to get from cache
        if (this.#USE_CACHE) {
            try{
                //TODO: Check if data is outdated
                //TODO: Check if data is null or empty
                this.#deals = this.#getCached(this.#DEALS_CACHE_KEY);
                this.#games = this.#getCached(this.#GAMES_CACHE_KEY);
                this.#stores = this.#getCached(this.#STORES_CACHE_KEY);
            } catch (err) {
                console.error("Error loading data from cache:", err);
            }
        }

        // try to get from api
        try{
            const dealsJson = this.#getDealsDataFromAPI();
            const storesJson = this.#getStoresDataFromAPI();
            
            this.#games = new Map(dealsJson.map((game) => {
                return [game.gameID, Game.fromCheapSharkAPI(game)];
            }));

            this.#deals = new Map(dealsJson.map((deal) => {
                return [deal.dealID, Deal.fromCheapSharkAPI(deal)];
            }));

            this.#stores = new Map(storesJson.map((store) => {
                return [store.storeID, Store.fromCheapSharkAPI(store)];
            }));

            //save data to cache
            if (this.#USE_CACHE) this.#cacheData();

        } catch (err) {
            console.error("Error loading data from CheapShark:", err);
        }
    }

    async getDealsByIDs(gameIDs = []) {
    // this function gets all deals for all games in an array from CheapShark.
        if (!Array.isArray(gameIDs) || gameIDs.length === 0) {
            return [];
        }

        try {

            const request = new CheapSharkRequest("/games");
            const response = await this.#sharkClient.send(request);
            const responseJson = await response.json();

            let dealsById = new Map(responseJson.map((deal) => {
                return [deal.dealID, Deal.fromCheapSharkAPI(deal)];
            }));

            return dealsById;

        } catch (err) {
            console.error("Error getting deals by IDs:", err);
            return [];
        }
    }

    getBestDealFromArray(deals){
    //takes an array of deals from getDealsBytIDs and returns only the best deal (cheapest price) for each game in the array.
        
        const lowestByGame = new Map();

        for (let deal of deals) {
            let current = lowestByGame.get(deal.gameID);

            if (!current || deal.price < current.price) {
            lowestByGame.set(deal.gameID, deal);
            }
        }

        return [...lowestByGame.values()];
    }

    #cacheData(){
    // caches current deals, games, and stores
        try{
            await writeCache(this.NAMESPACE, this.#DEALS_CACHE_KEY,  this.#deals,  this.#MAX_CACHE_AGE_MS);
            await writeCache(this.NAMESPACE, this.#GAMES_CACHE_KEY,  this.#games,  this.#MAX_CACHE_AGE_MS);
            await writeCache(this.NAMESPACE, this.#STORES_CACHE_KEY, this.#stores, this.#MAX_CACHE_AGE_MS);
        } catch (err) {
            console.error("Error cashing data:", err);
        }
        
    }

    #getCached(cacheKey){
    // return cached games if any
        let cached = await readCache(this.NAMESPACE, cacheKey);
        if (cached) {
            return cached;
        }
    }

    #getStoresDataFromAPI(){
    // this function fetches stores from CheapsharkAPI
        try {
            const request = new CheapSharkRequest("/stores");
            const response = await this.#sharkClient.send(request);
    
            if (response.ok) {
                const stores = await response.json();
                return stores;
            }
    
        } catch (err) {
            console.error("Error getting stores from CheapShark:", err);
            return [];
        }
    }

    #getDealsDataFromAPI(){
    // this function fetches deals from CheapsharkAPI
        try {
            const request = new CheapSharkRequest("/deals");
            const response = await this.#sharkClient.send(request);
    
            if (response.ok) {
                const deals = await response.json();
                return deals;
            }

        } catch (err) {
            console.error("Error getting deals from CheapShark:", err);
            return [];
        }
    }

} 
export default DealsList;