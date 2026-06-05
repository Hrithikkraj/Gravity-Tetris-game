# Gravity Tetris

A modern twist on the classic Tetris game where you can control the direction of gravity! Written in vanilla JavaScript with HTML5 Canvas.

## Features

 **Dynamic Gravity System** - Change gravity direction (up, down, left, right) using WASD controls
 **Classic Tetris Gameplay** - Familiar mechanics with modern enhancements
 **Score Tracking** - Track your current score and high score (saved to local storage)
 **Progressive Difficulty** - Level increases as you clear more lines
 **Cyberpunk Aesthetic** - Sleek glass-morphism UI with retro scanline effects
 **Space Background** - Immersive cosmic visual theme

## How to Play

### Controls
- **Arrow Keys** - Move and rotate pieces
- **Space** - Hard drop (instant drop to bottom)
- **WASD** - Control gravity direction
  - **W** - Gravity up
  - **A** - Gravity left
  - **S** - Gravity down (default)
  - **D** - Gravity right

### Objective
- Clear complete rows to score points
- Prevent pieces from reaching the top of the board
- Beat your high score!

## Game Panels

- **HIGH SCORE** - Your best score across sessions
- **SCORE** - Current game score
- **LEVEL** - Current difficulty level
- **GRAVITY** - Shows active gravity direction
- **NEXT PIECE** - Preview of the next piece


## Project Structure

```
gam/
├── index.html      # Game UI and structure
├── style.css       # Styling and animations
├── script.js       # Game logic and mechanics
├── package.json    # Project metadata
└── README.md       # This file
```

## Technical Details

- **Built with**: HTML5 Canvas, Vanilla JavaScript, CSS3
- **Storage**: Browser localStorage for high score persistence
- **Performance**: Pure JavaScript game loop with configurable tick speed

## Game Mechanics

- 7 different tetromino pieces with unique colors
- Rotation system with gravity-aware mechanics
- Line clearing with score multipliers
- Progressive speed increase as level increases
- High score saved automatically in localStorage

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS Grid & Flexbox
- LocalStorage API

## Future Enhancements

- [ ] Sound effects and background music
- [ ] Difficulty presets (Easy/Normal/Hard)
- [ ] Multiplayer mode
- [ ] Mobile touch controls
- [ ] Achievements/badges system


