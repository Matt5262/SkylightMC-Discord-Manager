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