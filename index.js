// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ChannelType, REST, Routes, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.BOT_TOKEN;
const rest = new REST().setToken(token)
const { CreateRepository } = require('./github.js');
client.login(token);

// Listen for interactionCreate events
// client.on(Events.InteractionCreate, async interaction => {
//     if (!interaction.isCommand()) return;

//     const { commandName } = interaction;

//     if (commandName === 'ping') {
//         await pingCommand.execute(interaction);
//     }
// });

client.on('interactionCreate', async (interaction) => {
    const CategoryList = [];
    console.log(`Ready! Logged in as ${client.user.tag}`);
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channels = await guild.channels.fetch();
    const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText);
    const general = textChannels.find(channel => channel.name == "dune_assistant");
    if(!general) {
        return interaction.reply({content: "Vous ne pouvez pas utiliser le bot dans ce channel."})
    }

try {

    if (interaction.commandName === 'create_new_project') {
        let everyoneRole = guild.roles.cache.find(r => r.name === '@everyone');
        let githubUrl;
        if(interaction.options.getString('github_url') != null) {
            githubUrl = interaction.options.getString('github_url');
        } else {
            const createRepositoryFunction = await CreateRepository(interaction.options.getString('project_name'));
            githubUrl = createRepositoryFunction.html_url;
        }
        const colorHexa = "#FFFFFF";
        return guild.roles.create({
            name: `「Projet」 ${interaction.options.getString('project_name')}`,
            color: colorHexa
        }).then(res => {
            guild.channels.create({
                name: `「Projet」 ${interaction.options.get('project_name').value}`,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: everyoneRole.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: res.id,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: guild.roles.cache.find(r => r.name === "DuneBot").id,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            }).then(res => {
                guild.channels.create({
                    name: "〚🗨〛général",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                })
                guild.channels.create({
                    name: "〚🌊〛flux-git",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                }).then((res) => {
                    const channel = client.channels.cache.get(res.id);
                    if(channel) {
                        channel.send(`Voici le lien de l'url github : ${githubUrl}`)
                    }
                })
                guild.channels.create({
                    name: "〚📄〛documents",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                })
                guild.channels.create({
                    name: "〚⛔〛problèmes",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                })
                guild.channels.create({
                    name: "〚⚡〛fonctionnalitées",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                })
                guild.channels.create({
                    name: "「⏱」planning",
                    type: ChannelType.GuildText,
                    parent: res.id,
                    // your permission overwrites or other options here 
                })
            }).then(() => {
                interaction.reply({content: "La catégorie " + interaction.options.get('project_name').value + " a été crée."})
            });
            
        })

    }
} catch(err) {
    throw err;
}
});


async function main() {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channels = await guild.channels.fetch();
    const categories = channels.filter(channel => channel.type === 'GUILD_CATEGORY');
    const commands= [
        {
            name: "create_new_project",
            description: "Créer une catégorie est des salon textuels pour un projet donné.",
            options: [
                {
                    name: "project_name",
                    description: "Nom du projet",
                    type: 3,
                    required: true
                },
                {
                    name: "description",
                    description: "Description du projet github",
                    type: 3,
                    required: true
                },
                {
                    name: "github_url",
                    description: "Rentrez le lien du repository si il existe déjà",
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: "delete_project",
            description: "Supprime la catégorie et le role correspondant.",
            options: [
                {
                    name: "project_name",
                    description: "Nom du projet",
                    type: 3,
                    required: true,
                    choices: categories.map(category => ({
                        name: category.name,
                        value: category.id
                    }))
                }
            ]
        }
    ]

    try {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands
        })
    } catch(err) {

    }
}
main()
