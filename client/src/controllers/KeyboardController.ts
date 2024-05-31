enum Keycodes {
    Jump = 87,
    Left = 65,
    Right = 68,
    Down = 83
}

export default class KeyboardController {
    public jump: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public down: boolean = false;
    public count: number = 0;

    public onKeyDown(code: number): void {
        if (code === Keycodes.Jump) {
            this.count++;

            if (this.count >= 2) {
                this.jump = false;
                return;
            }

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
            this.count = 0;
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