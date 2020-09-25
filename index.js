const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const fs = require("fs");

const config = require('./Config.json');
const bdd = require('./Bdd/Bdd.json');

const TicektsId = new Array();

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag} !`);
});

client.on("message", async (message) => {

    let args = message.content.trim().split(/ +/g)

    if(message.content.startsWith(config.prefix +"close")) {
        if(TicektsId.includes(message.channel.id)) {
            CloseTicket(message)
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
                    .setColor(config.PanelColor)
                    .setTitle(config.PanelName)
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

                ChangeTicket(message);
                
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
                bdd.NumbersTicket = "00"
            }else if (bdd.NumberTicket >= 100) {
                bdd.NumbersTicket = "0"
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
                        },
                        {
                            allow: 'VIEW_CHANNEL',
                            deny: 'ADD_REACTIONS',
                            id: config.StaffID
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
        reaction.message.react('✅')
        const chooseArr = ["✅","❎"]
       
        const reacted = await AwaitReact(reaction.message,user,10,chooseArr)
        const result = await getResult(reacted);


        if (reacted == "✅") {
            reaction.message.channel.send(result)
        }

                function getResult(me) {
                    if (me === "✅") {
                        const embed = new Discord.MessageEmbed()
                        .setColor('#009432')
                        .setDescription('`Le ticket va ce fermer dans 5 secondes`')
                        .setTimestamp()
                        .setFooter(config.BotName, client.user.avatarURL());
                        reaction.message.reactions.removeAll()
                        reaction.message.channel.setName("Ticket-Closed")
                        setTimeout(() => {
                            reaction.message.channel.delete();
                        }, 5000);
                        return embed
                    } else if(me === "❎") {
                        reaction.message.reactions.removeAll()
                        reaction.message.react('🔒')
                    }
                }
            }
}
});

async function SaveBdd() {
    fs.writeFile(`./Bdd/Bdd.json`, JSON.stringify(bdd), err => {
        if(err) console.log(err)
        })
}


async function AwaitReact(message, author, time, validReactions) {
    time *= 1000;
    for (const reaction of validReactions) await message.react(reaction);
    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;
    return message
        .awaitReactions(filter, { max: 1, time: time})
        .then(collected => collected.first() && collected.first().emoji.name);
}

async function CloseTicket(message) {
    const chooseArr = ["✅","❎"]
        const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('`Voulez vous fermez le ticket ?`')
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
            const m = await message.channel.send(embed);
            const reacted = await AwaitReact(m,message.author,10,chooseArr);
            const result = await getResult(reacted);

            message.channel.send(result)
            m.reactions.removeAll()
                
                function getResult(me) {
                    if(me === "❎") {
                        const embed = new Discord.MessageEmbed()
                            .setColor('#c0392b')
                            .setDescription('`Action Annulé`')
                            .setTimestamp()
                            .setFooter(config.BotName, client.user.avatarURL());
                        return embed
                    }else if (me === "✅") {
                        const embed = new Discord.MessageEmbed()
                        .setColor('#009432')
                        .setDescription('`Le ticket va ce fermer dans 5 secondes`')
                        .setTimestamp()
                        .setFooter(config.BotName, client.user.avatarURL());
                        message.channel.setName("Ticket-Closed")
                        setTimeout(() => {
                            message.channel.delete();
                        }, 5000);
                        return embed
                    }
                }
}

async function ChangeTicket(message) {
    const chooseArr = ["✅","❎"]
    const embed = new Discord.MessageEmbed()
                    .setColor('#f0932b')
                    .setDescription('`Voulez vous changer de channel de tickets ?`')
                    .setTimestamp()
                    .setFooter(config.BotName, client.user.avatarURL());
                const m = await message.channel.send(embed);
                const reacted = await AwaitReact(m,message.author,10,chooseArr);
                const result = await getResult(reacted);

                message.channel.send(result)
                m.reactions.removeAll()
                
                function getResult(me) {
                    if(me === "❎") {
                        const embed = new Discord.MessageEmbed()
                            .setColor('#c0392b')
                            .setDescription('`Action Annulé`')
                            .setTimestamp()
                            .setFooter(config.BotName, client.user.avatarURL());
                        return embed
                    }else if (me === "✅") {
                        const embed = new Discord.MessageEmbed()
                            .setColor('#2ecc71')
                            .setDescription('`Action validé, veuillez re set le channel`')
                            .setTimestamp()
                            .setFooter(config.BotName, client.user.avatarURL());
                            bdd.ChannelSet = false
                            bdd.Status = false
                            SaveBdd()
                        return embed
                    }
                }
}