// Constants
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const prefix = ['dp','&'];
const dpEmoji = "779216382545494036";
// codegrepper.com is the ONLY GOD DAMN USEFUL WEBSITE FOR HELPING BEGINNERS GAH FUCK JS
const dphelpString = fs.readFileSync('./DPhelp.txt', 'utf-8');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

// Needed for using separate files in another folder to make index.js cleaner
client.commands = new Discord.Collection();
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Log Messages
client.once('ready', () => {
    console.log('Dr. Pepper is here with 23 flavors!');
});
client.once('reconnecting', () => {
    console.log('Dr. Pepper is trying to come back...');
});
client.once('disconnect', () => {
    console.log('Dr. Pepper got lost...');
});

// & Command Handler
client.on('message', message => {
    // You know the routine
    if(!message.content.startsWith(prefix[1]) || message.author.bot) return;
    const args = message.content.slice(prefix[1].length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'play' || command === 'skip' || command === 'stop') {
        client.commands.get('play').execute(message, args, command, client, Discord);
    }
});

// dp Command Handler
client.on('message', message => {
    // "If I don't see any command prefix, I don't care"
    if(!message.content.toLowerCase().startsWith(prefix[0]) || message.author.bot) return;
    
    // "Cool, it's a command. Setup time."
    const args = message.content.toLowerCase().slice(prefix[0].length).split(/ +/);
    const command = args.shift().toLowerCase();

    // "Which command was used as the first argument?"
    // No command; user typed "dp" 
    if(command === '' || command === 'help') {
        message.channel.send(dphelpString);
    } else if(command === 'ty' || command === 'thankyou' || (args[0] === 'thank' && args[1] === 'you')) {
        message.react(dpEmoji);
        message.channel.send('You are welcome, but this was meant for pre-alpha messing around. Stop spamming your server asshole.');
    } else {
        message.channel.send('Welp, IDK what you want. Try DPhelp');
    }
});

// Meme Handler
client.on('message', message => {
    // "I don't want to handle commands nor other bots."
    if(message.author.bot || message.content.toLowerCase().startsWith(prefix[0]) || message.content.toLowerCase().startsWith(prefix[1])) return;
});



// "End of code, run it again!"
//client.login('');