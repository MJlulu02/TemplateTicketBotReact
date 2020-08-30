const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const fs = require("fs");

const config = require('./Bdd/Config.json');
const bdd = require('./Bdd/Bdd.json');

const TicektsId = new Array();

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag} !`);
});

client.on("message", message => {

    let args = message.content.trim().split(/ +/g)

    if(message.content.startsWith(config.prefix +"close")) {
        if(TicektsId.includes(message.channel.id)) {
            const embed = new Discord.MessageEmbed()
            .setColor('#009432')
            .setDescription('`Voulez vous fermez le ticket ?`')
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        message.channel.send(embed).then(function (message) {
            message.react(":white_check_mark:");
            message.react("❎");
          });
        }
    }

    if(message.content.startsWith(config.prefix +"ticket")) {
        const Embeds = new Discord.MessageEmbed()
        .setColor("#EA2027")
        .setDescription("`Vous n'avez pas la permission d'utiliser cette commande`")
        .setTimestamp()
        .setFooter(config.BotName, client.user.avatarURL())

    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(Embeds);

    if(args.length === 1) {
            const embed = new Discord.MessageEmbed()
            .setColor("#EA2027")
            .setDescription("`Veuillez set le channel de ticket !`")
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL())

        if(bdd.ChannelSet === false) return message.channel.send(embed);

            const embeds = new Discord.MessageEmbed()
            .setColor('#d63031')
            .setDescription('`Chargement du système de tickets en cours !`')
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        message.channel.send(embeds)

        setTimeout(() => {
            if(bdd.Status == false) {
                const embed = new Discord.MessageEmbed()
                    .setColor('#f0932b')
                    .setDescription('`Système de tickets chargé, Message en cours D\'envoie !`')
                    .setTimestamp()
                    .setFooter(config.BotName, client.user.avatarURL());
                message.channel.send(embed);

                bdd.Status = bdd.Status = true;
                SaveBdd()

                setTimeout(() => {

                    const hour = new Date().getHours()
                    const min = new Date().getMinutes()
                    
                    const embed = new Discord.MessageEmbed()
                    .setColor('#1e90ff')
                    .setTitle("DarkFly Support")
                    .setDescription('Veuillez réagir '+config.ReactEmoji+' pour ouvrir un tickets.')
                    .setFooter(config.BotName +'| Dernier Actualisation : '+hour+':'+min, client.user.avatarURL());
                    
                    message.member.guild.channels.resolve(bdd.ChannelId).send(embed).then(function (message) {

                        message.react(config.ReactEmoji);
                    });

                    const embede = new Discord.MessageEmbed()
                    .setColor('#1e90ff')
                    .setDescription('`Envoie du Message Avec Succèes !`')
                    .setFooter(config.BotName, client.user.avatarURL());

                    message.channel.send(embede)
                }, 5000);
            } else if(bdd.Status == true){

                const embed = new Discord.MessageEmbed()
                    .setColor('#f0932b')
                    .setDescription('`Voulez vous changer de channel de tickets ?`')
                    .setTimestamp()
                    .setFooter(config.BotName, client.user.avatarURL());
                message.channel.send(embed).then(function (message) {
                    message.react(":white_check_mark:");
                    message.react("❎");

                    message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '728291349711028275' || reaction.emoji.name == '728291366374998057'),
                            { max: 1, time: 30000 }).then(collected => {
                                const members = message.guild.members.cache.get(message.reactions.message.author.id);
                                    if(members.user.bot) return;
                                    if (collected.first().emoji.name == '728291349711028275') {
                                        bdd.Status = bdd.Status = false;
                                        SaveBdd()
                                        
                                        const embed = new Discord.MessageEmbed()
                                        .setColor('#f1c40f')
                                        .setDescription('`Action Validé`')
                                        .setTimestamp()
                                        .setFooter(config.BotName, client.user.avatarURL());
                                    message.channel.send(embed)

                                    return;
                                    }
                                    else {
                                        message.reactions.removeAll()
                                        const embed = new Discord.MessageEmbed()
                                        .setColor('#c0392b')
                                        .setDescription('`Action Annulé`')
                                        .setTimestamp()
                                        .setFooter(config.BotName, client.user.avatarURL());
                                    message.channel.send(embed)
                                    }
                            }).catch((err) => {
                                   message.reactions.removeAll()
                                   const embed = new Discord.MessageEmbed()
                                        .setColor('#c0392b')
                                        .setDescription('`Action Annulé`')
                                        .setTimestamp()
                                        .setFooter(config.BotName, client.user.avatarURL());
                                    message.channel.send(embed)
                                    console.log(err)
                            });
                })
                return;
            }
        }, 10000);
    } else {
        let tickets = args[1]
        const checkChannel = message.mentions.channels.first().id;

        const Embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setDescription('Vous avez mits le channel **' + tickets + "** comme channel De `Ticket` !")
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        message.channel.send(Embed)

        bdd.ChannelId = bdd.ChannelId = checkChannel;
        bdd.ChannelSet = bdd.ChannelSet = true;
        SaveBdd()
    }

    
    }
})

