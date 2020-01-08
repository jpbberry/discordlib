class GuildManager {
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

  fetch (id) {
    return this.client.request(`/guilds/${id}`, 'GET')
  }

  edit (id, edit) {
    return this.client.request(`/guilds/${id}`, 'PATCH', edit)
  }

  delete (id) {
    return this.client.request(`/guilds/${id}`, 'DELETE')
  }

  leave (id) {
    return this.client.request(`/users/@me/guilds/${id}`, 'DELETE')
  }
}

module.exports = GuildManager
