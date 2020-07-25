
import * as THREE from '../libs/three.js'
import game from './game/game.js'
window.THREE = THREE // 直接将THREE挂载在window上，避免每次引用，可以直接调用three变量

export default class Main {
    constructor () {
      game.init()
    }
}

