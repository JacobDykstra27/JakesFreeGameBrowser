class Store{
    constructor() {}

    static fromCheapSharkAPI(o)
    {
        const store = new Store();
        store.id = o.storeID;
        store.name = o.Steam;
        store.imageBanner = `https://www.cheapshark.com${o.images.banner}`;
        store.imageLogo   = `https://www.cheapshark.com${o.images.logo}`;
        store.imageIcon   = `https://www.cheapshark.com${o.images.icon}`;
        store.lastUpdate = Date.now();
        return store;
    }

    id;
    name;
    imageBanner;
    imageLogo;
    imageIcon;
    lastUpdate;
}
export default Store;