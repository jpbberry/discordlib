class Channel {
    constructor(client, channelID, guildID, c) {
        this.client = client
        this.channelID = channelID
        this.guildID = guildID
        
        if (c) {
            this.name = c.name
        }
    }
}

module.exports = Channel
