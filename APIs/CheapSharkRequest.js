export class CheapSharkRequest{

    #endpoint = '/deals';
    
    #DealParams = {
        storeID = [],
        pageNumber,
        pageSize,
        sortBy,
        desc,
        lowerPrice,
        upperPrice,
        metacritic,
        steamRating,
        minimumReviewCount,
        title,
        maxAge,
        steamAppID,
        title,
        exact,
        AAA,
        onSale,
    };
    
    #gamesByIdParams = {
        gameIds = [],
        format = array
    }

    // #region constants
    static DEAL_ENDPOINT = "/deals";
    static GAMES_ENDPOINT = "/games";
    static STORES_ENDPOINT = "/stores";
    static SORT_BY_VALUES = ["DealRating", "Title", "Savings", "Price", "Metacritic", "Reviews", "ReviewCount", "Release", "Store", "Recent"];
    static AMOUNT_OF_DEALS_MIN = 20;
    static AMOUNT_OF_DEALS_MAX = 60;
    static SORT_DESCENDING = 1;
    static SORT_ASCENDING = 0;
    static PRICE_FILTER_MAX = 50;
    static PRICE_FILTER_MIN = 0;
    static DEAL_AGE_MAX = 2500;
    static DEAL_AGE_MIN = 1;
    // #endregion

    constructor(endpoint, paramsObj = {}){
        this.setEndpoint(endpoint);
        this.setParamsFromObject(paramsObj);
    }

    setEndpoint(endpoint){
    //endpoint is a string
        if ([this.DEAL_ENDPOINT, this.GAMES_ENDPOINT, this.STORES_ENDPOINT].includes(endpoint)) {
            throw new Error("Invalid endpoint value");
        }
        this.endpoint = endpoint;
    }

    getParamsForEndpoint(){
        if (this.endpoint === "/deals") {
            return this.dealParams;

        } else if (this.endpoint === "/games") {
            return this.gamesByIdParams;
            
        } else if (this.endpoint === "/stores") {
            return {};
        }
    }

    //#region filters for deals endpoint

    setFreeGamesOnlyFIlter(freeGamesOnly){
    // freeGamesOnly is an int, 1 for true, 0 for false.
    // Flag to include only free games
        this.dealParams.PRICE_FILTER_MAX = PRICE_FILTER_MIN;
    }

    getDealParams(){
        return this.dealParams;
    }

    setStoreIdFilterArray(storeIDArray){
        this.dealParams.storeID = Array.isArray(storeIDArray) ? storeIDArray : [storeIDArray];
    }

    addStoreIdFilter(storeID){
        //storeId is an int
        this.dealParams.storeID.push(storeID);
    }

    removeStoreIdFilter(storeID){
        this.dealParams.storeID = this.dealParams.storeID.filter(id => id !== storeID);
    }

    setRequestPageNumber(pageNumber){
        if(pageNumber < 0){
            throw new Error("pageNumber must be 0 or greater");
        }
        this.dealParams.pageNumber = pageNumber;
    }

    setAmountOfDeals(pageSize){
        if(pageSize < PAGE_SIZE_MIN || pageSize > PAGE_SIZE_MAX){
            throw new Error("pageSize must be between 20 and 60");
        }
        this.dealParams.pageSize = pageSize;
    }
    
    setSortBy(sortBy){
        if (!this.SORT_BY_VALUES.includes(sortBy)) {
            throw new Error("Invalid sortBy value");
        }
        this.dealParams.sortBy = sortBy;
    }

    setSortDirection(direction){
    // direction is 0 for ascending, 1 for descending
        if (direction !== this.SORT_DESCENDING && direction !== this.SORT_ASCENDING) {
            throw new Error("desc must be 0 (ascending) or 1 (descending)");
        }
        this.dealParams.desc = direction;
    }

    setLowerPriceFilter(lowerPrice){
    // lowerPrice is an int
        if (lowerPrice < this.PRICE_FILTER_MIN) {
            throw new Error("lowerPrice must be a positive number");
        }
        this.dealParams.lowerPrice = lowerPrice;
    }

    setUpperPriceFilter(upperPrice){
    // upperPrice is an int
        if (upperPrice < this.PRICE_FILTER_MIN || upperPrice > this.PRICE_FILTER_MAX) {
            throw new Error("upperPrice must be between 0 and 50");
        }
        this.dealParams.upperPrice = upperPrice;
    }

    setMetacriticFilter(metacritic){
    // metacritic is an int
        this.dealParams.metacritic = metacritic;
    }

    setSteamRatingFilter(steamRating){
    // steamRating is an int
        this.dealParams.steamRating = steamRating;
    }

    setMinimumReviewCountFilter(minimumReviewCount){
        if (minimumReviewCount < 0) {
            throw new Error("minimumReviewCount must be 0 or greater");
        }
        this.dealParams.minimumReviewCount = minimumReviewCount;
    }

    setTitleFilter(title){
        this.dealParams.title = title;
    }

    setDealAgeFilter(maxAge){
    // how long ago the deal was posted in hours
        if (maxAge < this.DEAL_AGE_MIN || maxAge > this.DEAL_AGE_MAX) {
            throw new Error("maxAge must be between 1 and 2500");
        }
        this.dealParams.maxAge = maxAge;
    }

    setSteamAppIDFilter(steamAppID){
    // steamAppID is an int
        this.dealParams.steamAppID = steamAppID;
    }

    setExactTitleMatch(exact){
    // exact is a in, 1 for true, 0 for false.
    // exact is used to search for an exact title match. If exact is set to 1, the title parameter will be treated as an exact match. If exact is set to 0, the title parameter will be treated as a partial match.
        this.dealParams.exact = exact;
    }

    setIsAAA(AAA){
    // AAA is an int, 1 for true, 0 for false.
    // Flag to include only deals with retail price
        this.dealParams.AAA = AAA;
    }

    setOnSale(onSale){
    // onSale is an int, 1 for true, 0 for false.
        this.dealParams.onSale = onSale;
    }

    setFiltersFromObject(paramsObj){
        if (paramsObj.storeID !== undefined)             { this.dealParams.storeID = Array.isArray(paramsObj.storeID) ? paramsObj.storeID : [paramsObj.storeID]; }
        if (paramsObj.pageNumber !== undefined)          { this.dealParams.pageNumber = paramsObj.pageNumber; }
        if (paramsObj.pageSize !== undefined)            { this.dealParams.pageSize = paramsObj.pageSize; }
        if (paramsObj.sortBy !== undefined)              { this.dealParams.sortBy = paramsObj.sortBy; }
        if (paramsObj.desc !== undefined)                { this.dealParams.desc = paramsObj.desc; }
        if (paramsObj.lowerPrice !== undefined)          { this.dealParams.lowerPrice = paramsObj.lowerPrice; }
        if (paramsObj.upperPrice !== undefined)          { this.dealParams.upperPrice = paramsObj.upperPrice; }
        if (paramsObj.metacritic !== undefined)          { this.dealParams.metacritic = paramsObj.metacritic; }
        if (paramsObj.steamRating !== undefined)         { this.dealParams.steamRating = paramsObj.steamRating; }
        if (paramsObj.minimumReviewCount !== undefined)  { this.dealParams.minimumReviewCount = paramsObj.minimumReviewCount; }
        if (paramsObj.title !== undefined)               { this.dealParams.title = paramsObj.title; }
        if (paramsObj.maxAge !== undefined)              { this.dealParams.maxAge = paramsObj.maxAge; }
        if (paramsObj.steamAppID !== undefined)          { this.dealParams.steamAppID = paramsObj.steamAppID; }
        if (paramsObj.exact !== undefined)               { this.dealParams.exact = paramsObj.exact; }
        if (paramsObj.AAA !== undefined)                 { this.dealParams.AAA = paramsObj.AAA; }
        if (paramsObj.onSale !== undefined)              { this.dealParams.onSale = paramsObj.onSale; }
    }

    clearFilters(){
        this.dealParams = {};
    }
    //#endregion

    //#region params for gamesById endpoint

    getGamesByIdParams(){
        return this.gamesByIdParams;
    }

    setGameIdsFilterArray(gameIDs){
        this.gamesByIdParams.gameIds = Array.isArray(gameIDs) ? gameIDs : [gameIDs];
    }

    addGameIdFilter(gameID){
        this.gamesByIdParams.gameIds.push(gameID);
    }

    removeGameIdFilter(gameID){
        this.gamesByIdParams.gameIds = this.gamesByIdParams.gameIds.filter(id => id !== gameID);
    }

    setFormatArray(){
        this.gamesByIdParams.format = "array";
    }

    setFormatObject(){
        delete this.gamesByIdParams.format;
    }

    setGamesByIdFiltersFromObject(paramsObj){
        if (paramsObj.gameIds !== undefined) { this.gamesByIdParams.gameIds = Array.isArray(paramsObj.gameIds) ? paramsObj.gameIds : [paramsObj.gameIds]; }
        if (paramsObj.format !== undefined)  { this.gamesByIdParams.format = paramsObj.format; }
    }

    clearGamesByIdFilters(){
        this.gamesByIdParams = {};
    }
    //#endregion
}