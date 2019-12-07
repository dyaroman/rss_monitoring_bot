require('dotenv').config();
const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

const messages = require('./src/data/Messages');
const RssService = require('./RssService');

class Monitoring {
    constructor(db) {
        this.db = db;
        this.timerInterval = 60 * 1000; //1 min
        this.timeToCheck = [7, 0]; // 7:00AM (kiev)

        this.init();
    }

    init() {
        setInterval(() => {
            const now = new Date();

            if (now.getHours() === this.timeToCheck[0] && now.getMinutes() === this.timeToCheck[1]) {
                this.getUsers().then((users) => {
                    users.forEach((user) => {
                        if (user.monitorings.length) {
                            this.runSearch(user);
                        }
                    });
                });
            }
        }, this.timerInterval);
    }

    getUsers() {
        return this.db
            .collection('users')
            .find({})
            .toArray();
    }

    runSearch(user) {
        new RssService(user.monitorings)
            .search()
            .then((queryResults) => this.sendSearchResults(user._id, queryResults));
    }

    // todo
    sendSearchResults(userID, resultsArray) {
        const messagesArray = [];

        resultsArray.forEach((result) => {
            let message = '';

            if (result.results.length) {
                message += messages.searchResultTitle
                    .replace('{{amount}}', result.results.length)
                    .replace('{{query}}', result.query);

                result.results.forEach((item, i) => {
                    if (message.length <= 4096) {
                        message += `${++i}. <a href="${item.link}">${item.title}</a>\n\n`;
                    } else {
                        messagesArray.push(message);
                        message = '';
                    }
                });

                messagesArray.push(message);
            }
        });

        messagesArray.length &&
            messagesArray.forEach((message) => {
                bot.telegram.sendMessage(userID, message, {
                    disable_web_page_preview: true,
                    disable_notification: true,
                    parse_mode: 'html',
                });
            });
    }
}

module.exports = Monitoring;