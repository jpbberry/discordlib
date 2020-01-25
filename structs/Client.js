const WS = require('ws')
const Embed = require('./Embed')
const req = require('node-fetch')
const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')
const Request = require('../req')

function wait (a) { return new Promise(r => { setTimeout(() => r(), a) }) }

const Shard = require('./Shard.js')

/**
 * Base of all discord communication
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {
  constructor (token, options = {}, debug = () => {}) {
    super()
    /**
     * Debug function
     * @type {Function}
     */
    this.debug = debug
    this.options = {
      shards: options.shards || 1,
      ignoreEvents: options.ignoreEvents || [],
      websocket: options.websocket || 'wss://gateway.discord.gg/?v=6&encoding=json',
      api: 'https://discordapp.com/api/v7',
      dontStart: options.dontStart || false,
      spawnTimeout: options.spawnTimeout || 6000
    }
    
    /**
     * Token
     * @type {String}
     */
    this.token = token
    
    /**
     * Shards
     * @type {Array}
     */
    this.shards = []
    
    this.api = Request(this.options.api, { 'Authorization': `Bot ${token}` })

    /**
     * Ready booleans for each shard
     * @type {Object}
     */
    this.readys = {}
  
    /**
     * Guilds
     * @type {Map}
     */
    this.guilds = new Map()

    this.on('GUILD_CREATE', (guild) => {
      this.guilds.set(guild.id, guild)
    })

    this.on('GUILD_DELETE', (guild) => {
      this.guilds.delete(guild.id)
    })

    this.on('GUILD_UPDATE', (guild) => {
      this.guilds.set(guild.id, guild)
    })

    this.on('SHARD_READY', (_, shard) => {
      this.readys[shard.id] = true
      if (!Object.values(this.readys).includes(false)) this.emit('READY', _)
    })
    fs.readdirSync(path.resolve(__dirname, './managers')).forEach(manager => {
      const m = require(path.resolve(__dirname, './managers', manager))
      this[manager.split('.')[0]] = new m(this)
    })
    
    this.parts = require('./parts/Parts')

    if (!this.options.dontStart) this.start()

    this.Embed = Embed
  }
  
  /**
   * Embed
   * @returns {Embed}
   */
  get embed () {
    return new this.Embed()
  }
  
  /**
   * Starts bot
   */
  async start () {
    for (var shard = 0; shard < this.options.shards; shard++) {
      this.spawn(shard)
      this.readys[shard] = false
      await wait(this.options.spawnTimeout)
    }
  }
  
  /**
   * Spawns a shard
   * @param {Integer} shard Shard ID
   */
  spawn (shard) {
    const s = new Shard(shard, this)
    this.shards.push(s)
    this.debug(`Starting shard ${shard}`)
    s.spawn()
  }
  
  /**
   * Kills all connections
   */
  kill () {
    this.shards.forEach(_ => { _.kill() })
  }
  
  /**
   * Requests to discord api
   * @param {String} endpoint endpoint to attach onto the end of /.../v./[]
   * @param {String} method HTTP Method
   * @param {Object} body Body to send
   * @param {Object} headers Headers to append to default
   * @returns {Promise<Object>}
   */
  request (endpoint, method = 'GET', body = null, headers = {}) {
    return new Promise((res, rej) => {
      if (!['GET', 'POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) throw new TypeError('Method must be GET, POST, PATCH, DELETE or PUT')
      const go = () => {
        req(encodeURI(this.options.api + endpoint), {
          method: method,
          body: body ? JSON.stringify(body) : null,
          headers: {
            Authorization: `Bot ${this.token}`,
            'Content-Type': 'application/json',
            ...headers
          }
        })
          .then(x => {
            if (x.status !== 204) return x.json()
          })
          .then(response => {
            if (response && response.retry_after) {
              return setTimeout(() => {
                go()
              }, response.retry_after)
            }
            res(response)
          })
          .catch(err => rej(err))
      }
      go()
    })
  }
}

module.exports = Client
