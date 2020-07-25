import gameView from './view.js'
import gameModel from './model.js'

class GameController {
    // controller负责暴露出控制的API
    // constructor() {
    //     this.gameView = gameView
    //     this.gameModel = gameModel
    //     this.gameModel.stageChanged.attach((sender, args) => {
    //         const stageName = args.stage
    //         switch (stageName) {
    //             case 'game-over':
    //                 this.gameView.showGameOverPage()
    //                 break
    //             case 'game':
    //                 this.gameView.showGamePage()
    //                 break
    //             default:
    //         }
    //     })
    // }

    // 初始化页面
    initPages() {
        const gamePageCallbacks = {
            // gameover需要在最上层controller进行传输
            showGameOverPage: () => {
                this.gameModel.setStage('game-over')
            }
        }

        const gameOverPageCallbacks = () => {
            this.gameModel.setStage('game')
        }

        // 上层直接调用初始化page函数
        this.gameView.initGamePage(gamePageCallbacks)
        this.gameView.initGameOverPage(gameOverPageCallbacks)
    }
    constructor () {
        this.gameView = gameView
    }
}

export default new GameController()