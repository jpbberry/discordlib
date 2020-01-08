/**
 * User manager
 */
class UserManager {
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
   * Sets status
   * @param {Object} data Discord status object
   */
  status (data) {
    for (const shard of this.client.shards) {
      shard.ws.send(
        JSON.stringify({
          op: 3,
          d: {
            afk: data.afk || false,
            since: data.since || 0,
            status: data.status || 'online',
            game: data.game || null
          }
        })
      )
    }
  }
  /**
   * Edits client user
   * @param {Object} edit Discord user edit object
   * @returns {Promise<Object>}
   */
  edit (edit) {
    return this.client.request('/users/@me', 'PATCH', edit)
  }
  
  /**
   * Sets clients username
   * @param {String} username New username
   * @returns {Promise<Object>}
   */
  username (username) {
    return this.edit({
      username: username
    })
  }
}

module.exports = UserManager
