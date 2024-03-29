// Node's native file system module. fs is used to read the commands directory and identify our command files.
const fs = require('node:fs');

// Node's native path utility module. path helps construct paths to access files and directories. 
// One of the advantages of the path module is that it automatically detects the operating system and uses the appropriate joiners.
const path = require('node:path');

// ! Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// ! Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Commands property to access commands in other files via collection
// extends JavaScript's native Map class, and includes more extensive, useful functionality. 
// ! Collection is used to store and efficiently retrieve commands for execution.
client.commands = new Collection();

// path.join constructs a path to the commands dir
const foldersPath = path.join(__dirname, 'commands');
// fs.readdirSync(foldersPath) reads the path to the dir, returning arr of folder names
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
  // reads path of dir, returns arr of command file names; filter non js out
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// ! Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is
// important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


// ! Event listener for Client#event:interactionCreate
// Listen for the InteractionCreate event on the client
client.on(Events.InteractionCreate, async interaction => {
	// Check if the interaction is a chat input command (slash command)
	if (!interaction.isChatInputCommand()) return;

	// Get the command associated with the interaction's commandName
	const command = interaction.client.commands.get(interaction.commandName);

	// If no matching command is found, log an error and return
	if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
	}

	try {
			// Execute the found command with the interaction
			await command.execute(interaction);
	} catch (error) {
			console.error(error);

			// Check if the interaction has already been replied to or deferred
			if (interaction.replied || interaction.deferred) {
					// If already replied or deferred, follow up with an ephemeral (only visible to the user) error message
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
					// If not replied or deferred, reply with an ephemeral error message
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
	}
});


// Log in to Discord with your client's token
client.login(token);
