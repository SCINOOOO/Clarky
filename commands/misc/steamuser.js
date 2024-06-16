import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

const logW = (message) => console.log(chalk.bold.yellow("[steamuser.JS]"), chalk.yellow(message));

const steamApiKey = process.env.STEAM_APIKEY;
const footerText = "Steam user informations provided by 🤖 Clarky";

export default {
  data: new SlashCommandBuilder()
    .setName("steamuser")
    .setDescription("Get information about a Steam user.")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("The Steam username, ID, or profile link")
        .setRequired(true),
    ),
  async execute(interaction) {
    const userInput = interaction.options.getString("user");
    const client = interaction.client;
    try {
      const steamId = await resolveUserInputToSteamID(userInput);
      if (!steamId) {
        throw new Error("User not found");
      }
      const [summaryData, ownedGames, banStatus, steamLevel] =
        await Promise.all([
          fetchSteamUserSummary(steamId),
          fetchOwnedGames(steamId),
          fetchBanStatus(steamId),
          fetchSteamLevel(steamId),
        ]);

      const isProfilePrivate = summaryData.communityvisibilitystate !== 3;

      let status = "Private";
      if (!isProfilePrivate) {
        status = summaryData.personastate === 1 ? "ONLINE" : "OFFLINE";
        if (summaryData.gameextrainfo) {
          status = `PLAYING: ${summaryData.gameextrainfo}`;
        }
      }

      const creationDate = summaryData.timecreated
        ? new Date(summaryData.timecreated * 1000).toLocaleDateString("en-GB")
        : "Private";

      const gamesOwned =
        ownedGames && ownedGames.game_count !== undefined
          ? ownedGames.game_count.toString()
          : "Private";

      const infoEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(summaryData.personaname || "Unknown User")
        .setURL(`https://steamcommunity.com/profiles/${steamId}`)
        .setThumbnail(summaryData.avatarfull)
        .addFields(
          {
            name: "General",
            value: `> Name: \`${summaryData.personaname ? summaryData.personaname : "Private"}\`\n> Status: \`${status}\`\n> Level: \`${steamLevel.player_level !== undefined ? steamLevel.player_level : "Private"}\`\n> Member since: \`${creationDate}\`\n> Games Owned: \`${gamesOwned}\``,
            inline: true,
          },
          {
            name: "Games `Hours` / `Hours past 2 weeks`",
            value: formatGamesSection(ownedGames),
            inline: false,
          },
          {
            name: "IDs",
            value: `> ID3: \`${convertToSteamID3(summaryData.steamid)}\`\n> ID32: \`${convertToSteamID32(summaryData.steamid)}\`\n> ID64: \`${summaryData.steamid}\``,
            inline: false,
          },
          {
            name: "Account Status",
            value: `> \`${banStatus.VACBanned ? "⛔ 1" : "✅ No"} VAC Ban found\`\n> \`${banStatus.NumberOfGameBans > 0 ? "⛔ 1" : "✅ No"} Game Ban found\`\n> \`${banStatus.CommunityBanned ? "⛔ 1" : "✅ No"} Community Ban found\`\n> \`${banStatus.EconomyBan !== "none" ? "⛔ 1" : "✅ No"} Trade Ban found\``,
            inline: false,
          },
        )
        .setFooter({
          text: footerText,
          iconURL: "https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png",
        });        

      await interaction.reply({
        embeds: [infoEmbed],
      });
    } catch (error) {
      let userFriendlyMessage = "Failed to fetch Steam user information.";

      if (error.message === "User not found") {
        userFriendlyMessage =
          "Steam user not found. Please check the input and try again.";
      } else if (error.message.includes("Failed to resolve SteamID")) {
        userFriendlyMessage =
          "Failed to resolve SteamID. Please check the Steam username, ID, or profile link.";
      }
      const errorReply = new EmbedBuilder()
        .setColor("#FF0060")
        .setTitle("Error!")
        .setDescription(userFriendlyMessage)
        .setFooter({
          text: footerText,
          iconURL: "https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png",
        });        

      await interaction.reply({
        embeds: [errorReply],
        ephemeral: true,
      });

      await interaction.reply({
        embeds: [errorReply],
        ephemeral: true,
      });
    }
  },
};

