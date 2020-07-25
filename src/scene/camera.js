import sceneConf from '../../confs/scene-conf'

class Camera {
    // 因为没有明显的透视效果，选择正交相机
    constructor () {
        this.instance = null
    }

    init () {
        const aspect = window.innerHeight / window.innerWidth
        this.instance = new THREE.OrthographicCamera(-sceneConf.frustunSize, sceneConf.frustunSize, sceneConf.frustunSize*aspect, -sceneConf.frustunSize*aspect, -100, 85)
        this.instance.position.set(-10, 10, 10)
        this.target = new THREE.Vector3(0,0,0)
        this.instance.lookAt(this.target)
    }
}

export default new Camera()