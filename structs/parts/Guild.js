class Guild {
    constructor(parts, guildID, guild) {
        this.parts = parts
        this.id = guildID
        this.raw = guild
        
        if (guild) {
            this.name = guild.name
            this.ownerID = guild.owner_id
            this.chans = guild.channels
        }
    }
    
    get channels() {
        if (!this.chans) throw new Error('Missing channels')
        return this.chans.map(x=>{
            this.parts.channel(x.id, this.id)
        })
    }
}

module.exports = Guild
