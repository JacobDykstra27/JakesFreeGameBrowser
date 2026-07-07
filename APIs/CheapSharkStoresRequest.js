export class CheapSharkStoresRequest{

    #endpoint = 'stores';
    
    constructor(){}

    getEndpoint(){
        return this.#endpoint;
    }

    getQueryString(){
        console.warn("Warning: requested query string from CheapSharkDealsRequest which has no query params.");
        return "";
    }
}