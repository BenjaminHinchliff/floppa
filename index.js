require("dotenv").config();

const Discord = require("discord.js");

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`logged in as ${client.user.tag}`);
});

const floppaStates = new Map();

async function cleanFloppas({ sent }) {
  const cleans = [];
  for (const floppa of sent) {
    async function clean() {
      await (await floppa).delete();
    }
    cleans.push(clean());
  }
  await Promise.all(cleans);
}

client.on("message", async (msg) => {
  if (msg.content === "FLOPPA COP!") {
    if (!floppaStates.has(msg.channel.id)) {
      floppaStates.set(msg.channel.id, {
        type: "cop",
        sent: [],
      });
    }
  } else if (msg.content === "FLOPPA!") {
    if (!floppaStates.has(msg.channel.id)) {
      floppaStates.set(msg.channel.id, {
        type: "normal",
        sent: [],
      });
    }
  } else if (msg.content === "FLOPPA STOP!") {
    const state = floppaStates.get(msg.channel.id);
    floppaStates.delete(msg.channel.id);
    if (state.type !== "cop") {
      await cleanFloppas(state);
    }
  }
});

const floppaLinks = [
  "https://i.redd.it/x4zsmr6d6si61.jpg",
  "https://i.redd.it/bdeprh6cfwj61.jpg",
  "https://i.redd.it/5xy7j4oviik61.jpg",
  "https://i.redd.it/qh0rplzorfo61.jpg",
  "https://i.imgur.com/dfxVLU2.jpg",
  "https://i.redd.it/phbgy9dhwni61.png",
  "https://i.redd.it/dvdcdgnfmaj61.png",
  "https://i.redd.it/2fgb0ueixwo61.jpg",
  "https://i.redd.it/8lo91dtukzi61.jpg",
];

async function sendFloppas() {
  const channelBatches = [];
  for (const [id, { type, sent }] of floppaStates) {
    const channel = await client.channels.fetch(id, true);

    const batch = [];
    for (let i = 0; i < 5; ++i) {
      let foppaPromise;
      if (type === "cop") {
        foppaPromise = channel.send(
          "https://media.discordapp.net/attachments/277305426041896960/834192638303141928/image0.jpg"
        );
      } else {
        foppaPromise = channel.send(
          floppaLinks[Math.floor(Math.random() * floppaLinks.length)]
        );
      }
      batch.push(foppaPromise);
    }
    sent.push(...batch);
    channelBatches.push(Promise.all(batch));
  }
  await Promise.all(channelBatches);
}

async function delay(ms) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await client.login(process.env.TOKEN);
  while (true) {
    await Promise.all([sendFloppas(), delay(1000)]);
  }
}

main();
