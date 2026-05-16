require('dotenv').config();
const fs = require('fs');
let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const {
    Client,
    GatewayIntentBits,
    Events,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

client.once(Events.ClientReady, function () {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('SkylightMC', {
        type: 3
    });
});

client.on(Events.InteractionCreate, async function (interaction) {

    // Slash Commands
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'setverifyword') {

            data.verifyWord = interaction.options.getString('word');

            fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

            await interaction.reply({
                content: `Verify word set to: ${data.verifyWord}`,
                ephemeral: true
            });
        }

        if (interaction.commandName === 'setverifyrole') {

            data.verifyRole = interaction.options.getRole('role').id;

            fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

            await interaction.reply({
                content: `Verify role set.`,
                ephemeral: true
            });
        }

        if (interaction.commandName === 'sendverifypanel') {

            const channel = interaction.options.getChannel('channel');

            const button = new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(button);

            const embed = new EmbedBuilder()
                .setTitle('✅ Verify')
                .setDescription('Press the button below to verify. \nYou must find the secret word inside the rules. https://discord.com/channels/1412466896284024945/1470056044213567498');

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({
                content: 'Verification panel sent.',
                ephemeral: true
            });
        }
    }

    // Button click
    if (interaction.isButton()) {

        if (interaction.customId === 'verify_button') {

            const modal = new ModalBuilder()
                .setCustomId('verify_modal')
                .setTitle('Verification');

            const input = new TextInputBuilder()
                .setCustomId('secret_word')
                .setLabel('Enter the secret word found in the rules.')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder()
                .addComponents(input);

            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    }

    // Modal submit
    if (interaction.isModalSubmit()) {

        if (interaction.customId === 'verify_modal') {

            const answer = interaction.fields.getTextInputValue('secret_word');

            if (answer.toLowerCase() === data.verifyWord.toLowerCase()) {

                if (data.verifyRole) {

                    await interaction.member.roles.add(data.verifyRole);

                    await interaction.reply({
                        content: 'You are now verified.',
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content: 'No verify role has been set.',
                        ephemeral: true
                    });
                }

            } else {

                await interaction.reply({
                    content: 'Wrong secret word.',
                    ephemeral: true
                });
            }
        }
    }
});

const commands = [

    new SlashCommandBuilder()
        .setName('setverifyword')
        .setDescription('Set the verification word')
        .addStringOption(function (option) {
            return option
                .setName('word')
                .setDescription('The secret word')
                .setRequired(true);
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('setverifyrole')
        .setDescription('Set the verification role')
        .addRoleOption(function (option) {
            return option
                .setName('role')
                .setDescription('Role to give')
                .setRequired(true);
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('sendverifypanel')
        .setDescription('Send verification panel')
        .addChannelOption(function (option) {
            return option
                .setName('channel')
                .setDescription('Channel to send panel in')
                .setRequired(true);
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

].map(function (command) {
    return command.toJSON();
});

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async function () {

    try {

        console.log('Registering commands...');

        await rest.put(
            Routes.applicationCommands('1504974069626437783'),
            { body: commands }
        );

        console.log('Commands registered.');

    } catch (error) {
        console.error(error);
    }

})();

client.login(process.env.TOKEN);
