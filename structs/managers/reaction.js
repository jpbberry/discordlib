class ReactionManager {
  constructor(client) {
    this.client = client
  }
  
  parse(str) {
    return str.match(/^[0-9]*$/) ? `e:${str}` : str
  }
  
  add(channel_id, message_id, reaction) {
    return this.client.request(`/channels/${channel_id}/messages/${message_id}/reactions/${this.parse(reaction)}/@me`, 'PUT')
  }
  
  remove(channel_id, message_id, reaction, user = "@me") {
    return this.client.request(`/channels/${channel_id}/messages/${message_id}/reactions/${this.parse(reaction)}/@me`, 'DELETE')
  }
  
  clear(channel_id, message_id) {
    return this.client.request(`/channels/${channel_id}/messages/${message_id}/reactions`, 'DELETE')
  }
  
  async menu(channelID, messageID, reacts = {}, filter = () => true, timeout = () => {}, time) {
    let stopped = false
    let tm
    const collector = (reaction) => {
      if (reaction.channel_id !== channelID || reaction.message_id !== messageID || !filter(reaction)) return
      const fn = reacts[reaction.emoji.id || reaction.emoji.name]
      if (!fn) return
      stopped = true
      if (tm) clearTimeout(tm)
      fn()
      this.client.off('MESSAGE_REACTION_ADD', collector)
    }
    this.client.on('MESSAGE_REACTION_ADD', collector)
    if (time) tm = setTimeout(() => {
      stopped = true
      timeout()
      this.client.off('MESSAGE_REACTION_ADD', collector)
    }, time)
    const keys = Object.keys(reacts)
    for (let i = 0; i < keys.length; i++) {
      if (stopped) break
      await this.add(channelID, messageID, keys[i])
    }
  }
}

module.exports = ReactionManager
