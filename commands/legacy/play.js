// Setup
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { VoiceChannel } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'plays music',
    async execute(message, args) {
        // Nobody is in VC; don't waste resources
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('Hey, look. I have limited banwidth. If you want music, be in the call to listen.');

        // Just gotta make sure everything is in check
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) return message.channel.send('This is awkward... I do not have the connect permission...');
        if(!permissions.has('SPEAK')) return message.channel.send('This is awkward... I do not have the speak permission...');
        if(!args.length) return message.channel.send('Okay, okay, haha very funny. Now give me something to play.');

        // "Is the argument a URL or just key words?"
        const validURL = (str) => {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex.test(str)) {
                return false;
            } else {
                return true;
            }
        }

        // If URL was what was passed in
        if(validURL(args[0])) {
            const connection = await voiceChannel.join();
            const stream = ytdl(args[0], {filter: 'audioonly'});
            connection.play(stream, {seek: 0, volume: 1})
            .on('finish', () =>{
                voiceChannel.leave();
                message.channel.send('The song is done, and I am gone!');
            });
            await message.reply(`:thumbsup: Now Playing ***[SONG YOU CHOSE]***`);
            return;
        }

        // Yea I have no clue; will separate and comment once I figure it out
        const connection = await voiceChannel.join();
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }
        const video = await videoFinder(args.join(' '));

        // If video found, play it!
        if(video) {
            const stream = ytdl(video.url, {filter: 'audioonly'});
            connection.play(stream, {seek: 0, volume: 1})
            .on('finish', () =>{
                //setTimeout(function() {
                voiceChannel.leave();
                message.channel.send('The song is done, and I am gone!');
                //}, 120000);
            });
            await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
        } else {
            message.channel.send('Search came up dry. Whoops.');
        }
    }
}

// To execute in "index.js":
// client.commands.get('play').execute(message, args)