class Message {
    constructor(client, channelID, messageID, m) {
        this.client = client
        this.channelID = channelID
        this.messageID = messageID
        this.raw = m
        
        if (m) {
            this.guildID = m.guild_id
            this.content = m.content
            this.author = null//todo
            this.timestamp = new Date(m.timestamp)
            this.tts = m.tts
            this.embeds = m.embeds
        }
    }
    
    fetch() {
        return this.client.message.fetch(this.channelID, this.messageID)
    }
    
    get channel() {
        return this.client.channels(this.channelID, this.guildID)
    }
    
    get guild() {
        if (!this.guildID) throw new Error('No guild provided')
        return this.client.guilds(this.guildID)
    }
}

module.exports = Message
