// File: src/game.ts

const wordList: { [key: number]: string[] } = {
  4: ["test", "play", "game", "code"],
  5: ["react", "frame", "chart", "block"],
  6: ["design", "player", "script", "python"],
  // ... more words for each length
};

class RapidWordleGame {
  private currentWord: string = ""; // The current word to guess
  private timeLimit: number;
  private timerId: number | null = null;
  private score: number = 0;
  private wordLength: number = 4; // Start with four-letter words
  private guesses: string[] = [];

  constructor(timeLimit: number = 60) {
    this.timeLimit = timeLimit;
  }

  startGame(): void {
    this.resetGame();
    this.createGrid();
    this.loadNewWord();
    this.timerId = window.setInterval(() => this.updateTimer(), 1000);
    this.updateTimerDisplay();
    this.updateScoreDisplay();
  }

  private resetGame(): void {
    this.score = 0;
    this.wordLength = 4;
    this.guesses = [];
    this.timeLimit = 60; // Reset time limit
    this.updateTimerDisplay();
    this.updateScoreDisplay();
    // More UI reset logic can be added here
  }

  private updateTimer(): void {
    if (this.timeLimit > 0) {
      this.timeLimit--;
      this.updateTimerDisplay();
    } else {
      this.endGame();
    }
  }

  private updateTimerDisplay(): void {
    const timeElement = document.getElementById('time') as HTMLSpanElement;
    if (timeElement) {
      timeElement.textContent = this.timeLimit.toString();
    }
  }

  private updateScoreDisplay(): void {
    const scoreElement = document.getElementById('scoreValue') as HTMLSpanElement;
    if (scoreElement) {
      scoreElement.textContent = this.score.toString();
    }
  }

  private loadNewWord(): void {
    // Fetch a new word of the current word length from the word list
    const wordsOfCurrentLength = wordList[this.wordLength];
    if (!wordsOfCurrentLength) {
      // Handle the case where there are no words of the desired length
      console.error("No words found for the current length:", this.wordLength);
      this.endGame(); // End the game or handle it appropriately
      return;
    }

    // Randomly select a new word from the list
    const randomIndex = Math.floor(Math.random() * wordsOfCurrentLength.length);
    this.currentWord = wordsOfCurrentLength[randomIndex];
    console.log("Debug - Current Word:", this.currentWord);  // Log the current word for debugging

    // You might want to remove the selected word from the array to prevent repeats
    wordsOfCurrentLength.splice(randomIndex, 1);
  }

  submitGuess(guess: string): void {
    const normalizedGuess = guess.toLowerCase(); // Convert guess to lowercase
  
    if (normalizedGuess.length !== this.wordLength) {
      this.displayFeedback("Incorrect word length.");
      return;
    }
  
    this.guesses.push(normalizedGuess);
    if (normalizedGuess === this.currentWord) {
      this.score++;
      this.displayFeedback("Correct!");
      if (this.score % 2 === 0) {
        this.wordLength++;
      }
      this.loadNewWord();
    } else {
      this.displayFeedback("Try again.");
    }
    this.updateScoreDisplay();

    const rowIndex = this.guesses.length; // Get the current index before pushing new guess
    this.updateGrid(guess, rowIndex); // Pass rowIndex to updateGrid
  
    this.guesses.push(normalizedGuess); // Then update the guesses array
  
  }
  

  private displayFeedback(message: string): void {
    const feedbackElement = document.getElementById('feedback') as HTMLDivElement;
    if (feedbackElement) {
      feedbackElement.textContent = message;
    }
  }

  private endGame(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
    this.timerId = null;
    this.displayFeedback("Game over! Your score: " + this.score);
    // Any additional game over logic can be added here
  }

  private createGrid(): void {
    const grid = document.getElementById('word-grid') as HTMLDivElement;
    grid.innerHTML = ''; // Clear existing grid if any

    for (let i = 0; i < 6; i++) { // Assuming 6 guesses
        const row = document.createElement('div');
        row.className = 'word-row';

        for (let j = 0; j < this.wordLength; j++) { // Based on the word length
            const cell = document.createElement('div');
            cell.className = 'word-cell';
            row.appendChild(cell);
        }

        grid.appendChild(row);
    }
  }

  private getLetterFeedback(letter: string, index: number): string {
    if (this.currentWord[index] === letter) {
      // The letter is in the correct position
      return 'correct';
    } else if (this.currentWord.includes(letter)) {
      // The letter is in the word but in the wrong position
      return 'present';
    } else {
      // The letter is not in the word
      return 'absent';
    }
  }

  private updateGrid(guess: string, rowIndex: number): void {
    const rows = document.querySelectorAll('.word-row');

    
    const currentRow = rows[this.guesses.length - 1] as HTMLDivElement; // Get the current row
    if (rowIndex < rows.length) {
      const currentRow = rows[rowIndex] as HTMLDivElement;
      // Update the cells in the current row
      guess.split('').forEach((letter, index) => {
      const cell = currentRow.children[index] as HTMLDivElement;
      cell.textContent = letter;
      // TODO: Apply color coding based on feedback
      // cell.style.backgroundColor = '...';
      const feedback = this.getLetterFeedback(letter, index); 

      switch(feedback) {
          case 'correct':
              cell.style.backgroundColor = 'green';
              break;
          case 'present':
              cell.style.backgroundColor = 'yellow';
              break;
          case 'absent':
              cell.style.backgroundColor = 'grey';
                  break;
          }
      });
  }
  else {
    console.error("Row index out of bounds:", rowIndex);
  }
}

}

// This will handle the binding when the DOM is fully loaded
window.onload = () => {
  const game = new RapidWordleGame();
  game.startGame();

  const guessButton = document.getElementById('guessButton');
  guessButton?.addEventListener('click', () => {
    const guessInput = document.getElementById('guessInput') as HTMLInputElement;
    if (guessInput) {
      game.submitGuess(guessInput.value.toUpperCase());
      guessInput.value = ""; // Clear the input field
    }
  });

  // Optional: Submit guess on "Enter" key
  const guessInput = document.getElementById('guessInput') as HTMLInputElement;
  guessInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      guessButton?.click();
    }
  });
};

export { RapidWordleGame };
