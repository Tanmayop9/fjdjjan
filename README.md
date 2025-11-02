# 🤖 fjdjjan - Discord Bot

A cool Discord bot with slash commands, user info grabbing, and **global user installation support**! This bot can be used in servers AND installed by individual users for personal use anywhere on Discord.

## ✨ Features

- 🔍 **User Info Grabbing** - Get detailed information about any Discord user (for fun!)
- 🖼️ **Avatar Display** - View and download user avatars in high quality
- 🏰 **Server Info** - Get comprehensive server statistics and information
- 🤖 **Bot Info** - View bot statistics, uptime, and performance metrics
- 🏓 **Ping Command** - Check bot latency and API response times
- 🔮 **8-Ball** - Ask the magic 8-ball any question
- 🪙 **Coin Flip** - Flip a virtual coin
- 🎲 **Dice Roll** - Roll dice with customizable sides (2-100)

## 🌐 User Installation Support

This bot supports **user installation**, which means:
- Users can install the bot directly to their account
- Use bot commands in any server or DM, even without the bot being in the server
- Commands work globally across Discord
- Perfect for personal use!

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16.9.0 or higher
- A Discord Bot Token
- Discord Application Client ID

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tanmayop9/fjdjjan.git
   cd fjdjjan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Discord bot credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

4. **Deploy slash commands:**
   ```bash
   npm run deploy
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

## 🔧 Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Copy" to get your bot token
5. Copy the Application ID from the "General Information" tab
6. Go to the "Installation" tab:
   - Enable **User Install**
   - Set Install Link to "Discord Provided Link"
   - Under "Default Install Settings":
     - For **Guild Install**: Add `applications.commands` scope
     - For **User Install**: Add `applications.commands` scope
7. Under "Bot" tab, enable necessary intents:
   - Presence Intent (optional)
   - Server Members Intent (optional)
   - Message Content Intent (optional)

## 📝 Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/userinfo [user]` | Grab user information | `/userinfo @user` or `/userinfo` |
| `/avatar [user]` | Get user's avatar | `/avatar @user` or `/avatar` |
| `/serverinfo` | Get server information | `/serverinfo` |
| `/botinfo` | Get bot statistics | `/botinfo` |
| `/ping` | Check bot latency | `/ping` |
| `/8ball <question>` | Ask the magic 8-ball | `/8ball Will I win?` |
| `/coinflip` | Flip a coin | `/coinflip` |
| `/roll [sides]` | Roll a dice | `/roll 20` |

## 🎮 Bot Invite Links

### Server Installation (Traditional)
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=0&scope=bot%20applications.commands
```

### User Installation (New!)
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual bot's client ID.

## 📁 Project Structure

```
fjdjjan/
├── commands/           # Slash command files
│   ├── userinfo.js    # User information command
│   ├── avatar.js      # Avatar display command
│   ├── serverinfo.js  # Server information command
│   ├── botinfo.js     # Bot statistics command
│   ├── ping.js        # Latency check command
│   ├── 8ball.js       # Magic 8-ball command
│   ├── coinflip.js    # Coin flip command
│   └── roll.js        # Dice roll command
├── index.js           # Main bot file
├── deploy-commands.js # Command deployment script
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🔐 Security Notes

- Never share your `.env` file or bot token
- The `.gitignore` file is configured to exclude sensitive files
- Regenerate your bot token if it's ever exposed

## 📜 License

ISC

## 🤝 Contributing

Feel free to fork this project and submit pull requests with improvements!

## 💡 Tips

- Use the bot in DMs by installing it to your user account
- All commands work in both servers and DMs (except server-specific ones)
- The bot supports both traditional guild installs and new user installs
- User info command is great for checking account creation dates and other fun facts!

---

Made with ❤️ using Discord.js v14
