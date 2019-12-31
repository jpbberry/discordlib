const Embed = require('../Embed')

class MessageManager {
  constructor(client) {
    this.client = client
  }

  parse(contentOrOBJ = {}, obj = {}) {
    if (typeof contentOrOBJ !== 'string') {
      if (contentOrOBJ instanceof Embed) contentOrOBJ = { embed: contentOrOBJ.render() }
      obj = {
        ...obj,
        ...contentOrOBJ
      }
    }
    else {
      obj["content"] = contentOrOBJ;
    }
    
    return obj
  }

  send(channel_id, ...msg) {
    return this.client.request(`/channels/${channel_id}/messages`, 'POST', this.parse(...msg))
  }
  
  edit(channel_id, message_id, ...msg) {
    return this.client.request(`/channels/${channel_id}/messages/${message_id}`, 'PATCH', this.parse(...msg))
  }
  
  delete(channel_id, message_id) {
    return this.client.request(`/channels/${channel_id}/messages/${message_id}`, 'DELETE')
  }
  
  menu(channelID, filter = () => true, timeout = () => {}, time, amount = 1, onm = () => {}) {
    return new Promise((resolve) => {
      let res = []
      let through = 0
      let tm
      const collector = (message) => {
        if (message.channel_id === channelID && filter(message)) {
          through++
          onm(message)
          if (res > 1) res.push(message)
          else res = message
          
          if (through >= amount) {
            if (tm) clearTimeout(tm)
            this.client.off('MESSAGE_CREATE', collector)
            resolve(res)
          }
        }
      }
      this.client.on('MESSAGE_CREATE', collector)
      if (time) tm = setTimeout(() => {
        this.client.off('MESSAGE_CREATE', collector)
        resolve(null)
        timeout()
      }, time)
    })
  }
}

module.exports = MessageManager
