class MemberManager {
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

  fetch (guild_id, user_id) {
    return this.client.request(`/guilds/${guild_id}/members/${user_id}`, 'GET')
  }

  edit (guild_id, user_id, edit) {
    return this.client.request(`/guilds/${guild_id}/members/${user_id}`, 'PATCH', edit)
  }

  nickname (guild_id, user_id, nickname) {
    return this.edit(guild_id, user_id, {
      nick: nickname
    })
  }

  voice (guild_id, user_id, mute, deaf) {
    const obj = {}
    if ([true, false].includes(mute)) obj.mute = mute
    if ([true, false].includes(deaf)) obj.mute = deaf
    return this.edit(guild_id, user_id, obj)
  }

  kick (guild_id, user_id) {
    return this.client.request(`/guilds/${guild_id}/members/${user_id}`, 'DELETE')
  }

  ban (guild_id, user_id, reason, days = 0) {
    return this.client.request(`/guilds/${guild_id}/bans/${user_id}?delete-message-days=${days}${reason ? `&reason=${reason}` : ''}`, 'PUT')
  }

  unban (guild_id, user_id) {
    return this.client.request(`/guilds/${guild_id}/bans/${user_id}`, 'DELETE')
  }
}

module.exports = MemberManager
