import scene from '../scene/scene'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground'
import bottle from '../objects/bottle'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf'
import bottleConf from '../../confs/bottle-conf'
import utils from '../utils/index'
import ScoreText from '../view3d/scoreText'
import audioManger from '../modules/audio-manger'
import { stopAllAnimation } from '../../libs/animation'

const HIT_NEXT_BLOCK_CENTER = 1
const HIT_CURRENT_BLOCK = 2
const GAME_OVER_NEXT_BLOCK_BACK = 3
const GAME_OVER_CURRENT_BLOCK_BACK = 4
const GAME_OVER_NEXT_BLOCK_FRONT = 5
const GAME_OVER_BOTH = 6
const HIT_NEXT_BLOCK_NORMAL = 7

export default class GamePage {
  constructor (callbacks) {
    this.callbacks = callbacks
    this.state = 'stop'
    this.checkingHit = false
    this.targetPosition = {}
    this.axis = null
  }

  init () {
    this.score = 0
    this.combo = 0
    this.scene = scene
    this.ground = ground
    this.bottle = bottle
    this.scoreText = new ScoreText()
    this.scene.init()
    this.ground.init()
    this.bottle.init()
    this.scoreText.init({
      fillStyle: 0x666699
    })
    this.render()
    this.addInitBlock()
    // this.addHelper()
    this.addGround()
    this.addBottle()
    this.addScore()
  }

  deleteObjectsFromScene () {
    let obj = this.scene.instance.getObjectByName('block')
    while(obj) {
      this.scene.instance.remove(obj)
      if (obj.geometry) {
        obj.geometry.dispose()
      }
      if (obj.material) {
        obj.material.dispose()
      }
      obj = this.scene.instance.getObjectByName('block')
    }
    this.scene.instance.remove(this.bottle.obj)
    this.scene.instance.remove(this.ground.instance)
  }

  restart () {
    this.score = 0
    this.combo = 0
    this.deleteObjectsFromScene()
    this.scene.reset()
    this.bottle.reset()
    this.updateScore(0)
    this.addInitBlock()
    this.addGround()
    this.addBottle()
    this.bindTouchEvent()
  }

