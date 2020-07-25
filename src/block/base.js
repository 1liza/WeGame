import block from '../../confs/block-conf'
import blockConf from '../../confs/block-conf'

export default class BaseBlock {
    constructor(type) {
        this.type = type// cube|cylinder
        this.height = blockConf.height
        this.width = blockConf.width
    }
}