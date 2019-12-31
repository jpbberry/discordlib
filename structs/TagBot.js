const Client = require("./Client");
const Embed = require("./Embed")
const types = {
    playing: 0,
    streaming: 1,
    listening: 2,
    watching: 3
}

class TagBot {
    constructor() {
        this.debugFN = () => {};
        this.readyFN = () => {};
        
        this.readyd = false
        
        this.prefix = [];
        this.mentionPrefix = false;
        this.status = null
        this.allowBots = false
        this.guildEvents = {
            add: () => {},
            remove: () => {}
        }
        
        this.DBL = null
        this.dblPost = () => {}
        
        this.user = "";
        
        this.commands = [];
        
        this.log = () => {};
    }
    
    get embed() {
        return new Embed()
    }

    addPrefix(prefix) {
        this.prefix.push(prefix);
        return this
    }
    setMentionPrefix(bool) {
        if(bool) this.mentionPrefix = true
        else this.mentionPrefix = false
        return this;
    }
    setStatus(type, game) {
        this.status = {
            type: type,
            game: game
        }
        return this
    }
    setBotRun(botrun) {
        this.allowBots = botrun
        return this
    }
    
    addCommand(commandName, commandResponse, autoDelete) {
        this.commands.push({name: commandName, res: commandResponse, del: autoDelete});
        return this;
    }
    runCommand(commandName, message) {
        if(!this.allowBots && message.author.bot) return
        let response = this.commands.find(cmd => cmd.name === commandName || (cmd.name instanceof RegExp && commandName.match(cmd.name)));
        if(!response || !response.res) return;
        this.log(`${message.author.username}#${message.author.discriminator} ran command: ${commandName}`);
        if((typeof response.res) == "function") response.res(message, this.bindMessage(message.channel_id));
        else this.client.message.send(message.channel_id, typeof response.res === 'string' ? this.resolveCommand(response.res, message) : response.res);
        if(response.del) this.client.message.delete(message.channel_id, message.id).catch(()=>{});
    }
    resolveCommand(content, message) {
        return content
            .replace(/{author}/gi, `<@${message.author.id}>`)
    }
    
    bindMessage(channelID) {
        return (content) => {
            return this.client.message.send(channelID, content);
        }
    }
    
    setDebug(fn) {
        this.debugFN = fn;
        return this;
    }
    setLog(fn) {
        this.log = fn;
        return this;
    }
    
    ready(fn) {
        this.readyFN = fn;
        return this
    }
    
    guilds(obj) {
        this.guildEvents.add = obj.add || (() => {})
        this.guildEvents.remove = obj.remove || (() => {})
        return this
    }
    
    dbl(token, onpost) {
        let DBL
        try {
            DBL = require('dblapi.js')
        } catch (err) {
            console.error('Ensure that the dblapi.js module is installed. Discord Bot List posting has not been enabled...')
        }
        if (!DBL) return
        
        this.DBL = new DBL(token)
        this.dblPost = onpost || (()=>{})
        return this
    }
    
    login(token, extraopts) {
        this.client = new Client(token, 
            {dontStart: true, ...extraopts}, 
            (...args) => {
                this.debugFN(...args);
            }
        );
        this.setup();
        return this.client;
    }
    
    setup() {
        this.client.on("MESSAGE_CREATE", (message) => {
            // message.content = message.content.toLowerCase();
			let space = false
			const prefix = ([
				...this.prefix,
				...(this.mentionPrefix ? [`<@${this.user.id}>`, `<@!${this.user.id}>`] : [])
			].find(prefix => {
				if (message.content.startsWith(prefix)) {
					if (prefix.startsWith("<@")) space = true
					return true
				}
			}))
            if(!prefix) return;
            const messagePart = message.content.slice(`${prefix}${space ? " " : ""}`.length).split(' ');
            const commandName = messagePart[0]
            message.args = messagePart.slice(1)
            
            this.runCommand(commandName, message);
        })
        this.client.on("READY", (data) => {
            this.readyFN(data)
            this.readyd = true
            this.user = data.user;
            this.log(`Logged in as ${data.user.username}#${data.user.discriminator}`);
            
            if (this.status) {
                this.client.user.status({
                    game: {
                        type: types[this.status.type.toLowerCase()],
                        name: this.status.game
                    }
                })
            }
            
            if (this.DBL) {
                this.DBL.postStats(this.client.guilds.size)
                this.log('Posted stats to DBL')
                this.dblPost(this.client.guilds.size)
                setInterval(() => {
                    this.DBL.postStats(this.client.guilds.size)
                    this.log('Posted stats to DBL')
                    this.dblPost(this.client.guilds.size)
                }, 1800000)
            }
        })
        
        this.client.on("GUILD_CREATE", (guild) => {
            if (this.readyd) this.guildEvents.add(guild)
        })
        this.client.on("GUILD_DELETE", (g) => {
            if (!g.unavailable) this.guildEvents.remove(g)
        })
        
        this.client.start();
    }
}

module.exports = TagBot;