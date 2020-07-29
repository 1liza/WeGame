/**
 * 每个音频创建一个InnerAudioContext
 */
import audioConf from '../../confs/audio-conf'
import gameView from '../game/view'
class AudioManger {
    constructor() {
        this.init()
    }

    init() {
        for (let key in audioConf.audioSources) {
            this[key] = wx.createInnerAudioContext()
            this[key].src = audioConf.audioSources[key]
        }
        this.shrink_end.loop = true
        this.shrink.onEnded( ()=> {//	监听音频自然播放至结束的事件
            if (gameView.gamePage.bottle.status === 'shrink') {
                this.shrink_end.play()
            }
        })
    }
}

export default new AudioManger()