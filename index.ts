import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
  TextChannel,
} from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`logged in as ${client.user?.tag}`);
});

interface FloppaState {
  type: string;
  sent: Promise<Message>[];
}
const floppaStates: Map<string, FloppaState> = new Map();

async function cleanFloppas({ sent }: FloppaState) {
  const cleans: Promise<void>[] = [];
  for (const floppa of sent) {
    async function clean() {
      await (await floppa).delete();
    }
    cleans.push(clean());
  }
  await Promise.all(cleans);
}

client.on(Events.MessageCreate, async (msg) => {
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
    if (!state) {
      console.error("Asked to stop in channel where floppa wasn't started?");
      return;
    }
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
  const channelBatches: Promise<Message[]>[] = [];
  for (const [id, { type, sent }] of floppaStates) {
    const channel = client.channels.cache.get(id);
    if (!channel || !(channel instanceof TextChannel)) {
      console.error("Failed to fetch channels for client");
      return;
    }

    const batch: Promise<Message>[] = [];
    for (let i = 0; i < 5; ++i) {
      let foppaPromise: Promise<Message>;
      if (type === "cop") {
        foppaPromise = channel.send(
          "https://media.discordapp.net/attachments/277305426041896960/834192638303141928/image0.jpg",
        );
      } else {
        foppaPromise = channel.send(
          floppaLinks[Math.floor(Math.random() * floppaLinks.length)],
        );
      }
      batch.push(foppaPromise);
    }
    sent.push(...batch);
    channelBatches.push(Promise.all(batch));
  }
  await Promise.all(channelBatches);
}

async function delay(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await client.login(process.env.TOKEN);
  while (true) {
    await Promise.all([sendFloppas(), delay(1000)]);
  }
}

main();
