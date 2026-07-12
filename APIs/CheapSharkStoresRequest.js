export class CheapSharkStoresRequest{

    #endpoint = 'stores';
    
    constructor(){}

    getEndpoint(){
        return this.#endpoint;
    }

    getQueryString(){
        return "";
    }
}