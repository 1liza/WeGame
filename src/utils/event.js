class Event {
    // 绑定关系
    constructor (sender) {
        this._sender = sender
        this._listeners = [] // 维护事件的回调函数
    }

    attach (callback) {
        this._listeners.push(callback)
    }

    notify (args) {
        for (let i=0; i<this._listeners.length; i++) {
            // 执行消息
            this._listeners[i](this._sender, args)
            // 怎么进入controller中？
        }
    }
}

export default Event