import Event from '../utils/event'

class GameModel {
    constructor () {
        // 核心数据是stage 表示当前在哪个场景下
        this.stage = ''
        this.stageChanged = new Event(this)
    }

    getStage () {
        return this.stage
    }

    setStage (stage) {
        // 设置状态后 状态应该通知controller调整view
        console.log('接收状态改变信号')
        this.stage = stage
        this.stageChanged.notify({
            // 进入event.notify
            stage: stage
        })
    }
}

export default new GameModel()