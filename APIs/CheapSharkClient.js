require('dotenv').config();

export class CheapSharkClient{
    static BASE_URL = "https://www.cheapshark.com/api/1.0";
    static RATE_LIMIT_STATUS_CODE = 429;
    #DEFAULT_CREDENTIALS = process.env.USER_AGENT;

    headers = {};

    constructor(credentials = this.#DEFAULT_CREDENTIALS){
        this.setCredentials(credentials);
    }

    async send(request){

        let fullUrl = this.getUrlWithParams(request);
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

    getUrlWithParams(request){
        const urlParams = new URLSearchParams();

        for (const [key, value] of Object.entries(request.getParamsForEndpoint())) {
            if (value !== null && value !== undefined && value !== "") {
            urlParams.append(key, value);
            }
        }

        return CheapSharkClient.BASE_URL + request.endpoint + '?' + urlParams.toString();
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