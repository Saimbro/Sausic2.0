const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const fs = require("fs");
const path = require('path');
const { printWatermark } = require('./util/pw');
const { initializePlayer } = require('./player');

// Define intents
const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
];

const client = new Client({ intents });

client.config = config;
initializePlayer(client);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.riffy.init(client.user.id);
    
    // Start the Express server only if this is the first shard
    if (client.shard.ids.includes(0)) {
        const express = require("express");
        const app = express();
        const port = 3000;
        app.get('/', (req, res) => {
            const imagePath = path.join(__dirname, 'index.html');
            res.sendFile(imagePath);
        });
        app.listen(port, () => {
            console.log(`🔗 Listening to GWSaim : http://localhost:${port}`);
        });

        printWatermark();
    }
});

fs.readdir("./events", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
    if (err) throw err;
    files.forEach(async (f) => {
        try {
            if (f.endsWith(".js")) {
                let props = require(`${config.commandsDir}/${f}`);
                client.commands.push({
                    name: props.name,
                    description: props.description,
                    options: props.options,
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
});

client.on("raw", (d) => {
    const { GatewayDispatchEvents } = require("discord.js");
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
});

client.login(config.TOKEN || process.env.TTOKEN).catch((e) => {
    console.log('TOKEN ERROR❌  - Turn On Intents or Reset New Token');
});
