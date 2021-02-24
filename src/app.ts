import winston from 'winston';

import { configureLogger } from './logger';
import { IMessage, Slack } from './slack';

export class App {
  private readonly slackClient: Slack;
  private readonly channelsMessages: Record<string, string>;

  constructor() {
    configureLogger();

    this.channelsMessages = JSON.parse(process.env.CHANNELS_MESSAGES!);
    this.slackClient = new Slack(process.env.SLACK_BOT_TOKEN!, process.env.SLACK_MEGA_TOKEN!);
  }

  async start() {
    winston.info('[App]: starting...');
    await this.slackClient.connect();

    this.slackClient.messages.subscribe(this.onMessage.bind(this));
  }

  async stop() {
    winston.info('[App]: stopping...');
    await this.slackClient.disconnect();
  }

  async onMessage(message: IMessage) {
    winston.info(`[App]: message %j`, message);

    const channelMessage = this.channelsMessages[message.channel];

    if (!channelMessage) {
      return winston.info('[App]: Ignoring not read-only channels');
    }

    if (this.slackClient.isJoinOrLeave(message)) {
      return winston.info('[App]: Ignoring join/leave message');
    }

    if (this.slackClient.isDeletedMessage(message)) {
      return winston.info('[App]: Ignoring message deleted');
    }

    if (this.slackClient.isThreadedComment(message)) {
      return winston.info('[App]: Ignoring comment on thread');
    }

    if (this.slackClient.isBotMessage(message)) {
      return winston.info('[App]: Ignoring bot message');
    }

    if (this.slackClient.isMessageEdited(message)) {
      return winston.info('[App]: Ignoring message edited');
    }

    if (this.slackClient.isAuthorizedUser(message.user)) {
      return winston.info('[App]: Ignoring authorized user message');
    }

    await this.slackClient.deleteMessage(message.ts, message.channel);
    await this.slackClient.sendMessage(channelMessage, message.user, { name: 'Friendly reminder', emoji: ':pray:' });
  }
}
