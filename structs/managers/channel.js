class ChannelManager {
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

  fetch (channel_id) {
    return this.client.request(`/channels/${channel_id}`, 'GET')
  }

  edit (channel_id, edit) {
    return this.client.request(`/channels/${channel_id}`, 'PATCH', edit)
  }

  delete (channel_id) {
    return this.client.request(`/channels/${channel_id}`, 'DELETE')
  }

  create (guild_id, obj = {}) {
    return this.client.request(`/guilds/${guild_id}/channels`, 'POST', obj)
  }
}

module.exports = ChannelManager
