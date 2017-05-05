const fb = require('./config').firebase;
const User = require('../bot/user');

const timestamp = () => {
  // return current_timestamp
  return Math.round((new Date()).getTime());
};

module.exports = {
  saveUser(psid, user, cb) {
    // psid: page-scored ID
    const userRef = fb.database().ref('/users/' + psid);
    userRef.set(user)
        .then((snapshot) => {
          if (cb) cb(snapshot);
        })
        .catch((err) => {
          console.log('Firebase Error:', err);
        });
  },

  updateUser(psid, user) {
    const userRef = fb.database().ref('/users/' + psid);
    userRef.update(user);
  },

  checkIfUserExists(psid, chat) {
    const userRef = fb.database().ref(`/users/${psid}`);
    userRef.once('value').then((snapshot) => {
      const exists = (snapshot.val() !== null);
      if (!exists) {
        User.askIfToRegister(chat, (user) => {
          this.saveUser(psid, user, () => {
            User.register(chat, (userPatch) => {
              this.updateUser(psid, userPatch);
            });
          });
        });
      } else {
        const user = snapshot.val();
        chat.say(`Welcome ${user.first_name}, you are already registered.`);
      }
    });
  },

  eventRSVP(psid, eventId, chat) {
    const eventRef = fb.database().ref(`/RSVPs/${eventId}/${psid}`);
    const userRef = fb.database().ref(`/users/${psid}`);
    userRef.once('value').then((snapshot) => {
      const user = snapshot.val();
      if (user !== null) {
        eventRef.set(user);
        chat.say(`Thanks, you've been RSVP'd successfully for today's event :)`);
      } else {
        chat.say({
          text: `Please register first.`,
          quickReplies: [
            { content_type: 'text', title: 'Register' },
          ],
        });
      }
    });
  },
};