async function resolveUserInputToSteamID(userInput) {
  if (/^\d{17}$/.test(userInput)) return userInput;

  const profileUrlMatch = userInput.match(
    /https?:\/\/steamcommunity\.com\/(id|profiles)\/([^/?#]+)/,
  );
  if (profileUrlMatch) {
    const type = profileUrlMatch[1];
    const value = profileUrlMatch[2];

    if (type === "profiles") {
      if (/^\d{17}$/.test(value)) return value;
    } else if (type === "id") {
      try {
        return await convertVanityUrlToSteamID(value);
      } catch (error) {
        throw new Error("Failed to resolve SteamID from Vanity URL.");
      }
    }
  }

  try {
    return await convertVanityUrlToSteamID(userInput);
  } catch (error) {
    throw new Error(
      "Failed to resolve SteamID. Please check the Steam username, ID, or profile link.",
    );
  }
}

async function convertVanityUrlToSteamID(vanityUrl) {
  const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${vanityUrl}`;
  const response = await axios.get(url);
  if (response.data.response.success === 1) {
    return response.data.response.steamid;
  } else {
    throw new Error("User not found");
  }
}

async function fetchSteamUserSummary(steamId) {
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`;
  try {
    const response = await axios.get(url);
    if (
      response.data.response.players &&
      response.data.response.players.length > 0
    ) {
      return response.data.response.players[0];
    } else {
      logW("User summary not found for given SteamID.");
      throw new Error("User summary not found");
    }
  } catch (error) {
    logW("Failed to fetch user summary.");
    throw error;
  }
}

async function fetchOwnedGames(steamId) {
  const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_appinfo=true`;
  const response = await axios.get(url);
  return response.data.response;
}

async function fetchBanStatus(steamId) {
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamApiKey}&steamids=${steamId}`;
  const response = await axios.get(url);
  return response.data.players[0];
}

function convertToSteamID32(steamID64) {
  return steamID64
    ? `STEAM_0:${BigInt(steamID64) % BigInt(2)}:${(BigInt(steamID64) - BigInt("76561197960265728")) / BigInt(2)}`
    : "Unavailable";
}

function convertToSteamID3(steamID64) {
  const accountID = BigInt(steamID64) - BigInt("76561197960265728");
  return `[U:1:${accountID.toString()}]`;
}

function formatGamesSection(ownedGames) {
  if (!ownedGames || !ownedGames.games || ownedGames.games.length === 0) {
    return "`Private or No Games`";
  }

  const sortedGames = ownedGames.games
    .filter((game) => game.playtime_forever != null)
    .sort((a, b) => b.playtime_forever - a.playtime_forever);

  if (sortedGames.slice(0, 5).every((game) => game.playtime_forever === 0)) {
    return "> `Playtime is private for all games`";
  }

  const formattedGames = sortedGames.slice(0, 5).map((game) => {
    const totalHours = Math.round(game.playtime_forever / 60);
    const hoursPast2Weeks =
      game.playtime_2weeks != null
        ? Math.round(game.playtime_2weeks / 60)
        : "0";

    return `> ${game.name}: \`${totalHours} / ${hoursPast2Weeks} \``;
  });

  if (formattedGames.length === 0) {
    return "`No games played or playtime is private`";
  }

  return formattedGames.join("\n");
}

async function fetchSteamLevel(steamId) {
  const url = `http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${steamApiKey}&steamid=${steamId}`;
  try {
    const response = await axios.get(url);
    if (
      response.data.response &&
      response.data.response.player_level !== undefined
    ) {
      return {
        player_level: response.data.response.player_level,
      };
    } else {
      return {
        player_level: "Private",
      };
    }
  } catch (error) {
    logW(`SOMETHING WENT WRONG WITH AN USERINPUT.`);
    return {
      player_level: "Private",
    };
  }
}
