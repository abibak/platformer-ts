// @ts-ignore
import Player from '../objects/Player';
export default class Game {
    private player: Player;

    constructor() {
        this.player = new Player;
    }

    calculateNumbers(a: number, b: number) {
        this.player.move();
        return a + b;
    }
}
