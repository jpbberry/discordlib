const browser = typeof window !== 'undefined'
const WS = browser ? WebSocket : require('ws')
const req = browser ? fetch : require('node-fetch')

function wait (a) { return new Promise(r => { setTimeout(() => r(), a) }) }

const wsAdapt = {
  message: (ws, fn) => { return browser ? ws.onmessage = fn : ws.on('message', fn) },
  open: (ws, fn) => { return browser ? ws.onopen = fn : ws.on('open', fn) },
  close: (ws, fn) => { return browser ? ws.onclose = fn : ws.on('close', fn) }
}
/**
 * Represents a shard connected to the discord websocket
 */
class Shard {
  /**
   * Creates a Shard instance
   * @param {Integer} shardID ID of shard to spawn
   * @param {Client} client Initiating client
   */
  constructor (shardID, client) {
    /**
     * Shard ID
     * @type {Integer}
     */
    this.id = shardID
    /**
     * Intitiating client
     * @type {Client}
     */
    this.client = client
    /**
     * Websocket of shard
     * @type {WebsocketClient}
     */
    this.ws = null
    /**
     * Count of ready payload's guild (Not Updated)
     * @type {Integer}
     */
    this.guildCount = null
    /**
     * Counted number of guilds to compare to guildCount
     * @type {Integer}
     */
    this.counted = 0
    /**
     * Whether shard has ready'd and received all guilds
     * @type {Boolean}
     */
    this.readyd = false

    /**
     * Origin ready object
     * @type {Object}
     */
    this.readyObj = null

    /**
     * ID of interval running heartbeats
     * @type {Integer}
     */
    this.hbInterval = null
    
    /**
     * Sequence Number
     * @type {Integer}
     */
    this.s = null
  
    /**
     * Whether shard is waiting for a heartbeat ack
     * @type {Boolean}
     */
    this.waitingHeartbeat = false
  }
  
  /**
   * Spawn shard
   */
  spawn () {
    let ws
    this.ws = ws = new WS(this.client.options.websocket)

    this.client.debug(`Spawned shard ${this.id}`)

    wsAdapt.message(ws, (msg) => {
      this.message(msg)
    })
    wsAdapt.open(ws, (msg) => {
      this.open(msg)
    })
    wsAdapt.close(ws, (msg) => {
      this.close(msg)
    })
  }
  
  /**
   * Sends a heartbeat
   */
  heartbeat () {
    if (this.waitingHeartbeat) { this.client.debug(`Shard ${this.id} heartbeat took too long`) };
    this.ws.send(
      JSON.stringify({
        op: 1,
        d: this.s
      })
    )
    this.waitingHeartbeat = new Date().getTime()
    this.client.debug('Heartbeat')
  }
  
  /**
   * Processes message from discord
   * @param {String} msg Raw message
   */
  message (msg) {
    var data = JSON.parse(browser ? msg.data : msg)
    if (data.s) this.s = data.s

    if (this.client.options.ignoreEvents.includes(data.t)) return

    if (data.t === 'READY') {
      this.guildCount = data.d.guilds.length
      this.readyObj = data.d
      return
    }

    if (data.t === 'GUILD_CREATE' && !this.readyd) {
      this.client.guilds.set(data.d.id, data.d)
      this.counted++
      if (this.counted >= this.guildCount) {
        this.client.emit('SHARD_READY', this.readyObj, this)
        this.readyObj = null
        this.readyd = true
      }
      return
    }

    this.client.emit(data.t, data.d || data, this)
    this.client.emit('*', data.d || data, this)

    if (data.op == 10) this.hello(data)
    if (data.op == 11) this.ack(data)
  }
  
  /**
   * Handles hello opcode
   * @param {Object} msg Hello message
   */
  hello (msg) {
    this.client.debug(`Hello on shard ${this.id}`)
    this.ws.send(
      JSON.stringify({
        op: 2,
        d: {
          shard: this.client.options.shards > 1 ? [this.id, this.client.options.shards] : undefined,
          token: this.client.token,
          properties: {
            $os: 'linux',
            $browser: 'jpbbgay',
            $device: 'idkwebsockets'
          }
        }
      })
    )

    this.hbInterval = setInterval(this.heartbeat.bind(this), msg.d.heartbeat_interval)
    this.client.debug('Heartbeat interval: ' + msg.d.heartbeat_interval)
  }
  
  /**
   * Handled heartbeat ack
   * @param {Object} msg Acknowledge message
   */
  ack (msg) {
    const cur = new Date().getTime() - this.waitingHeartbeat
    this.client.debug(`Heartbeat on shard ${this.id} acknowledged after ${cur}ms`)
    this.waitingHeartbeat = false
  }
  
  /**
   * Handles hello event
   */
  open () {
    this.client.debug(`${this.id} websocket started`)
  }
  
  /**
   * Handles close event
   * @param {Object} msg Close event object
   */
  close (msg) {
    console.debug(`Shard ${this.id} closed, Reason: ${msg.reason} Code: ${msg.code}`)
    clearInterval(this.hbInterval)
    process.exit()
  }
  
  /**
   * Kills the websocket
   */
  kill () {
    this.ws.close()
  }
}

module.exports = Shard