client.on('messageReactionAdd', async (reaction,user) => {
    const members = reaction.message.guild.members.cache.get(user.id);
    
    if(members.user.bot) return;

    if(reaction.message.channel.id === bdd.ChannelId){
        if(reaction.emoji.name === config.ReactEmoji){
            bdd.NumberTicket++;
            SaveBdd()
            if (bdd.NumberTicket >= 10) {
                bdd.NumbersTicket = "00";
            }else if (bdd.NumberTicket >= 100) {
                bdd.NumbersTicket = "0";
            }else if (bdd.NumberTicket >= 1000) {
                bdd.NumberTicket = " "
            }
            SaveBdd()

            reaction.remove().then(function (message) {
                message.message.react(config.ReactEmoji);
              })
              reaction.message.guild.channels.create('ticket-' + bdd.NumbersTicket+bdd.NumberTicket, {
                            type: "text",
                    permissionOverwrites: [
                        {
                            allow: 'VIEW_CHANNEL',
                            deny: 'ADD_REACTIONS',
                            id: user.id
                        },
                        {
                            deny: 'VIEW_CHANNEL',
                            id: reaction.message.guild.id
                        }
                    ]
        }).then(msg => {
            const embed = new Discord.MessageEmbed()
            .setColor('#1abc9c')
            .setDescription(config.TicketDesc)
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
            msg.send("Hey "+user.toString() +", ")
            msg.send(embed).then(function (message) {
                message.react("🔒");
              });

            TicektsId.push(msg.id)
        });
    }
}

if(TicektsId.includes(reaction.message.channel.id)) {
    if(reaction.emoji.name === "🔒"){
        const embed = new Discord.MessageEmbed()
            .setColor('#009432')
            .setDescription('`Voulez vous fermez le ticket ?`')
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        reaction.message.channel.send(embed).then(function (message) {
            message.react("✅");
            message.react("❎");
          });
    } else if(reaction.emoji.id === "✅"){
        reaction.message.reactions.removeAll()
        const embed = new Discord.MessageEmbed()
            .setColor('#009432')
            .setDescription('`Le ticket va ce fermer dans 5 secondes`')
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        reaction.message.channel.send(embed)
        reaction.message.channel.setName("Ticket-Closed")
        setTimeout(() => {
            reaction.message.channel.delete();
        }, 5000);
    } else if(reaction.emoji.id === "❎"){
        reaction.message.reactions.removeAll()
        const embed = new Discord.MessageEmbed()
            .setColor('#c0392b')
            .setDescription('`Action Annulé`')
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
        reaction.message.channel.send(embed)
    }
}
});

async function SaveBdd() {
    fs.writeFile(`./Bdd/Bdd.json`, JSON.stringify(bdd), err => {
        if(err) console.log(err)
        })
}