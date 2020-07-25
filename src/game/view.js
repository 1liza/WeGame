import GamePage from '../pages/game-page.js'
import GameOverPage from '../pages/game-over-page.js'

class GameView {
    // 单例工厂
    constructor() {

    }

    initGamePage (callbacks) {
        // view改变通过controller改变module
        // 从上层传入回调参数callbacks
        this.gamePage = new GamePage(callbacks)
        this.gamePage.init()
        this.gamePage.render()
    }

    initGameOverPage (callbacks) {
        this.gameOverPage = new GameOverPage(callbacks)
        this.gameOverPage.init({
            scene: this.gamePage.scene
        })
    }

    showGameOverPage () {
        this.gamePage.hide()
        this.gameOverPage.show()
    }

    showGamePage () {
        this.gameOverPage.hide()
        this.gamePage.restart()
        this.gamePage.show()
    }

    restartGame () {
        this.gamePage.restart()
    }
}

export default new GameView()