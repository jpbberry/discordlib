class Channel {
    constructor(parts, channelID, guildID, c) {
        this.parts = parts
        this.id = channelID
        this.guildID = guildID
        
        if (c) {
            this.name = c.name
        }
    }
    
    get guild() {
        if (!this.guildID) throw new Error('Missing guild')
        return this.parts.guild(this.guildID)
    }
    
    send(...msg) {
        return this.parts.client.message.send(this.id, ...msg)
    }
}

module.exports = Channel
