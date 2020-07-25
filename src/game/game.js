import gameController from './controller.js'
// MVC结构，只有controller是暴露给主程序，分别控制View和model

class Game {
    constructor() {
        this.gameController = gameController
    }

    init () {
        this.gameController.initPages()
    }
}

export default new Game()