export class Input {
    constructor() {
        this.pressedKeys = new Set();
        this.pressedMouseButtons = new Set();
        this.keyWasPressed = new Set();
        this.mouseButtonWasPressed = new Set();
        this.hasListeners = false;
    }

    isKeyPressed = (key) => {
        return this.pressedKeys.has(key);
    }

    wasKeyPressed = (key) => {
        return this.keyWasPressed.has(key);
    }

    wasMouseButtonPressed = (button) => {
        return this.mouseButtonWasPressed.has(button);
    }

    isMouseButtonPressed = (button) => {
        return this.pressedMouseButtons.has(button);
    }

    update = () => {
        this.keyWasPressed.clear();
        this.mouseButtonWasPressed.clear();
    }

    addListeners = () => {
        this.hasListeners = true;

        this.keyDownListener = (event) => {
            if (!this.pressedKeys.has(event.code)) {
                this.keyWasPressed.add(event.code);
            }

            this.pressedKeys.add(event.code);
        }
        document.addEventListener("keydown", this.keyDownListener);

        this.keyUpListener = (event) => {
            this.pressedKeys.delete(event.code);
        }
        document.addEventListener("keyup", this.keyUpListener);

        this.mouseDownListener = (event) => {
            if (!this.pressedMouseButtons.has(event.button)) {
                this.mouseButtonWasPressed.add(event.button);
            }

            this.pressedMouseButtons.add(event.button);
        }
        document.addEventListener("mousedown", this.mouseDownListener)

        this.mouseUpListener = (event) => {
            this.pressedMouseButtons.delete(event.button);
        };
        document.addEventListener("mouseup", this.mouseUpListener);
    }

    removeListeners = () => {
        this.hasListeners = false;

        document.removeEventListener("pointerlockchange", this.pointerLockChangeListener);
        document.removeEventListener("keydown", this.keyDownListener);
        document.removeEventListener("keyup", this.keyUpListener);
        document.removeEventListener("mousedown", this.mouseDownListener)
        document.removeEventListener("mouseup", this.mouseUpListener);

        this.pressedKeys.clear();
        this.pressedMouseButtons.clear();
        this.keyWasPressed.clear();
        this.mouseButtonWasPressed.clear();
    }

    unlockPointer = () => {
        document.exitPointerLock();
    }
}