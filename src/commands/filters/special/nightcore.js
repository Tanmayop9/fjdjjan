import {
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";

import { config } from "#config/config";
import { Command } from "#structures/classes/Command";
import emoji from "#config/emoji";

class NightcoreFilterCommand extends Command {
	constructor() {
		super({
			name: "nightcore",
			description: "Apply nightcore equalizer preset to the music",
			usage: "nightcore",
			aliases: [],
			category: "music",
			examples: ["nightcore"],
			cooldown: 2,
			voiceRequired: true,
			sameVoiceRequired: true,
			playerRequired: true,
			playingRequired: true,
			enabledSlash: true,
			slashData: {
				name: ["filter", "nightcore"],
				description: "Apply nightcore equalizer preset to the music",
			},
		});
	}

	async execute({ message, pm }) {
		return this._handleFilter(message, pm);
	}

	async slashExecute({ interaction, pm }) {
		return this._handleFilter(interaction, pm);
	}

	async _handleFilter(context, pm) {
		try {
			await pm.player.filterManager.setEQ([
   {
      band: 0,
      gain: 0.3
   },
   {
      band: 1,
      gain: 0.4
   },
   {
      band: 2,
      gain: 0.5
   },
   {
      band: 3,
      gain: 0.6
   },
   {
      band: 4,
      gain: 0.7
   },
   {
      band: 5,
      gain: 0.8
   },
   {
      band: 6,
      gain: 0.9
   },
   {
      band: 7,
      gain: 1
   },
   {
      band: 8,
      gain: 0.9
   },
   {
      band: 9,
      gain: 0.8
   },
   {
      band: 10,
      gain: 0.7
   },
   {
      band: 11,
      gain: 0.6
   },
   {
      band: 12,
      gain: 0.5
   },
   {
      band: 13,
      gain: 0.4
   }
]);

			return this._reply(context, this._createSuccessContainer("Nightcore"));
		} catch (error) {
			return this._reply(
				context,
				this._createErrorContainer("Could not apply the nightcore filter."),
			);
		}
	}

	_createSuccessContainer(filterName) {
		const container = new ContainerBuilder();

		const filterEmojis = {
			"Nightcore": "🌙✨",
			"Bassboost": "🔊💥",
			"Vaporwave": "🌴💜",
			"Gaming": "🎮🔥"
		};

		const filterDescriptions = {
			"Nightcore": "High-pitched, fast-paced anime vibes activated!",
			"Bassboost": "Deep bass thumping enhanced for maximum impact!",
			"Vaporwave": "Slowed, reverbed aesthetic soundscape enabled!",
			"Gaming": "Optimized audio for immersive gaming experience!"
		};

		const emoji = filterEmojis[filterName] || "🎛️";
		const description = filterDescriptions[filterName] || "Audio filter has been successfully applied!";

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`${emoji} **${filterName} Filter Applied**`,
			),
		);

		container.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
		);

		const content =
			`**✨ ${description}**\n\n` +
			`🎛️ **Filter Details:**\n` +
			`├─ **Type:** ${filterName} Equalizer\n` +
			`├─ **Status:** ✅ Active\n` +
			`├─ **Effect:** Enhanced audio profile\n` +
			`└─ **Quality:** High-fidelity processing\n\n` +
			`💡 *Tip: Use \`reset\` command to clear all filters*`;

		container.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
				.setThumbnailAccessory(
					new ThumbnailBuilder().setURL(
						config.assets?.defaultThumbnail ||
							config.assets?.defaultTrackArtwork,
					),
				),
		);

		return container;
	}

	_createErrorContainer(message) {
		const container = new ContainerBuilder();

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`${emoji.get("cross")} **Error**`),
		);

		container.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
		);

		const content =
			`**Something went wrong**\n\n` +
			`├─ **${emoji.get("info")} Issue:** ${message}\n` +
			`└─ **${emoji.get("reset")} Action:** Try again or contact support\n\n` +
			`*Please check your input and try again*`;

		container.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
				.setThumbnailAccessory(
					new ThumbnailBuilder().setURL(
						config.assets?.defaultThumbnail ||
							config.assets?.defaultTrackArtwork,
					),
				),
		);

		return container;
	}

	async _reply(context, container) {
		const payload = {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		};
		if (context.reply) {
			return context.reply(payload);
		}
		return context.channel.send(payload);
	}
}

export default new NightcoreFilterCommand();