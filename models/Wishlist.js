class Wishlist{
    constructor () {}

    id;
    name;
    description;
    dateCreated;
    gamesList = [];

    addGame(game) {
        if (this.gamesList.includes(game))
            return false;
        else{
            this.gamesList.push(game);
            return true;
        }
    }

    removeGame(game) {
        if (this.gamesList.includes(game)){
            index = this.gamesList.indexOf(game);
            this.gamesList.pop(index);
            return true;
        }
        else
            return false;
    }
}
export default Wishlist;