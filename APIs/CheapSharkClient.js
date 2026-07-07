import { CacheStorage } from "../APIs/CacheStorage";

/*
        //this code block goes away entirely
        if (this.#USE_CACHE && options != {}) {
            try{
                this.#deals = this.#cache.readCache(CacheStorage.DEALS_CACHE_KEY);
                this.#games = this.#cache.readCache(CacheStorage.GAMES_CACHE_KEY);
                this.#stores = this.#cache.readCache(CacheStorage.STORES_CACHE_KEY);
            } catch (err) {
                console.error("Error loading data from cache:", err);
            }
        }

        //this code block goes away entirely
        if (this.#USE_CACHE){
            this.#cache.writeCache(CacheStorage.DEALS_CACHE_KEY, this.#deals);
            this.#cache.writeCache(CacheStorage.GAMES_CACHE_KEY, this.#games);
            this.#cache.writeCache(CacheStorage.STORES_CACHE_KEY, this.#stores);
        }   

*/
export class CheapSharkClient{
    static BASE_URL = "https://www.cheapshark.com/api/1.0/";
    static RATE_LIMIT_STATUS_CODE = 429;

    #cache = new CacheStorage();
    #USE_CACHE = false; //TODO: finish implementing CacheStorage model


    headers = {};

    constructor(credentials){
        this.setCredentials(credentials);
        console.log("new client instance");   
    }

    async send(request){

        let endpoint = request.getEndpoint();

        //if cache enabled for endpoint determine if we return whats in cache or process request or both

        let fullUrl = CheapSharkClient.BASE_URL + endpoint

        if (endpoint != "stores" && request.getQueryString().length > 0)
            fullUrl += "?" + request.getQueryString();

        let opts = this.getFetchOptions();

        let result = await fetch(fullUrl, opts)
                         .then((response) => response.json());
        
        //if cache enabled for request path then pass result to cache

        return result;
    }

    addCache(){}

    setCredentials(credentials){
        this.headers["User-Agent"] = credentials;
    }

    getFetchOptions(){
        return { headers: this.headers }
    }

    GetRateLimitResponseMessage(retrySeconds){
        return `CheapShark rate limited. Retry after ${retrySeconds} seconds`;
    }

    getCheapSharkRedirectURL(dealID) {
    // returns url that will take user to game sale through cheapshark redirect
        if (dealID) return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
        else return null;
    }

    throwCheapSharkError(response){
    // if cheapshark api response is not ok then call this method to print error in console.     
        throw new Error(`CheapShark API error: ${response.status}\n` + `CheapShark URL: ${response.url}`);
    }

}