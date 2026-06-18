class Game{
    constructor() {}

    static fromCheapSharkAPI(o)
    {
        const game = new Game();

        game.id = o.gameID;
        game.title = o.title;
        game.imageUrl = o.thumb;
        return game;
    };

    id;
    title;
    imageUrl;
    genresList = [];

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