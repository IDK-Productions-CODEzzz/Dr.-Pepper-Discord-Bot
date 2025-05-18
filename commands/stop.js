module.exports = {
    name: 'stop',
    description: 'Stop the bot from playing music; make him leave',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('Get in the call with me if you wanna stop me! :stuck_out_tongue_closed_eyes:');
        
        await voiceChannel.leave();
        await message.channel.send('Aight, peace!')
    }
}