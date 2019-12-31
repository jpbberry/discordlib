class ChannelManager {
  constructor(client) {
    this.client = client
  }

  fetch(channel_id) {
    return this.client.request(`/channels/${channel_id}`, 'GET')
  }

  edit(channel_id, edit) {
    return this.client.request(`/channels/${channel_id}`, 'PATCH', edit)
  }

  delete(channel_id) {
    return this.client.request(`/channels/${channel_id}`, 'DELETE')
  }
}

module.exports = ChannelManager
