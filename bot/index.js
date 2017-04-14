import BootBot from 'bootbot';
import replies from './replies';
import User from './user';
import db from '../storage/firebase';
import { createLogger } from 'bunyan';

const log = createLogger({
  name: 'bot',
  stream: process.stdout,
  level: 'info',
});

const bot = new BootBot({
  accessToken: process.env.PAGE_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});

bot.on('error', (err) => {
  log.error(err.message);
});

bot.on('message', (payload) => {
  const ctx = {
    sender: payload.sender.id,
    message: payload.message.text,
  };
  log.child(ctx).info('message');
});

bot.hear([/hi/i, /hello/i], (payload, chat) => {
  chat.say(replies.default);
});

bot.hear([/register/i, /sign[- ]?up/i], (payload, chat) => {
  const psid = payload.sender.id; // Page scoped ID
  chat.getUserProfile().then((user) => {
    db.saveUser(psid, user, () => {
      User.register(chat, (userPatch) => {
        db.updateUser(psid, userPatch);
      });
    });
  });
});

bot.hear([/add [a-z ]* github/i], (payload, chat) => {
  // phrase like 'add me to Github'
  User.addToGithub(chat, (userPatch) => {
    // okay to add redudant psid on the user object
    db.updateUser(userPatch.psid, userPatch);
  });
});

bot.start(process.env.PORT);
