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
});
const IGNORE_PREFIX = "!";
const CHANNELS = ['1206594145582448660'];//Replace this id with your channel id
const users = new Set();

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    users.add(message.author.id);

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    },5000);

    let conversation = [];
    conversation.push({
        role:'system',
        content: 'Chat GPT is a friendly Chatbot.'
    });

    let prevMessages=await message.channel.messages.fetch({limit:10});
    prevMessages.reverse();

    prevMessages.forEach((msg)=>{
        if (msg.author.bot && msg.author.id !== client.user.id) return;// I want my bot to read its own messages thats why
        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username=msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if(msg.author.id=== client.user.id){ //ofc its my bot only
            conversation.push({
                role:'assistant',
                name:username,
                content:msg.content,
            });
            return;
        }
        conversation.push({
            role:'user',
            name:username,
            content:msg.content,
        });
    })

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation,
    })
    .catch((error) => console.error("OpenAI error: \n", error));

    clearInterval(sendTypingInterval);

    if (!response){
        message.reply("I'm having some trouble with OpenAI API , ask P4RZ1V4L to look into it.");
        return;
    }

    const responseMessage= response.choices[0].message.content;
    const chunkSizeLimit = 2000;
    for (let i=0;i<responseMessage.length;i+=chunkSizeLimit){
        const chunk = responseMessage.substring(i,i+chunkSizeLimit);
        await message.reply(chunk);
    }




});



client.login(process.env.TOKEN);

