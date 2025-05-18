const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

// Code Lyon told me I needed this
// queue(message.guild.id, queue_constructor object {voice_channel, text_channel, connection, song[]);})
const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'],
    cooldown: 0,
    description: 'Discord Music Bot Stuff',
    async execute(message, args, command, client, Discord){
        const voice_channel = message.member.voice.channel;
        if(!voice_channel) return message.channel.send('Hey, look. I have limited banwidth. If you want music, be in the call to listen.');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) return message.channel.send('This is awkward... I do not have the connect permission...');
        if(!permissions.has('SPEAK')) return message.channel.send('This is awkward... I do not have the speak permission...');
        const server_queue = queue.get(message.guild.id);

        if(command === 'play') {
            if(!args.length) return message.channel.send('Cool... So what am I playing?');
            let song = {};

            if(ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const video_finder = async (query) =>{
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await video_finder(args.join(' '));
                
                if(video) {
                    song = { title: video.title, url: video.url }
                } else {
                    message.channel.send('So uh... I cannot find it. Sorry...');
                }
            }
            
            if(!server_queue) {
                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch(err) {
                    queue.delete(message.guild.id);
                    message.channel.send('As much as I would love to connect, my programmer gave me this bug. Sorry...');
                }
            } else {
                server_queue.songs.push(song);
                return message.channel.send(`**${song.title}** was added to the queue.`);
            }
        } else if(command === 'skip') {
            skip_song(message, server_queue);
        } else if(command === 'stop') {
            stop_song(message, server_queue);
        }

    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if(!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 1 })
    .on('finish', () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });
    await song_queue.text_channel.send(`Now playing **${song.title}**`);
}

const skip_song = (message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You can skip a song when you join the VC. Stop trolling!');
    if(!server_queue) return message.channel.send(`There aren't any songs to skip!`);
    server_queue.connection.dispatcher.end();
    message.channel.send('Aight, skipped it.');
}

const stop_song = (message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You can stop the song when you are able to hear it.');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}