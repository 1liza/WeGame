export default class GameOverPage {
    constructor (callbacks) {
        this.callbacks = callbacks
    }

    init (options) {

    }

    show () {
        console.log('显示game over')
        this.obj.visible = true
    }

    hide () {
        this.obj.visible = false
    }
}