import { CacheStorage } from "../APIs/CacheStorage";

export class CheapSharkClient{
    static BASE_URL = "https://www.cheapshark.com/api/1.0/";
    static RATE_LIMIT_STATUS_CODE = 429;

    #USE_CACHE = false; 
    #caches = new Map();

    headers = {};

    constructor(credentials){
        this.setCredentials(credentials);
    }

    async send(request){
        let result = {};
        let endpoint = request.getEndpoint();

        let cache = this.#caches.get(endpoint);
        if(this.#USE_CACHE && cache != null){
            result = cache.read(endpoint);
        }

        let fullUrl = CheapSharkClient.BASE_URL + endpoint

        if (request.getQueryString().length > 0){
            fullUrl += "?" + request.getQueryString();
        }

        let opts = this.getFetchOptions();

        result = await fetch(fullUrl, opts)
                        .then((response) => response.json());
        
        if(this.#USE_CACHE && cache != null){
            cache.write(endpoint, result);
        }

        return result;
    }

    addCache(path, handler){
        this.#caches.put(path, handler);
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