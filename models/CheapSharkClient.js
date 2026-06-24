import { readCache, writeCache, clearNamespaceCache } from "./cacheStorage";
import Game from "../models/Game";
import Deal from "../models/Deal";
import Store from "../models/Store";
require('dotenv').config()

class CheapSharkClient{
    //Consts:
    #BASE_URL = "https://www.cheapshark.com/api/1.0";
    #NAMESPACE = "cheapshark";
    #CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    #FETCH_OPTIONS = { headers: { "User-Agent": process.env.USER_AGENT, }, };
    #USE_CASHE = false;
    #DEALS_CASHE_KEY = "DealsCashe"
    #GAMES_CASHE_KEY = "GamesCashe"
    #STORES_CASHE_KEY = "StoresCashe"

    //attrubutes
    #deals = [];
    #games = [];
    #stores = [];

    //TODO: Build default constructor
    constructor(){}
    
    //getters:
    getGames() { return this.#games; }

    getGame(ID){ return this.#games.get(ID); }

    getDeals() { return this.#deals; }

    getStores() { return this.#stores; }

    getCheapSharkRedirectURL(dealID) {
    // returns url that will take user to game sale through cheapshark redirect
        if (dealID) return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
        else return null;
    }
    
    clearCache() {
        try {
            await clearNamespaceCache(this.#NAMESPACE);
            console.log("CheapShark cache cleared");
        } catch (err) {
            console.error("Error clearing CheapShark cache:", err);
        }
    }

    //TODO: Update to fit in client object
    getDealsByIDs(gameIDs = []) {
    // this function gets all deals for all games in an array from CheapShark and returns the best deals for each game.
        if (!Array.isArray(gameIDs) || gameIDs.length === 0) {
            return [];
        }

        try {
            const response = await fetch(
                `${this.#BASE_URL}/games?ids=${encodeURIComponent(gameIDs.join(","))}&format=array`,
                this.#FETCH_OPTIONS
            );

            if (!response.ok) { this.#cheapSharkAPIError(response); }

            const data = await response.json();

            return deals.map((o) => {
                const game = Game.fromCheapSharkAPI(o.info);
                const store = new Store; // TODO: empty store object fix later 
                return Deal.fromMultipleGameLookupCSAPI(o, game, store);
            });
        } catch (err) {
            console.error("Error getting deals by IDs:", err);
            return [];
        }
    }

    initData(options = {}) {
    // this function trys to get data from cashe. if cashe is empty or outdated, it gets new data from api

        //try to get from cashe
        if (this.#USE_CASHE) {
            try{
                //TODO: Check if data is outdated
                //TODO: Check if data is null or empty
                this.#deals = this.#getCashed(this.#DEALS_CASHE_KEY);
                this.#games = this.#getCashed(this.#GAMES_CASHE_KEY);
                this.#stores = this.#getCashed(this.#STORES_CASHE_KEY);
            } catch (err) {
                console.error("Error loading data from cashe:", err);
            }
        }

        // try to get from api
        try{
            const dealsData = this.#getDealsDataFromAPI();
            const storesData = this.#getStoresDataFromAPI();
            
            this.#games = new Map(dealsData.map((game) => {
                return [game.gameID, Game.fromCheapSharkAPI(game)];
            }));

            this.#deals = new Map(dealsData.map((deal) => {
                return [deal.dealID, Deal.fromCheapSharkAPI(deal)];
            }));

            this.#stores = new Map(storesData.map((store) => {
                return [store.storeID, Store.fromCheapSharkAPI(store)];
            }));

            //save data to cashe
            if (this.#USE_CASHE) this.#casheData();

        } catch (err) {
            console.error("Error loading data from CheapShark:", err);
        }
    }

    #casheData(){
    // cashes current deals, games, and stores
        try{
            await writeCache(this.#NAMESPACE, this.#DEALS_CASHE_KEY,  this.#deals,  this.#CACHE_TTL_MS);
            await writeCache(this.#NAMESPACE, this.#GAMES_CASHE_KEY,  this.#games,  this.#CACHE_TTL_MS);
            await writeCache(this.#NAMESPACE, this.#STORES_CASHE_KEY, this.#stores, this.#CACHE_TTL_MS);
        } catch (err) {
            console.error("Error cashing data:", err);
        }
        
    }

    #getCashed(cacheKey){
    // return cashed games if any
        let cached = await readCache(this.#NAMESPACE, cacheKey);
        if (cached) {
            return cached;
        }
    }

    #getStoresDataFromAPI(){
    // this function fetches stores from ChepsharkAPI
        try {
            const response = await fetch(`${this.#BASE_URL}/stores`, this.#FETCH_OPTIONS);
    
            if (!response.ok) { this.#cheapSharkAPIError(response); }
    
            const stores = await response.json();

            return stores;

        } catch (err) {
            console.error("Error getting stores from CheapShark:", err);
            return [];
        }
    }

    #getDealsDataFromAPI(){
    // this function fetches deals from ChepsharkAPI
        try {
            const params = new URLSearchParams({
                pageNumber: options.pageNumber || 0,
                pageSize: Math.min(options.pageSize || 20, 60), // Max 60
                sortBy: options.sortBy || "DealRating",
                desc: options.desc ? 1 : 0,
                ...(options.storeID && { storeID: options.storeID }),
                ...(options.lowerPrice !== undefined && {
                    lowerPrice: options.lowerPrice,
                }),
                ...(options.upperPrice !== undefined && {
                    upperPrice: options.upperPrice,
                }),
                ...(options.metacritic && { metacritic: options.metacritic }),
                ...(options.steamRating && { steamRating: options.steamRating }),
                ...(options.title && { title: options.title }),
                ...(options.exact && { exact: 1 }),
                ...(options.onSale && { onSale: 1 }),
            });

            const response = await fetch(
                `${this.#BASE_URL}/deals?${params}`,
                this.#FETCH_OPTIONS
            );

            if (!response.ok) { this.#cheapSharkAPIError(response); }

            return await response.json();

        } catch (err) {
            console.error("Error getting deals from CheapShark:", err);
            return [];
        }
    }

    #cheapSharkAPIError(response){
    // if cheapshark api response is not ok then call this method to print error in console.
        if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            console.warn(
                `CheapShark rate limited. Retry after ${retryAfter} seconds`
            );
        }
        
        throw new Error(`CheapShark API error: ${response.status}\n` + `CheapShark URL: ${response.url}`);
    }
}