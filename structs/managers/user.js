class UserManager {
  constructor(client) {
    this.client = client
  }
  
  status(data) {
    for (let shard of this.client.shards) {
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
  
  edit(edit) {
    return this.client.request(`/users/@me`, 'PATCH', edit)
  }
  
  username(username) {
    return this.edit({
      username: username
    })
  }
}

module.exports = UserManager
