const { ShardingManager } = require('discord.js');
const config = require('./config.js');
require('dotenv').config();
const manager = new ShardingManager('./bot.js', {
    token: config.TOKEN || process.env.TOKEN,
    totalShards: 'auto'
});

manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
});

manager.spawn();
