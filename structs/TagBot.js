const Client = require('./Client')
const Embed = require('./Embed')

/**
 * Status types, takes 'playing', 'streaming', 'listening', or 'watching'
 */
const types = {
  playing: 0,
  streaming: 1,
  listening: 2,
  watching: 3
}

/**
 * Tag Bot filled with easy methods
 */
class TagBot {
  constructor () {
    /**
         * Debug function
         * @type {Function}
         */
    this.debugFN = () => {}
    /**
         * Ready Function
         * @type {Function}
         */
    this.readyFN = () => {}

    /**
         * Whether or not client is ready
         * @type {Boolean}
         */
    this.readyd = false

    /**
         * List of prefixes bot has attached
         * @type {Array}
         */
    this.prefix = []
    /**
         * Whether or not mention counts as a prefix
         * @type {Boolean}
         */
    this.mentionPrefix = false
    /**
         * Status object
         * @type {Object}
         */
    this.status = null
    /**
         * Whether to allow bots to run commands
         * @type {Boolean}
         */
    this.allowBots = false
    /**
         * Guild event object
         * @type {Object}
         */
    this.guildEvents = {
      add: () => {},
      remove: () => {}
    }

    /**
         * DBL Object or null
         * @type {DBLAPI}
         */
    this.DBL = null
    /**
         * DBL onpost function
         * @type {Function}
         */
    this.dblPost = () => {}

    /**
         * Clients User Object
         * @type {Object}
         */
    this.user = ''

    /**
         * Commands
         * @type {Array}
         */
    this.commands = []

    /**
         * Log function
         * @type {Function}
         */
    this.log = () => {}
  }

  /**
     * Gets a new embed object
     * @returns {Embed}
     */
  get embed () {
    return new Embed()
  }

  /**
     * Adds a prefix for command handling
     * @param {String} prefix Prefix to add
     * @returns {TagBot} Tag Bot client.
     */
  addPrefix (prefix) {
    this.prefix.push(prefix)
    return this
  }

  /**
     * Whether to take @Bot as prefix
     * @param {Boolean} bool Whether to do so
     * @returns {TagBot} Tag Bot client.
     */
  setMentionPrefix (bool) {
    if (bool) this.mentionPrefix = true
    else this.mentionPrefix = false
    return this
  }

  /**
     * Sets the status of the bot
     * @param {StatusType} type Status type
     * @param {String} game Status name
     * @returns {TagBot} Tag Bot client.
     */
  setStatus (type, game) {
    this.status = {
      type: type,
      game: game
    }
    return this
  }

  /**
     * Whether to allow bots to run commands (default is false)
     * @param {Boolean} botrun Whether to do so
     * @returns {TagBot} Tag Bot client.
     */
  setBotRun (botrun) {
    this.allowBots = botrun
    return this
  }

  /**
     * Adds a command
     * @param {String} commandName Name of command
     * @param {String or Function} commandResponse Command response to send back, or function run.
     * @param {Boolean} autoDelete Whether to delete the invoking message
     * @returns {TagBot} Tag Bot client.
     */
  addCommand (commandName, commandResponse, autoDelete) {
    this.commands.push({ name: commandName, res: commandResponse, del: autoDelete })
    return this
  }

  /**
     * (Internal) Runs a command
     * @param {String} commandName Name of command to run
     * @oaram {Object} message Message object
     */
  runCommand (commandName, message) {
    if (!this.allowBots && message.author.bot) return
    const response = this.commands.find(cmd => cmd.name === commandName || (cmd.name instanceof RegExp && commandName.match(cmd.name)))
    if (!response || !response.res) return
    this.log(`${message.author.username}#${message.author.discriminator} ran command: ${commandName}`)
    if ((typeof response.res) === 'function') response.res(message, this.bindMessage(message.channel_id))
    else this.client.message.send(message.channel_id, typeof response.res === 'string' ? this.resolveCommand(response.res, message) : response.res)
    if (response.del) this.client.message.delete(message.channel_id, message.id).catch(() => {})
  }

