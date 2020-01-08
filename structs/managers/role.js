/**
 * Role manager
 */
class RoleManager {
  /**
   * Creates Manager instance
   * @param {Client} client Intitiating client
   */
  constructor (client) {
    /**
     * Intitiating client
     * @type {Client}
     */
    this.client = client
  }
  
  /**
   * Add role to user
   * @param {Snowflake} guildID ID of guild
   * @param {Snowflake} userID ID of user (member)
   * @param {Snowflake} roleID ID of role to add to member
   * @returns {Promise<Object>}
   */
  add (guildID, userID, roleID) {
    return this.client.request(`/guilds/${guildID}/members/${userID}/roles/${roleID}`, 'PUT')
  }
  
  /**
   * Remove role from user
   * @param {Snowflake} guildID ID of guild
   * @param {Snowflake} userID ID of user (member)
   * @param {Snowflake} roleID ID of role to remove from member
   * @returns {Promise<Object>}
   */
  remove (guildID, userID, roleID) {
    return this.client.request(`/guilds/${guildID}/members/${userID}/roles/${roleID}`, 'DELETE')
  }

  /**
   * Creates a role
   * @param {Snowflake} guildID ID of guild to create role in
   * @param {Object} data Role object
   * @returns {Promise<Object>}
   */
  create (guildID, data = {}) {
    return this.client.request(`/guilds/${guildID}/roles`, 'POST', data)
  }
  
  /**
   * Deletes a role
   * @param {Snowflake} guildID ID of guild role is in
   * @param {Snowflake} roleID ID of role to delete
   * @returns {Promise<Object>}
   */
  delete (guildID, roleID) {
    return this.client.request(`/guilds/${guildID}/roles/${roleID}`, 'DELETE')
  }
  
  /**
   * Edit a role
   * @param {Snowflake} guildID ID of guild role is in
   * @param {Snowflake} roleID ID of role to edit
   * @param {Object} edit Role object
   * @returns {Promise<Object>}
   */
  edit (guildID, roleID, edit) {
    return this.client.request(`/guilds/${guildID}/roles/${roleID}`, 'PATCH', edit)
  }
}

module.exports = RoleManager
