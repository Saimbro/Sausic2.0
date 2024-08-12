const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");

module.exports = {
  name: "stats",
  description: "Get information about the bot's presence",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      // Aggregate server and user counts across all shards
      client.shard.broadcastEval(() => {
        return [this.guilds.cache.size, this.guilds.cache.reduce((a, g) => a + g.memberCount, 0)];
      }).then(results => {
        const totalGuilds = results.reduce((acc, [guildCount]) => acc + guildCount, 0);
        const totalUsers = results.reduce((acc, [, memberCount]) => acc + memberCount, 0);

        const statsDescription = `
\`\`\`css
Bot Stats:
- Total Servers: ${totalGuilds}
- Total Users: ${totalUsers}
\`\`\`
        `;

        const embed = new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle(`${client.user.username} Stats`)
          .setDescription(statsDescription)
          .setFooter({ text: `SAUSIC 2.0`, iconURL: client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
      }).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  },
};