  /**
     * (Internal) Resolved command response text
     * @param {String} content Content of response
     * @param {Object} message Message object
     * @returns {String} Resolved content
     */
  resolveCommand (content, message) {
    return content
      .replace(/{author}/gi, `<@${message.author.id}>`)
  }

  /**
     * (Internal) Binds a message to a channel ID
     * @param {Snowflake} channelID ID of channel to bind
     * @returns {Function} Send function
     */
  bindMessage (channelID) {
    return (content) => {
      return this.client.message.send(channelID, content)
    }
  }

  /**
     * Sets debug function
     * @param {Function} fn Function to run with msg
     * @returns {TagBot} Tag Bot client.
     */
  setDebug (fn) {
    this.debugFN = fn
    return this
  }

  /**
     * Sets log function
     * @param {Function} fn Function to run with msg
     * @returns {TagBot} Tag Bot client.
     */
  setLog (fn) {
    this.log = fn
    return this
  }

  /**
     * Run on ready
     * @param {Function} fn Function to run, returns ready payload
     * @returns {TagBot} Tag Bot client.
     */
  ready (fn) {
    this.readyFN = fn
    return this
  }

  /**
     * For eventing adding and removing guilds
     * @param {Object} obj Response object
     * @param {Function} obj.add Ran when guild added with guild object
     * @param {Function} obj.remove Ran when guild removed with removal object
     * @returns {TagBot} Tag Bot client.
     */
  guilds (obj) {
    this.guildEvents.add = obj.add || (() => {})
    this.guildEvents.remove = obj.remove || (() => {})
    return this
  }

  /**
     * Add DBL posting every 30 minutes
     * @param {String} token DBL Bot token
     * @param {Function} onpost Ran when posting, with guild count
     * @returns {TagBot} Tag Bot client.
     */
  dbl (token, onpost) {
    let DBL
    try {
      DBL = require('dblapi.js')
    } catch (err) {
      console.error('Ensure that the dblapi.js module is installed. Discord Bot List posting has not been enabled...')
    }
    if (!DBL) return

    this.DBL = new DBL(token)
    this.dblPost = onpost || (() => {})
    return this
  }

  /**
     * Login to bot
     * @param {String} token Bot token
     * @param {Object} extraopts Extra options to apply to construction of client
     * @returns {Client} Internal client instance
     */
  login (token, extraopts) {
    this.client = new Client(token,
      { dontStart: true, ...extraopts },
      (...args) => {
        this.debugFN(...args)
      }
    )
    this.setup()
    return this.client
  }

  /**
     * (Internal) Sets up client and it's events
     */
  setup () {
    this.client.on('MESSAGE_CREATE', (message) => {
      // message.content = message.content.toLowerCase();
      let space = false
      const prefix = ([
        ...this.prefix,
        ...(this.mentionPrefix ? [`<@${this.user.id}>`, `<@!${this.user.id}>`] : [])
      ].find(prefix => {
        if (message.content.startsWith(prefix)) {
          if (prefix.startsWith('<@')) space = true
          return true
        }
      }))
      if (!prefix && prefix !== '') return
      const messagePart = message.content.slice(`${prefix}${space ? ' ' : ''}`.length).split(' ')
      const commandName = messagePart[0]
      message.args = messagePart.slice(1)

      this.runCommand(commandName, message)
    })
    this.client.on('READY', (data) => {
      this.readyFN(data)
      this.readyd = true
      this.user = data.user
      this.log(`Logged in as ${data.user.username}#${data.user.discriminator}`)

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

    this.client.on('GUILD_CREATE', (guild) => {
      if (this.readyd) this.guildEvents.add(guild)
    })
    this.client.on('GUILD_DELETE', (g) => {
      if (!g.unavailable) this.guildEvents.remove(g)
    })

    this.client.start()
  }
}

module.exports = TagBot
