const Message = require('./Message')
const Channel = require('./Channel')
const Guild = require('./Guild')

class Parts {
    constructor(client) {
        this.client = client
    }
    
    message(channelID, messageID, message) {
        return new Message(this, channelID, messageID, message)
    }
    
    channel(channelID, guildID, channel) {
        return new Channel(this, channelID, guildID, channel)
    }
    
    guild(guildID, guild) {
        const g = this.client.guilds.get(guildID)
        if (g) return g
        return new Guild(this, guildID, guild)
    }
}

module.exports = Parts