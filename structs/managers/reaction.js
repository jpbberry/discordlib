/**
 * Reaction manager
 */
class ReactionManager {
  /**
   * Creates Manager instance
   * @param {Client} client Intitiating client
   */
  constructor (client) {
    /**
     * Intitiating client
     * @type {Client}
     */
    this.client = client
  }
  
  /**
   * Parses reaction string
   * @param {String} str Reaction
   * @returns {String}
   */
  parse (str) {
    return str.match(/^[0-9]*$/) ? `e:${str}` : str
  }
  
  /**
   * Adds reaction to message
   * @param {Snowflake} channelID ID of channel message is in
   * @param {Snowflake} messageID ID of message to add reaction too
   * @param {String} reaction Reaction to add
   * @returns {Promise<Object>}
   */
  add (channelID, messageID, reaction) {
    return this.client.request(`/channels/${channelID}/messages/${messageID}/reactions/${this.parse(reaction)}/@me`, 'PUT')
  }

  /**
   * Removed reactions from message
   * @param {Snowflake} channelID ID of channel message is in
   * @param {Snowflake} messageID ID of message to remove reaction from
   * @param {String} reaction Reaction to remove
   * @param {Snowflake} ?user ID of user to remove, (Default is self)
   * @returns {Promise<Object>}
   */
  remove (channelID, messageID, reaction, user = '@me') {
    return this.client.request(`/channels/${channelID}/messages/${messageID}/reactions/${this.parse(reaction)}/@me`, 'DELETE')
  }
  
  /**
   * Clear all reactions on a message
   * @param {Snowflake} channelID ID of channel message is in
   * @param {Snowflake} messageID ID of message to clear reactions from
   * @returns {Promise<Object>}
   */
  clear (channelID, messageID) {
    return this.client.request(`/channels/${channelID}/messages/${messageID}/reactions`, 'DELETE')
  }
  
  /**
   * Creates reaction menu
   * @param {Snowflake} channelID ID of channel message is in
   * @param {Snowflake} messageID ID of message to create reaction menu
   * @param {Object} reacts React object
   * @param {Function} filter Filter
   * @param {Function} timeout Ran when times out
   * @param {Integer} time Time til timeout
   * @returns {Promise<Message>}
   */
  async menu (channelID, messageID, reacts = {}, filter = () => true, timeout = () => {}, time) {
    let stopped = false
    let tm
    const collector = (reaction) => {
      if (reaction.channelID !== channelID || reaction.messageID !== messageID || !filter(reaction)) return
      const fn = reacts[reaction.emoji.id || reaction.emoji.name]
      if (!fn) return
      stopped = true
      if (tm) clearTimeout(tm)
      fn()
      this.client.off('MESSAGE_REACTION_ADD', collector)
    }
    this.client.on('MESSAGE_REACTION_ADD', collector)
    if (time) {
      tm = setTimeout(() => {
        stopped = true
        timeout()
        this.client.off('MESSAGE_REACTION_ADD', collector)
      }, time)
    }
    const keys = Object.keys(reacts)
    for (let i = 0; i < keys.length; i++) {
      if (stopped) break
      await this.add(channelID, messageID, keys[i])
    }
  }
}

module.exports = ReactionManager
