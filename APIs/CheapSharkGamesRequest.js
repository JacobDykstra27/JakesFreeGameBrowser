export class CheapSharkGamesRequest{

    #endpoint = '/games';
    
    #filters = {}

    constructor(){
        this.#filters["format"] = "array";
        this.#filters["ids"] = [];
    }

    getEndpoint(){
        return this.#endpoint;
    }

    getQueryString(){
        return new URLSearchParams(this.#filters).toString();
    }

    //#region params for gamesById endpoint

    getParams(){
        return this.#filters;
    }

    setGames(gameIDs){
        this.#filters["ids"] = Array.isArray(gameIDs) ? gameIDs : [gameIDs];
    }

    addGame(gameID){
        this.#filters["ids"].push(gameID);
    }

    removeGame(gameID){
        this.#filters["ids"] = this.#filters["ids"].filter(id => id !== gameID);
    }

    formatAsArray(flag = true){
        if(flag) this.#filters["format"] = "array";
        else delete this.#filters["format"];
    }

    clearParams(){
        this.#filters = {};
    }
    //#endregion
}