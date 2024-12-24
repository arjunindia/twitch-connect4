var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TwitchChat } from './twitchChat.js';
const ROWS = 6;
const COLS = 7;
class Connect4Game {
    constructor(twitchChat) {
        this.board = [];
        this.currentPlayer = 1;
        this.gameActive = true;
        this.twitchChat = twitchChat;
        this.initializeGame();
    }
    initializeGame() {
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.currentPlayer = 1;
        this.gameActive = true;
        this.renderBoard();
        const statusElement = document.getElementById('status');
        statusElement.textContent = "Your turn! Click a column";
    }
    startTwitchTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.gameActive)
                return;
            const statusElement = document.getElementById('status');
            statusElement.textContent = "Glowy's chat's turn! Type a number 1-7";
            try {
                const column = yield this.twitchChat.collectUntilNumber();
                this.makeMove(column - 1); // Convert 1-7 to 0-6
            }
            catch (error) {
                console.error('Error getting Twitch move:', error);
            }
        });
    }
    makeMove(col) {
        if (!this.gameActive || col < 0 || col >= COLS)
            return;
        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;
                if (this.checkWin(row, col)) {
                    const winner = this.currentPlayer === 1 ? 'You' : 'Twitch Chat';
                    const statusElement = document.getElementById('status');
                    statusElement.textContent = `${winner} win!`;
                    this.gameActive = false;
                }
                else {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    if (this.currentPlayer === 2) {
                        this.startTwitchTurn();
                    }
                    else {
                        const statusElement = document.getElementById('status');
                        statusElement.textContent = "Your turn! Click a column";
                    }
                }
                this.renderBoard();
                break;
            }
        }
    }
    checkWin(row, col) {
        return this.checkDirection(row, col, 0, 1) || // horizontal
            this.checkDirection(row, col, 1, 0) || // vertical
            this.checkDirection(row, col, 1, 1) || // diagonal down-right
            this.checkDirection(row, col, 1, -1); // diagonal down-left
    }
    checkDirection(row, col, rowDir, colDir) {
        let count = 0;
        for (let i = -3; i <= 3; i++) {
            const r = row + i * rowDir;
            const c = col + i * colDir;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === this.currentPlayer) {
                count++;
                if (count === 4)
                    return true;
            }
            else {
                count = 0;
            }
        }
        return false;
    }
    renderBoard() {
        const boardElement = document.getElementById('board');
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
    reset() {
        this.initializeGame();
    }
}
// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const twitchChat = new TwitchChat();
    const game = new Connect4Game(twitchChat);
    // Add reset button handler
    document.getElementById('reset').addEventListener('click', () => game.reset());
});
