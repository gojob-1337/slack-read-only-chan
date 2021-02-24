import './env';

import { addExitHook } from 'exit-hook-plus';

import { App } from './app';

async function start() {
  const app = new App();

  await app.start();

  addExitHook(async () => await app.stop());
}

start();
