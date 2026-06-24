class Store{

    id;
    name;
    imageBanner;
    imageLogo;
    imageIcon;
    lastUpdate;
    static BASE_URL = 'https://www.cheapshark.com';

    constructor(name) {
        this.name = name;
    }

    static fromCheapSharkAPI(o)
    {
        const store = new Store();
        store.id = o.storeID;
        store.name = o.Steam;
        store.imageBanner = o.images.banner;
        store.imageLogo   = o.images.logo;
        store.imageIcon   = o.images.icon;
        store.lastUpdate = Date.now();
        return store;
    }

    setID(id) {
        this.id = id;
    }

    getBanner(){
        return Store.BASE_URL + this.imageBanner;
    }

    getLogo(){
        return Store.BASE_URL + this.imageLogo;
    }

    getIcon(){
        return Store.BASE_URL + this.imageIcon;
    }

}
export default Store;