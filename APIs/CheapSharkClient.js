import { CacheStorage } from "../APIs/CacheStorage";

export class CheapSharkClient{
    static BASE_URL = "https://www.cheapshark.com/api/1.0/";
    static RATE_LIMIT_STATUS_CODE = 429;

    #USE_CACHE = true; 
    #WRITE_CACHE = true;
    #READ_CACHE = true;
    #caches = new Map();

    headers = {};

    constructor(credentials){
        this.setCredentials(credentials);
    }

    async send(request){
        let result;
        let cached;
        let endpoint = request.getEndpoint();

        let cache = this.#caches.get(endpoint);
        if(this.#USE_CACHE && this.#READ_CACHE && cache != null){
            cached = cache.read(endpoint);
        }

        if (!cached){
            let fullUrl = CheapSharkClient.BASE_URL + endpoint

            if (request.getQueryString().length > 0){
                fullUrl += "?" + request.getQueryString();
            }

            let opts = this.getFetchOptions();

            let response = await fetch(fullUrl, opts);
            result = await response.text();

            if(this.#USE_CACHE && this.#WRITE_CACHE && cache != null){
                cache.write(endpoint, result);
            }
        }
        else {
            result = cached;
        }

        return result;
    }

    addCache(path, handler){
        this.#caches.set(path, handler);
    }   

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