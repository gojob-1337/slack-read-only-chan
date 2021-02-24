import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import { WebAPICallResult } from '@slack/web-api/dist/WebClient';
import { has, pick } from 'lodash';
import { Subject } from 'rxjs';
import winston from 'winston';

export interface IMessage {
  type: string;
  subtype?: string;
  channel: string;
  user: string;
  text?: string;
  ts: string;
  thread_ts?: string;
}

export class Slack {
  public readonly messages = new Subject<IMessage>();

  private readonly rtm: RTMClient;
  private readonly web: WebClient;

  constructor(botToken: string, adminToken: string) {
    this.web = new WebClient(adminToken);
    this.rtm = new RTMClient(botToken);

    this.rtm.on('message', this.onMessage.bind(this));
    this.rtm.on('connecting', this.onConnecting.bind(this));
    this.rtm.on('connected', this.onConnected.bind(this));
    this.rtm.on('ready', this.onReady.bind(this));
    this.rtm.on('disconnecting', this.onDisconnecting.bind(this));
    this.rtm.on('disconnected', this.onDisconnect.bind(this));
    this.rtm.on('reconnecting', this.onReconnecting.bind(this));
    this.rtm.on('unable_to_rtm_start', this.onErrorStart.bind(this));
    this.rtm.on('error', this.onError.bind(this));
  }

  async getUserName(userId: string): Promise<string | undefined> {
    try {
      return ((await this.web.users.info({ user: userId })) as any)?.user?.real_name;
    } catch {
      winston.info(`[Slack]: can't get user_name`);
    }
  }

  async sendMessage(
    text: string,
    conversationId: string,
    as?: { name: string; emoji: string },
  ): Promise<WebAPICallResult> {
    winston.info(`[Slack]: send message to ${conversationId}: "${text}"`);
    return this.web.chat.postMessage({
      username: as?.name,
      icon_emoji: as?.emoji,
      channel: conversationId,
      text,
    });
  }

  async deleteMessage(ts: string, channel: string): Promise<WebAPICallResult | undefined> {
    winston.info(`[Slack]: delete message ${ts} to ${channel}`);
    try {
      return this.web.chat.delete({ ts, channel });
    } catch {
      winston.info(`[Slack]: can't delete message`);
    }
  }

  async connect() {
    try {
      await this.rtm.start();
    } catch (err) {
      winston.error(`[Slack]: err = ${err}`);
    }
  }

  disconnect() {
    return this.rtm.disconnect();
  }

  isDeletedMessage(message: IMessage) {
    return message.subtype === 'message_deleted';
  }

  isAuthorizedUser(user: string) {
    return process.env.AUTHORIZED_USERS!.split(',').includes(user);
  }

  isThreadedComment(message: IMessage) {
    return has(message, 'thread_ts') || message.subtype === 'message_replied';
  }

  isJoinOrLeave(message: IMessage) {
    return message.subtype && ['channel_join', 'channel_leave'].includes(message.subtype);
  }

  isMessageEdited(message: IMessage) {
    return message.subtype === 'message_changed';
  }

  isBotMessage(message: IMessage) {
    return message.subtype === 'bot_message';
  }

  private onConnecting() {
    winston.info('[Slack]: connecting to slack API...');
  }

  private onConnected() {
    winston.info('[Slack]: connected to slack!');
  }

  private onReady() {
    winston.info('[Slack]: slack is ready!');
  }

  private onDisconnecting() {
    winston.info('[Slack]: disconnecting from slack API...');
  }

  private onDisconnect() {
    winston.info('[Slack]: disconnected from slack!');
  }

  private onReconnecting() {
    winston.info('[Slack]: reconnecting to slack API...');
  }

  private onErrorStart(error: Error) {
    winston.error(JSON.stringify(error, null, 2));
  }

  private onError(error: Error) {
    winston.error(JSON.stringify(error, null, 2));
  }

  private async onMessage(message: IMessage) {
    winston.info(`[Slack]: message %j`, message);
    if (message.text) {
      const userName = await this.getUserName(message.user);
      winston.info(`[Slack]: ${userName} (${message.user}) send message: "${message.text}"`);
      this.messages.next(pick(message, ['type', 'subtype', 'channel', 'user', 'text', 'ts', 'thread_ts']));
    }
  }
}
