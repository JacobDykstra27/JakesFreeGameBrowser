export class CheapSharkClient{
    static BASE_URL = "https://www.cheapshark.com/api/1.0";
    static RATE_LIMIT_STATUS_CODE = 429;

    headers = {};

    constructor(credentials){
        this.setCredentials(credentials);
    }

    async send(request){

        let queryString = request.getQueryString();
        let hasQueryString = queryString.length > 0 ? true : false;
        let fullUrl = CheapSharkClient.BASE_URL + request.getEndpoint() + (hasQueryString ? '?' + queryString : '');
        let opts = this.getFetchOptions();

        const resp = await fetch(fullUrl, opts);

        return resp;
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