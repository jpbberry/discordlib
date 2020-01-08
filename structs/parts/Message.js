class Message {
    constructor(parts, channelID, messageID, m) {
        this.parts = parts
        this.channelID = channelID
        if (!this.channelID) throw new Error('Error creating message part, missing channel id')
        this.id = messageID
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
        return this.parts.client.message.fetch(this.channelID, this.messageID)
    }
    
    get channel() {
        return this.parts.channel(this.channelID, this.guildID)
    }
    
    get guild() {
        if (!this.guildID) throw new Error('No guild provided')
        return this.parts.guild(this.guildID)
    }
    
    react(emoji) {
        return this.parts.client.reaction.add(this.channelID, this.id, emoji)
    }
    
    edit(...msg) {
        return this.parts.client.message.edit(this.channelID, this.id, ...msg)
    }
}

module.exports = Message
