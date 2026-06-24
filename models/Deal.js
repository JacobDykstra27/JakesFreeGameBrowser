class Deal {

    id;
    gameID;
    storeID;
    normalPrice;
    salePrice;
    discountPercent;
    gameLink;
    lastUpdate;

    constructor(id) {
        this.id = id
    }

    static fromCheapSharkAPI(o) {
        const deal = new Deal();

        deal.id = o.dealID;
        deal.gameID = o.gameID;
        deal.storeID = o.storeID
        deal.normalPrice = Number.parseFloat(o.normalPrice);
        deal.salePrice = Number.parseFloat(o.salePrice);
        deal.discountPercent = Number.parseFloat(o.savings);
        deal.gameLink = `https://www.cheapshark.com/redirect?dealID=${o.dealID}`;
        deal.lastUpdate = Date.now();

        return deal;
    }
    
    static fromMultipleGameLookupCSAPI(o)
    {
        const GetCheapestDealWhenMultipleDeals = (o) =>
        {
            let deals = o.deals;
            let priceArray = deals.map(deal => Number(deal.price));
            let indexOfMin = priceArray.indexOf(Math.min(...priceArray));
            return o.deals[indexOfMin]
        }   
        
        const deal = new Deal();
        o = GetCheapestDealWhenMultipleDeals(o);
        deal.id = o.dealID;
        deal.game = game;
        deal.store = store;
        deal.normalPrice = Number.parseFloat(o.retailPrice);
        deal.salePrice = Number.parseFloat(o.price);
        deal.discountPercent = Number.parseFloat(o.savings);
        deal.gameLink = `https://www.cheapshark.com/redirect?dealID=${o.dealID}`;
        deal.lastUpdate = Date.now();
        return deal;
    }

    setID(id) {
        this.id = id;
    }

}
export default Deal; 