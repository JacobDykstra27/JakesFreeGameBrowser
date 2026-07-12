class Game{
    
    id;
    title;
    imageUrl;
    steamAppId;
    genreList = [];

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
        if (this.genreList.includes(genre))
            return false;
        else{
            this.genreList.push(genre);
            return true;
        }
    }

    removeGenre(Genre) {
        if (this.genreList.includes(genre)){
            index = this.genreList.indexOf(genre);
            this.genreList.pop(index);
            return true;
        }
        else
            return false;
    }

}
export default Game;