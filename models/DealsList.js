import { readCache, writeCache, clearNamespaceCache } from "./cacheStorage";
import Game from "../models/Game";
import Deal from "../models/Deal";
import Store from "../models/Store";
class DealsList{
    
    #deals = [];
    #games = [];
    #stores = [];
    #sharkClient = new CheapSharkClient();

    #NAMESPACE = "cheapshark";
    #USE_CASHE = true;
    #MAX_CASHE_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
    #DEALS_CASHE_KEY = "DealsCashe"
    #GAMES_CASHE_KEY = "GamesCashe"
    #STORES_CASHE_KEY = "StoresCashe"

    getGames() { return this.#games; }

    getGame(ID){ return this.#games.get(ID); }

    getDeals() { return this.#deals; }

    getStores() { return this.#stores; }

    clearCache() {
        try {
            await clearNamespaceCache(this.#NAMESPACE);
            console.log("CheapShark cache cleared");
        } catch (err) {
            console.error("Error clearing CheapShark cache:", err);
        }
    }

    //TODO: Fix functions below to use request and client models

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

            //save data to cashe
            if (this.#USE_CASHE) this.#casheData();

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

    #casheData(){
    // cashes current deals, games, and stores
        try{
            await writeCache(this.#NAMESPACE, this.#DEALS_CASHE_KEY,  this.#deals,  this.#MAX_CASHE_AGE_MS);
            await writeCache(this.#NAMESPACE, this.#GAMES_CASHE_KEY,  this.#games,  this.#MAX_CASHE_AGE_MS);
            await writeCache(this.#NAMESPACE, this.#STORES_CASHE_KEY, this.#stores, this.#MAX_CASHE_AGE_MS);
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
    // this function fetches deals from ChepsharkAPI
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