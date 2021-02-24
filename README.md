<p align="center">
    <img alt="Emoji shush" src="https://em-content.zobj.net/thumbs/120/apple/354/shushing-face_1f92b.png" width="100">
    <img alt="Slack Logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/1200px-Slack_Technologies_Logo.svg.png" width="350">
</p>

# Slack read-only channels [![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://www.typescriptlang.org/) [![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.png?v=103)](https://opensource.org/licenses/GPL-3.0/)
>[slack-read-only-chan](https://github.com/gojob-1337/slack-read-only-chan) is a slackbot who turns Slack channels of your designation into read only channels. This bot is great for things posting team updates to a channel, while ensuring that the posts don't get drowned out by ambient channel noise.

## Disclaimer
Neither I, nor any developer who contributed to this project, accept any kind of liability for your use of this bot.

*This package is not endorsed or affiliated with Slack, or Slack.com*

## Getting Started
Clone the repo: `git clone git@github.com:gojob-1337/slack-read-only-chan.git`

### Requirements
* [Node 10.+](https://nodejs.org)
* [Yarn](https://yarnpkg.com)

### Install & Build
```
yarn
yarn build
```

### Prepare
```
cp .env.example .env
nano .env
```

You'll need to configure these environment variables :
```
SLACK_BOT_TOKEN
SLACK_MEGA_TOKEN
AUTHORIZED_USERS
CHANNELS_MESSAGES
```

where:
- `SLACK_BOT_TOKEN` is the bot's token from your Slack app
- `SLACK_MEGA_TOKEN` is the admin/god token of an admin user in Slack
- `AUTHORIZED_USERS` is the ids of users that can post through the bot to the read only channels (separated by commas)
- `CHANNELS_MESSAGES` are the channel ids (and automatic messages) of channels you want the bot to keep as read-only (json format 😅)

### Run
Dev :
```
yarn start
```

Prod :
```
yarn build
node dist/main.js
```
