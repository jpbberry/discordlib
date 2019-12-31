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
}

module.exports = UserManager
