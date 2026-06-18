class Deal {
    constructor() {}

    static fromCheapSharkAPI(o, game, store) {
        const deal = new Deal();

        deal.id = o.dealID;
        deal.game = game;
        deal.store = store;
        deal.normalPrice = Number.parseFloat(o.normalPrice);
        deal.salePrice = Number.parseFloat(o.salePrice);
        deal.discountPercent = Number.parseFloat(o.savings);
        deal.gameLink = `https://www.cheapshark.com/redirect?dealID=${o.dealID}`;
        deal.lastUpdate = Date.now();

        return deal;
    }

    id;
    game;
    store;
    normalPrice;
    salePrice;
    discountPercent;
    gameLink;
    lastUpdate;
}
export default Deal; 