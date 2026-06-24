class Wishlist{

    id;
    name;
    description;
    dateCreated;
    gamesList = [];

    constructor () {}

    addGame(game) {
        if (this.gamesList.includes(game))
            return false;
        else{
            this.gamesList.push(game);
            return true;
        }
    }

    removeGame(gameId) {
        gameIdList = this.gamesList.map((game) => game.id);
        if (gameIdList.includes(gameId)){
            index = gameIdList.indexOf(gameId);
            this.gamesList.splice(index, 1);
            return true;
        }
        else
            return false;
    }

    
}
export default Wishlist;