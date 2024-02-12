require('dotenv/config');
const{Client, channelLink}=require('discord.js');
const{OpenAI}=require('openai');

const client = new Client({
    intents : ['Guilds','GuildMembers',"GuildMessages",'MessageContent'],
});

client.on('ready',()=>{
    console.log("The BOT is Online.")
});
const openai=new OpenAI({
    apiKey:process.env.OPENAI_KEY,
})
const IGNORE_PREFIX = "!";
const CHANNELS = ['1206594145582448660'];
const users = new Set();

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    users.add(message.author.id);

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Chat GPT is a friendly Chatbot' },
            { role: 'user', content: message.content },
        ],
    }).catch((error) => console.error("OpenAI error: \n", error));

    message.reply(response.choices[0].message.content);
});


client.login(process.env.TOKEN);

