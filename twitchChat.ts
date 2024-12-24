export class TwitchChat {
    private ws: WebSocket;
    private messages: string[] = [];
    private isCollecting: boolean = false;

    constructor() {
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv/');
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.ws.onopen = () => {
            console.log('Connected to Twitch IRC');
            this.ws.send('PASS blah');
            this.ws.send('NICK justinfan88230');
            this.ws.send('CAP REQ :twitch.tv/commands twitch.tv/tags');
            this.ws.send('JOIN #glowypumpkin');
        };

        this.ws.onmessage = (event) => {
            const data = event.data as string;
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

    private findNumbersInMessage(message: string): number[] {
        const match = message.match(/[1-7]/);
        if (!match) return [];
        return [parseInt(match[0])];
    }

    private getMostFrequentNumber(numbers: number[]): number | null {
        if (numbers.length === 0) return null;

        const frequency: { [key: number]: number } = {};
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

    public async collectUntilNumber(): Promise<number> {
        while (true) {
            const messages = await this.collectMessages();
            const allNumbers: number[] = [];
            
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
    }

    private collectMessages(): Promise<string[]> {
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
