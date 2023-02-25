require('dotenv').config();
const fs = require('fs');
const {goodsentance} = require('./goodsentance.json');
const {Routes} = require('discord-api-types/v9');
const {REST} = require('@discordjs/rest');
const {badwords} = require('./badwords.json');
const { Client, IntentsBitField, EmbedBuilder, ActivityType, SlashCommandBuilder, Collection } = require('discord.js');

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ]
  });
client.commands = new Collection();
const commandsFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
for(const file of commandsFiles){
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name,command);
}

client.once('ready', ()=> {
    client.user.setStatus('invisible');
    console.log('Luke Filtered');
    const Clientid = client.user.id;
    const rest = new REST({version: "9"}).setToken(process.env.TOKEN);
    (async() =>{
        try{
            if(process.env.ENV === "production"){
                await rest.put(Routes.applicationCommands(Clientid),{
                    body: commands
                });
                console.log("commands registered globally");
            }else{
                await rest.put(Routes.applicationGuildCommands(Clientid,process.env.GUILD_ID),{
                    body: commands
                });
                console.log("commands registered locally");
            }
        }catch(error){
            console.error(error);
        }
    })();
})

client.on('interactionCreate', async interaction =>{
    if(!interaction.isCommand)return;
    const command = client.commands.get(interaction.commandName);
    if(!command)return;
    try{
        await command.execute(interaction);
    }catch(error){
        console.error(error);
        await interaction.reply({content: 'There was an error while running this, please try again', ephermeral:true})
    }
})

client.on('messageCreate', async message => {
     if(message.author.id == '350756812552798242'){
        let confirm = false;
        var i;
        for(i=0;i<badwords.length;i++){
            if(message.content.toLowerCase().includes(badwords[i])){
                confirm = true;
            }
        }
        if(confirm){
            message.delete();
            username = client.user.username;
            randmsg = Math.floor(Math.random() * goodsentance.length);
            message.channel.send(goodsentance[randmsg])
        }
    }
})

client.login(process.env.TOKEN);