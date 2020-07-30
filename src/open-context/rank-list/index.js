class RankListRenderer {
    constructor () {
        this.init()
        this.key = ''
        this.sharedCanvas = wx.getSharedCanvas()
    }

    init() {
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: res => {
                if(res.data) {
                    if (res.data[0].nickName != undefined &&res.data[0].avatar != undefined) {
                        this.key = res.data[0].nickName + res.data[0]
                    }
                }
            }
        })
    }

    draw(data) {
        
    }

    drawRankList(dataList) {
        console.log('drawRankList')
        console.log(dataList)
    }

    updateMaxScore(currentScore) {
        return new Promise((resolve, reject) => {
            wx.getUserCloudStorage({
                keyList: ['maxScore'],
                success: res => {
                    let maxScore = 0
                    if (res.KVDataList && res.KVDataList.length>0) {
                        maxScore = res.KVDataList[0].value
                        if (currentScore > maxScore) {
                            wx.setUserCloudStorage({
                                KVDataList: [{key: 'maxScore', value: String(currentScore)}],
                                success: res => {
                                    resolve()
                                }
                            })
                        }
                    } else {
                        resolve()
                    }
                }
            })
        })
    }

    getFriendData() {
        return new Promise((resolve, reject) => {
            wx.getFriendCloudStorage({
                keyList: ['maxScore'],
                success: res=> {
                    console.log(res)
                    const data = res.data
                    resolve(data)
                }
            })
        })
    }

    listen() {
        wx.onMessage(msg => {
            const type = msg.type
            const currentScore = parseInt(msg.score)
            if (type === 'updateMaxScore') {
                this.updateMaxScore(currentScore).then(() => {
                    this.getFriendData().then(dataList => {
                        this.drawRankList(dataList)
                    })
                })
            }
        })
    }
}

const rankList = new RankListRenderer()
rankList.listen()