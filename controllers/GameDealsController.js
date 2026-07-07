import Game from "../models/Game";
import Deal from "../models/Deal";
import Store from "../models/Store";
import { CheapSharkClient } from "../APIs/CheapSharkClient"
import { CheapSharkDealsRequest } from "../APIs/CheapSharkDealsRequest";
import { CheapSharkStoresRequest } from "../APIs/CheapSharkStoresRequest";

export class GameDealsController{
    
    #deals = [];
    #games = [];
    #stores = [];

    #credentials;
    #sharkClient;
    
    constructor(){
        this.#credentials = process.env.EXPO_PUBLIC_CHEAPSHARK_USER_AGENT;
        this.#sharkClient = new CheapSharkClient(this.#credentials);

        CacheStorage.setApplicationPrefix("@JakesFreeGameBrowser:api_cache");

        let dealsCache = new CacheStorage("deals");
        let gamesCache = new CacheStorage("games");
        let storesCache = new CacheStorage("stores");

        this.#sharkClient.addCache("deals", dealsCache);
        this.#sharkClient.addCache("games", gamesCache);
        this.#sharkClient.addCache("stores",storesCache);
    }

    getGames() { return this.#games; }

    getGame(ID){ return this.#games.get(ID); }

    getDeals() { return this.#deals; }

    getStores() { return this.#stores; }

    clearCache() {
        this.sharkClient.clearCache();
    }

    //TODO: add optional params for filters
    async initData(options = {}) {
        try{
            const dealsRequest = new CheapSharkDealsRequest(options);
            const storesRequest = new CheapSharkStoresRequest();

            const dealsResponse = await this.#sharkClient.send(dealsRequest);
            const storesResponse = await this.#sharkClient.send(storesRequest);
            
            this.#games = new Map(dealsResponse.map((game) => {
                return [game.gameID, Game.fromCheapSharkAPI(game)];
            }));

            this.#deals = new Map(dealsResponse.map((deal) => {
                return [deal.dealID, Deal.fromCheapSharkAPI(deal)];
            }));

            this.#stores = new Map(storesResponse.map((store) => {
                return [store.storeID, Store.fromCheapSharkAPI(store)];
            }));

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
} 