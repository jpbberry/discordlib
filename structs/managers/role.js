class RoleManager {
  constructor(client) {
    this.client = client
  }
  
  add(guild_id, user_id, role_id) {
    return this.client.request(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, 'PUT')
  }
  remove(guild_id, user_id, role_id) {
    return this.client.request(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, 'DELETE')
  }
  
  create(guild_id, data = {}) {
    return this.client.request(`/guilds/${guild_id}/roles`, 'POST', data)
  }
  delete(guild_id, role_id) {
    return this.client.request(`/guilds/${guild_id}/roles/${role_id}`, 'DELETE')
  }
  edit(guild_id, role_id, edit) {
    return this.client.request(`/guilds/${guild_id}/roles/${role_id}`, 'PATCH', edit)
  }
}

module.exports = RoleManager
