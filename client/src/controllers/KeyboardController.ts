enum Keycodes {
    Jump = 87,
    Left = 65,
    Right = 68,
    Down = 83
}

export default class KeyboardController {
    public jump: boolean;
    public left: boolean;
    public right: boolean;
    public down: boolean;

    public onKeyDown(code: number): void {
        if (code === Keycodes.Jump) {
            this.jump = true;
        }

        if (code === Keycodes.Left) {
            this.left = true;
        }

        if (code === Keycodes.Right) {
            this.right = true;
        }

        if (code === Keycodes.Down) {
            this.down = true;
        }
    }

    public onKeyUp(code: number): void {
        if (code === Keycodes.Jump) {
            this.jump = false;
        }

        if (code === Keycodes.Left) {
            this.left = false;
        }

        if (code === Keycodes.Right) {
            this.right = false;
        }

        if (code === Keycodes.Down) {
            this.down = false;
        }
    }
}