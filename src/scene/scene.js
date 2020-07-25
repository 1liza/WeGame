import camera from './camera'

class Scene {
    constructor () {
        this.instance = null
    }

    init () {
        this.instance = new THREE.Scene()
        const renderer = this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,// 指定当前的renderer是webgl的renderer
            antilias: true,// 抗锯齿
            preserveDrawingBuffer: true// 缓冲区
        })

        this.camera = camera
        this.camera.init()

        this.axesHelper = new THREE.AxesHelper(100)
        this.instance.add(this.axesHelper)
        this.instance.add(this.camera.instance)
    }

    render () {
        // console.log('渲染')
        this.renderer.render(this.instance, this.camera.instance)
    }
}

export default new Scene()