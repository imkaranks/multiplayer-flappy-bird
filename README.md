# Multiplayer Flappy Bird Game

Welcome to the **Multiplayer Flappy Bird Game** repository! This project is a modern, multiplayer implementation of the classic Flappy Bird game, where you control a bird, dodge pipes, and compete with others in real time. The game is built using the following technologies:

- **Frontend**: Vite + TypeScript
- **Backend**: Express + TypeScript + Socket.io
- **Multiplayer Support**: Players can join a game room and compete against each other!

## Features

- **Simple Game Mechanics**: Control a bird that continuously falls. Press the spacebar (or other designated keys) to make the bird flap and rise slightly.
- **Pipes**: Navigate through randomly generated pipes. Colliding with a pipe or the ground ends the game.
- **Score System**: Earn points by successfully passing through a set of pipes. Points are awarded for each successful pipe pass.
- **Multiplayer**: Play with friends in real-time! Join a game room and compete to achieve the highest score.
- **Game End**: The game ends when the bird collides with a pipe or the ground, or when a player exits the room.

## Tech Stack

- **Frontend**:
  - **Vite** – Fast build tool for frontend development.
  - **TypeScript** – Statically typed JavaScript for better maintainability and developer experience.
- **Backend**:
  - **Express** – Web framework for building the game’s backend API.
  - **Socket.io** – Real-time communication between the server and clients for multiplayer functionality.

## Features Summary

- **Multiplayer Rooms**: Players can create or join rooms and compete with others in real-time.
- **Game State Sync**: The game state (bird position, score, etc.) is synchronized between clients using WebSockets.

## Prerequisites

Before running the game locally, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) – Required to run the backend server and frontend build tools.
- [Git](https://git-scm.com/downloads) – To clone the repository.

## Usage

- **Create a Room**: To start a multiplayer game, create a room by entering a unique name.
- **Join a Room**: Share the room ID with friends to let them join your game session.
- **Multiplayer Gameplay**: Compete with others in real-time to see who can score the most points before crashing.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/imkaranks/multiplayer-flappy-bird.git
   cd multiplayer-flappy-bird
   ```

2. Navigate to each folder and install the required npm packages:

   ```bash
   # For the client
   cd client
   npm install

   # For the server
   cd ../server
   npm install
   ```

### Environment Variables

Copy the `.env.template` files in each folder to `.env` and configure them with your specific settings.

```bash
# For example:
cp .env.template .env
```

Make sure to set up your MongoDB URI and any other necessary environment variables.

## Game Controls

- **Spacebar / Enter**: Make the bird flap (rise).

## How to Play

1. Launch the game by running the development servers as described in the installation section.
2. Control the bird by pressing the spacebar to make it flap.
3. Try to avoid hitting the pipes! Each successful pass through a pair of pipes earns you one point.
4. The game ends when the bird hits a pipe or falls to the ground.
5. Play again to try for a higher score!

## Folder Structure

The project consists of three main folders:

- **client**: Vite front-end application.
- **server**: Express backend server.

Each folder contains a `.env.template` file to help you set up environment variables.

## Acknowledgements

- This project is inspired by the classic **Flappy Bird** game originally created by Dong Nguyen.

---

Feel free to modify this README as needed based on your actual game stack and project specifics.
