var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class TwitchChat {
    constructor() {
        this.messages = [];
        this.isCollecting = false;
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv/');
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.ws.onopen = () => {
            console.log('Connected to Twitch IRC');
            this.ws.send('PASS blah');
            this.ws.send('NICK justinfan88230');
            this.ws.send('CAP REQ :twitch.tv/commands twitch.tv/tags');
            this.ws.send('JOIN #glowypumpkin');
        };
        this.ws.onmessage = (event) => {
            const data = event.data;
            if (data.includes('PRIVMSG')) {
                const message = data.split('#glowypumpkin :')[1].trim();
                if (this.isCollecting) {
                    this.messages.push(message);
                }
                console.log('Chat message:', message);
            }
        };
        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
        this.ws.onclose = () => {
            console.log('Disconnected from Twitch IRC');
        };
    }
    findNumbersInMessage(message) {
        const match = message.match(/[1-7]/);
        if (!match)
            return [];
        return [parseInt(match[0])];
    }
    getMostFrequentNumber(numbers) {
        if (numbers.length === 0)
            return null;
        const frequency = {};
        let maxFreq = 0;
        let mostFrequent = null;
        for (const num of numbers) {
            frequency[num] = (frequency[num] || 0) + 1;
            if (frequency[num] > maxFreq) {
                maxFreq = frequency[num];
                mostFrequent = num;
            }
        }
        return mostFrequent;
    }
    collectUntilNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                const messages = yield this.collectMessages();
                const allNumbers = [];
                for (const message of messages) {
                    const numbers = this.findNumbersInMessage(message);
                    allNumbers.push(...numbers);
                }
                if (allNumbers.length > 0) {
                    const mostFrequent = this.getMostFrequentNumber(allNumbers);
                    if (mostFrequent !== null) {
                        console.log('Most frequent number found:', mostFrequent);
                        return mostFrequent;
                    }
                }
                console.log('No valid numbers found, collecting more messages...');
            }
        });
    }
    collectMessages() {
        return new Promise((resolve) => {
            this.messages = [];
            this.isCollecting = true;
            setTimeout(() => {
                this.isCollecting = false;
                const collectedMessages = [...this.messages];
                this.messages = [];
                console.log('Collected messages:', collectedMessages);
                resolve(collectedMessages);
            }, 5000);
        });
    }
}
