export class CheapSharkDealsRequest{

    #endpoint = 'deals';
    
    #filters = {};

    // #region constants
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

    constructor(){
        this.onlySales()
    }

    static newFromParams(paramsObj){
        let request = new CheapSharkDealsRequest();
        request.setFilters(paramsObj);
        return request;
    }

    getQueryString(){
        return new URLSearchParams(this.#filters).toString();
    }

    getEndpoint(){
        return this.#endpoint;
    }

    //#region filters for deals endpoint

    setFilters(filters){
        this.#filters = filters;
    }

    onlyFreeGames(freeGamesOnly = true){
    // Flag to include only free games
        if (freeGamesOnly) this.setUpperPrice(CheapSharkDealsRequest.PRICE_FILTER_MIN);
        else this.setUpperPrice(CheapSharkDealsRequest.PRICE_FILTER_MAX);

    }

    getDealParams(){
        return this.#filters;
    }

    setStoreId(storeIDArray){
        this.#filters.storeID = Array.isArray(storeIDArray) ? storeIDArray : [storeIDArray];
    }

    addStoreId(storeID){
        //storeId is an int
        this.#filters.storeID.push(storeID);
    }

    removeStoreId(storeID){
        this.#filters.storeID = this.#filters.storeID.filter(id => id !== storeID);
    }

    setRequestPageNumber(pageNumber){
        if(pageNumber < 0){
            throw new Error("pageNumber must be 0 or greater");
        }
        this.#filters.pageNumber = pageNumber;
    }

    setAmountOfDeals(pageSize){
        if(pageSize < PAGE_SIZE_MIN || pageSize > PAGE_SIZE_MAX){
            throw new Error(`pageSize must be between ${CheapSharkDealsRequest.AMOUNT_OF_DEALS_MIN} and ${CheapSharkDealsRequest.AMOUNT_OF_DEALS_MAX}`);
        }
        this.#filters.pageSize = pageSize;
    }
    
    setSortBy(sortBy){
        if (!CheapSharkDealsRequest.SORT_BY_VALUES.includes(sortBy)) {
            throw new Error("Invalid sortBy value");
        }
        this.#filters.sortBy = sortBy;
    }

    setSortDirection(direction){
    // direction is 0 for ascending, 1 for descending
        if (direction !== CheapSharkDealsRequest.SORT_DESCENDING && direction !== CheapSharkDealsRequest.SORT_ASCENDING) {
            throw new Error("desc must be 0 (ascending) or 1 (descending)");
        }
        this.#filters.desc = direction;
    }

    setLowerPrice(lowerPrice){
    // lowerPrice is an int
        if (lowerPrice < CheapSharkDealsRequest.PRICE_FILTER_MIN) {
            throw new Error("lowerPrice must be a positive number");
        }
        this.#filters.lowerPrice = lowerPrice;
    }

    setUpperPrice(upperPrice){
    // upperPrice is an int
        if (upperPrice < CheapSharkDealsRequest.PRICE_FILTER_MIN || upperPrice > CheapSharkDealsRequest.PRICE_FILTER_MAX) {
            throw new Error("upperPrice must be between 0 and 50");
        }
        this.#filters.upperPrice = upperPrice;
    }

    setMetacritic(metacritic){
    // metacritic is an int
        this.#filters.metacritic = metacritic;
    }

    setSteamRating(steamRating){
    // steamRating is an int
        this.#filters.steamRating = steamRating;
    }

    setMinimumReviewCount(minimumReviewCount){
        if (minimumReviewCount < 0) {
            throw new Error("minimumReviewCount must be 0 or greater");
        }
        this.#filters.minimumReviewCount = minimumReviewCount;
    }

    setTitle(title){
        this.#filters.title = title;
    }

    setDealAge(maxAge){
    // how long ago the deal was posted in hours
        if (maxAge < CheapSharkDealsRequest.DEAL_AGE_MIN || maxAge > CheapSharkDealsRequest.DEAL_AGE_MAX) {
            throw new Error("maxAge must be between 1 and 2500");
        }
        this.#filters.maxAge = maxAge;
    }

    setSteamAppID(steamAppID){
    // steamAppID is an int
        this.#filters.steamAppID = steamAppID;
    }

    setExactTitleMatch(exact){
    // exact is a in, 1 for true, 0 for false.
    // exact is used to search for an exact title match. If exact is set to 1, the title parameter will be treated as an exact match. If exact is set to 0, the title parameter will be treated as a partial match.
        this.#filters.exact = exact;
    }

    setIsAAA(AAA){
    // AAA is an int, 1 for true, 0 for false.
    // Flag to include only deals with retail price
        this.#filters.AAA = AAA;
    }

    onlySales(flag = true){
    // onSale is an int, 1 for true, 0 for false.
        this.#filters.onSale = flag ? 1 : 0;
    }

    clearFilters(){
        this.#filters = {};
    }
    //#endregion
}