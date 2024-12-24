import { TwitchChat } from './twitchChat.js';

const ROWS = 6;
const COLS = 7;

class Connect4Game {
    private board: number[][] = [];
    private currentPlayer: number = 1;
    private gameActive: boolean = true;
    private twitchChat: TwitchChat;

    constructor(twitchChat: TwitchChat) {
        this.twitchChat = twitchChat;
        this.initializeGame();
    }

    private initializeGame() {
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.currentPlayer = 1;
        this.gameActive = true;
        this.renderBoard();
        const statusElement = document.getElementById('status')!;
        statusElement.textContent = "Your turn! Click a column";
    }

    private async startTwitchTurn() {
        if (!this.gameActive) return;
        
        const statusElement = document.getElementById('status')!;
        statusElement.textContent = "Twitch chat's turn! Type a number 1-7";
        
        try {
            const column = await this.twitchChat.collectUntilNumber();
            this.makeMove(column - 1); // Convert 1-7 to 0-6
        } catch (error) {
            console.error('Error getting Twitch move:', error);
        }
    }

    public makeMove(col: number) {
        if (!this.gameActive || col < 0 || col >= COLS) return;

        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;
                
                if (this.checkWin(row, col)) {
                    const winner = this.currentPlayer === 1 ? 'You' : 'Twitch Chat';
                    const statusElement = document.getElementById('status')!;
                    statusElement.textContent = `${winner} win!`;
                    this.gameActive = false;
                } else {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    if (this.currentPlayer === 2) {
                        this.startTwitchTurn();
                    } else {
                        const statusElement = document.getElementById('status')!;
                        statusElement.textContent = "Your turn! Click a column";
                    }
                }
                
                this.renderBoard();
                break;
            }
        }
    }

    private checkWin(row: number, col: number): boolean {
        return this.checkDirection(row, col, 0, 1) || // horizontal
               this.checkDirection(row, col, 1, 0) || // vertical
               this.checkDirection(row, col, 1, 1) || // diagonal down-right
               this.checkDirection(row, col, 1, -1);  // diagonal down-left
    }

    private checkDirection(row: number, col: number, rowDir: number, colDir: number): boolean {
        let count = 0;
        for (let i = -3; i <= 3; i++) {
            const r = row + i * rowDir;
            const c = col + i * colDir;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === this.currentPlayer) {
                count++;
                if (count === 4) return true;
            } else {
                count = 0;
            }
        }
        return false;
    }

    private renderBoard() {
        const boardElement = document.getElementById('board')!;
        boardElement.innerHTML = '';
        
        // Add column labels
        const labelRow = document.createElement('div');
        labelRow.className = 'row label-row';
        for (let col = 0; col < COLS; col++) {
            const label = document.createElement('div');
            label.className = 'column-label';
            label.textContent = (col + 1).toString();
            labelRow.appendChild(label);
        }
        boardElement.appendChild(labelRow);
        
        for (let row = 0; row < ROWS; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            
            for (let col = 0; col < COLS; col++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.dataset.col = col.toString();
                cellElement.style.backgroundColor = 
                    this.board[row][col] === 0 ? 'white' : 
                    this.board[row][col] === 1 ? 'red' : 'yellow';
                
                if (this.currentPlayer === 1 && this.gameActive) {
                    cellElement.addEventListener('click', () => this.makeMove(col));
                }
                
                rowElement.appendChild(cellElement);
            }
            boardElement.appendChild(rowElement);
        }
    }

    public reset() {
        this.initializeGame();
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const twitchChat = new TwitchChat();
    const game = new Connect4Game(twitchChat);

    // Add reset button handler
    document.getElementById('reset')!.addEventListener('click', () => game.reset());
});
