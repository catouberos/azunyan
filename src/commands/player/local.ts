import {
  type ChatInputCommandInteraction,
  type GuildMember,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { QueryType, useMasterPlayer } from "discord-player";
import fuzzysort from "fuzzysort";
import { glob } from "glob";

import { ACommand } from "../../types/command.js";

export const command: ACommand = {
  data: new SlashCommandBuilder()
    .setName("local")
    .setDescription("Azu-nyan sẽ tìm và thêm một bài từ file trong hệ thống~")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Tên file để tìm~")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // default to defer the reply
    await interaction.deferReply();

    // create embed
    const embed = new EmbedBuilder();

    // assigning channel & check
    const channel = (interaction.member as GuildMember).voice.channelId;
    if (!channel)
      return await interaction.editReply("Azu-nyan không vào voice được >.<");

    // assigning query
    const query = interaction.options.getString("query", true);

    // assigning player & check
    const player = useMasterPlayer();
    if (!player)
      return await interaction.editReply(
        "Nyaaa~ có gì đó xảy ra rồi vì không chơi được TTwTT"
      );

    try {
      const { track } = await player.play(channel, query, {
        searchEngine: QueryType.FILE,
      });

      embed.setAuthor({
        name: interaction.member!.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${
          interaction.member!.user.id
        }/${interaction.member!.user.avatar!}.png`,
      });
      embed.setColor("#B28B84");
      embed.setTitle("Thêm vào danh sách phát");
      embed.setDescription(`\`${track.title}\``);

      return await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      return await interaction.editReply(
        `Có chuyện gì vừa xảy ra TwT... Chi tiết-nya: ${e}`
      );
    }
  },
  async autocomplete(interaction) {
    // assigning player & check
    const player = useMasterPlayer();
    if (!player) return;

    // assigning query
    const query = interaction.options.getString("query", true);

    // getting all files
    const files = await glob("music/**/*.{mp3,wav,aac,flac}");

    // getting results
    const search = fuzzysort.go(query, files);

    const results = search.slice(0, 10).map((result) => ({
      name:
        result.target
          .replace("music/", "")
          .substring(0, result.target.lastIndexOf(".")) || result.target,
      value: result.target,
    }));

    return interaction.respond(results);
  },
};
