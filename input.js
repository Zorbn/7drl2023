export class Input {
    constructor() {
        this.pressedKeys = new Set();
        this.pressedMouseButtons = new Set();
        this.keyWasPressed = new Set();
        this.mouseButtonWasPressed = new Set();
        this.hasListeners = false;

        this.leftKeys = ["KeyA", "ArrowLeft"];
        this.rightKeys = ["KeyD", "ArrowRight"];
        this.horizontalKeys = this.leftKeys.concat(this.rightKeys);

        this.upKeys = ["KeyW", "ArrowUp"];
        this.downKeys = ["KeyS", "ArrowDown"];
        this.verticalKeys = this.upKeys.concat(this.downKeys);
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

    wasHorizontalKeyPressed = () => {
        return this.wasAnyOfKeysPressed(this.horizontalKeys);
    }

    wasVerticalKeyPressed = () => {
        return this.wasAnyOfKeysPressed(this.verticalKeys);
    }

    getHorizontalAxis = () => {
        return this.getAxis(this.leftKeys, this.rightKeys);
    }

    getVerticalAxis = () => {
        return this.getAxis(this.upKeys, this.downKeys);
    }

    getAxis = (negativeKeys, positiveKeys) => {
        let direction = 0;

        if (this.wasAnyOfKeysPressed(negativeKeys)) {
            direction -= 1;
        }

        if (this.wasAnyOfKeysPressed(positiveKeys)) {
            direction += 1;
        }

        return direction;
    }

    wasAnyOfKeysPressed = (keys) => {
        for (const key of keys) {
            if (this.isKeyPressed(key)) {
                return true;
            }
        }

        return false;
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