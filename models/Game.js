class Game{
    
    id;
    title;
    imageUrl;
    steamAppId;
    genresList = [];

    constructor(t) {
        this.title = t;
    }

    static fromCheapSharkAPI(o)
    {
        const game = new Game();

        game.id = o.gameID;
        game.title = o.title;
        game.imageUrl = o.thumb;
        game.steamAppId = o.steamAppID;
        return game;
    };

    setID(id){
        this.id = id;
    }

    addGenre(genre) {
        if (this.genresList.includes(genre))
            return false;
        else{
            this.genresList.push(genre);
            return true;
        }
    }

    removeGenre(Genre) {
        if (this.genresList.includes(genre)){
            index = this.genresList.indexOf(genre);
            this.genresList.pop(index);
            return true;
        }
        else
            return false;
    }

}
export default Game;