  show () {
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  render () {
    if (this.currentBlock) {
      this.currentBlock.update()
    }
    if (this.bottle) {
      this.bottle.update()
    }
    this.checkBottleHit()
    if (this.visible) {
      this.scene.render()
    }
    requestAnimationFrame(this.render.bind(this))
  }

  addGround () {
    this.scene.instance.add(this.ground.instance)
  }

  addBottle () {
    this.scene.instance.add(this.bottle.obj)
    this.bottle.showup()
  }

  addScore () {
    this.scene.addScore(this.scoreText.instance)
  }

  updateScore (score) {
    this.scoreText.updateScore(score)
    this.scene.updateScore(this.scoreText.instance)
  }

  addHelper () {
    this.axesHelper = new THREE.AxesHelper( 100 )
    this.scene.instance.add(this.axesHelper)
  }

  addInitBlock () {
    this.currentBlock = new Cuboid(-15, 0, 0,'show', 'random', blockConf.width) 
    this.scene.instance.add(this.currentBlock.instance)
    this.nextBlock = new Cylinder(23, 0, 0, 'show', 'color', blockConf.width)
    this.scene.instance.add(this.nextBlock.instance)
    const initDirection = 0
    this.targetPosition = {
      x: 23,
      y: 0,
      z: 0
    }
    this.setDirection(initDirection)
  }

  updateNextBlock () {
    const seed = Math.round(Math.random())
    const type = seed ? 'cuboid' : 'cylinder'
    const direction = Math.round(Math.random()) // 0 -> x 1 -> z
    const width = Math.round(Math.random() * 12) + 8
    const distance = Math.round(Math.random() * 20) + 20
    this.currentBlock = this.nextBlock
    const targetPosition = this.targetPosition = {}
    if (direction == 0) { // x
      targetPosition.x = this.currentBlock.instance.position.x + distance
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z
    } else if (direction == 1) { // z
      targetPosition.x = this.currentBlock.instance.position.x
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z - distance
    }
    this.setDirection(direction)
    if (type == 'cuboid') {
      this.nextBlock = new Cuboid(targetPosition.x, targetPosition.y, targetPosition.z, 'popup', 'random', width)
    } else if (type == 'cylinder') {
      this.nextBlock = new Cylinder(targetPosition.x, targetPosition.y, targetPosition.z, 'popup', 'color', width)
    }
    // this.nextBlock.instance.position.set(targetPosition.x, targetPosition.y, targetPosition.z)
    this.scene.instance.add(this.nextBlock.instance)
    const cameraTargetPosition = { 
      x: (this.currentBlock.instance.position.x + this.nextBlock.instance.position.x) / 2,
      y: (this.currentBlock.instance.position.y + this.nextBlock.instance.position.y) / 2,
      z: (this.currentBlock.instance.position.z + this.nextBlock.instance.position.z) / 2,
    }
    this.scene.updateCameraPosition(cameraTargetPosition)
    this.ground.updatePosition(cameraTargetPosition)
  }

  touchStartCallback = (e) => {
    this.touchStartTime = Date.now()
    this.state = 'prepare'
    this.bottle.shrink()
    this.currentBlock.shrink()
    audioManger.shrink.play()
  }

  touchEndCallback = (e) => {
    this.touchEndTime = Date.now()
    const duration = this.touchEndTime - this.touchStartTime
    this.bottle.velocity.vx = Math.min(duration / 6, 400)
    this.bottle.velocity.vx = +this.bottle.velocity.vx.toFixed(2)
    this.bottle.velocity.vy = Math.min(150 + duration / 20, 400)
    this.bottle.velocity.vy = +this.bottle.velocity.vy.toFixed(2)
    this.state = 'jump'
    this.hit = this.getHitStatus(this.bottle, this.currentBlock, this.nextBlock, blockConf.height / 2 - (1 - this.currentBlock.instance.scale.y) * blockConf.height)
    this.checkingHit = true
    this.currentBlock.rebound()
    this.bottle.rotate()
    this.bottle.jump(duration)
    // this.updateNextBlock()
    audioManger.shrink.stop()
    audioManger.shrink_end.stop()
  }

  bindTouchEvent () {
    canvas.addEventListener('touchstart', this.touchStartCallback)
    canvas.addEventListener('touchend', this.touchEndCallback)
  }

  removeTouchEvent () {
    canvas.removeEventListener('touchstart', this.touchStartCallback)
    canvas.removeEventListener('touchend', this.touchEndCallback)
  }

  setDirection (direction) {
    const currentPosition = {
      x: this.bottle.obj.position.x, 
      z: this.bottle.obj.position.z
    }
    this.axis = new THREE.Vector3(this.targetPosition.x - currentPosition.x, 0, this.targetPosition.z - currentPosition.z)
    this.axis.normalize()
    this.bottle.setDirection(direction, this.axis)
  }

  checkBottleHit () {
    if (this.checkingHit && this.bottle.obj.position.y <= blockConf.height / 2 + 0.1 && this.bottle.status === 'jump' && this.bottle.flyingTime > 0.3) {
      this.checkingHit = false
      if (this.hit == 1 || this.hit == 7 || this.hit == 2) { // 游戏继续
        if (this.hit === 1) {
          this.combo ++
          audioManger['combo' + (this.combo<=8 ? this.combo : '8')].play()
          this.score += 2*this.combo
          this.updateScore(this.score)
        } else if (this.hit === 7) {
          this.combo = 0
          this.updateScore(++this.score)
          audioManger.success.play()
        } else if (this.hit === HIT_CURRENT_BLOCK) {
          this.state = 'stop'
          this.bottle.stop()
          this.bottle.obj.position.y = blockConf.height / 2
          this.bottle.obj.position.x = this.bottle.destination[0]
          this.bottle.obj.position.z = this.bottle.destination[1]
          return
        }
        
        this.state = 'stop'
        this.bottle.stop()
        this.bottle.obj.position.y = blockConf.height / 2
        this.bottle.obj.position.x = this.bottle.destination[0]
        this.bottle.obj.position.z = this.bottle.destination[1]
        this.updateNextBlock()

      } else { //游戏结束
        this.state = 'over'
        this.uploadScore()
        this.combo = 0
        if (this.hit === GAME_OVER_NEXT_BLOCK_BACK || this.hit === GAME_OVER_CURRENT_BLOCK_BACK) {
          // 先把所有动画停止
          stopAllAnimation()
          this.bottle.stop()
          this.bottle.forerake()
          audioManger.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height/2
          setTimeout (() => {
            this.callbacks.showGameOverPage()
          }, 2000)
        } else if (this.hit === GAME_OVER_NEXT_BLOCK_FRONT) {
          stopAllAnimation()
          this.bottle.stop()
          this.bottle.hypokinesis()
          audioManger.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height/2
          setTimeout (() => {
            this.callbacks.showGameOverPage()
          }, 1500)
        } else {
          audioManger.fall.play()
          this.callbacks.showGameOverPage()
        }
        this.removeTouchEvent()
        this.checkingHit = false
      }
    }
  }

  getHitStatus (bottle, currentBlock, nextBlock, initY) {
    
    var flyingTime = bottle.velocity.vy / gameConf.gravity * 2
    initY = initY || +bottle.obj.position.y.toFixed(2)
    var destinationY = blockConf.height / 2

    var differenceY = destinationY
    var time = +((-bottle.velocity.vy + Math.sqrt(Math.pow(bottle.velocity.vy, 2) - 2 * gameConf.gravity * differenceY)) / -gameConf.gravity).toFixed(2)
    flyingTime -= time
    flyingTime = +flyingTime.toFixed(2)
    var destination = []
    var bottlePosition = new THREE.Vector2(bottle.obj.position.x, bottle.obj.position.z)
    var translate = new THREE.Vector2(this.axis.x, this.axis.z).setLength(bottle.velocity.vx * flyingTime)
    bottlePosition.add(translate)
    bottle.destination = [+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2)]
    destination.push(+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2))
    if (nextBlock) {
      var nextDiff = Math.pow(destination[0] - nextBlock.instance.position.x, 2) + Math.pow(destination[1] - nextBlock.instance.position.z, 2)
      var nextPolygon = nextBlock.getVertices()
      var result1
      if (utils.pointInPolygon(destination, nextPolygon)) {
        if (Math.abs(nextDiff) < 5) {
          result1 = HIT_NEXT_BLOCK_CENTER
        } else {
          result1 = HIT_NEXT_BLOCK_NORMAL
        }
      } else if (utils.pointInPolygon([destination[0] - bottleConf.bodyWidth/2, destination[1]], nextPolygon) || utils.pointInPolygon([destination[0], destination[1] + bottleConf.bodyWidth/2], nextPolygon)) {
        result1 = GAME_OVER_NEXT_BLOCK_BACK
      } else if (utils.pointInPolygon([destination[0], destination[1] - bottleConf.bodyWidth/2], nextPolygon) || utils.pointInPolygon([destination[0] + bottleConf.bodyWidth/2, destination[1]], nextPolygon)) {
        result1 = GAME_OVER_NEXT_BLOCK_FRONT
      }
    }

    var currentPolygon = currentBlock.getVertices()
    var result2
    if (utils.pointInPolygon(destination, currentPolygon)) {
      result2 = HIT_CURRENT_BLOCK
    } else if (utils.pointInPolygon([destination[0], destination[1] + bottleConf.bodyWidth/2], currentPolygon) || utils.pointInPolygon([destination[0] - bottleConf.bodyWidth/2, destination[1]], currentPolygon)) {
      if (result1) result2 = GAME_OVER_BOTH
      result2 = GAME_OVER_CURRENT_BLOCK_BACK
    }
    return result1 || result2 || 0
  }

  uploadScore() {
    const openDataContext = wx.getOpenDataContext()// 申请开放数据域
    openDataContext.postMessage({
      type: 'updateMaxScore',
      score: this.score
    })
    this.score = 0
  }
}