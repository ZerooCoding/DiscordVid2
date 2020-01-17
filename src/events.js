const logger = require('./logger')('[EVENTS]');
const Util = require('./util');

module.exports = class Events {
  constructor(client) {
    this.client = client;
    client.on('message', this.onMessage.bind(this));
  }

  async onMessage(message) {
    this.client.stats.bumpStat('messages');
    if(message.author.bot) return;
    try {
      // 2048
      if(message.channel.type !== 'dm' && !message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;
    } catch (e) {
      return logger.error('Critical permission error', message.channel.type, message.channel.permissionsFor(this.client.user));
    }

    // Command parsing
    const args = Util.Prefix.strip(message).split(' ') || [];
    const commandName = message.content.match(new RegExp(`^<@!?${this.client.user.id}>$`)) ? 'generate' : args.splice(0, 1)[0];
    const command = this.client.cmds.get(commandName, message);
    if(!command) return;
    try {
      await command._exec(message, { args });
    } catch (e) {
      logger.error(`The '${command.name}' command failed.`);
      console.log(e);
      message.channel.send(':fire: An error occurred while processing that command!');
      message.channel.stopTyping(true);
    }
  }
};