const getHelp = async () => `
  Pongbot curates and records ping-pong games.
  \`\`\`
  Commands:
    register      Register your user with Pongbot
    challenge     Challenge another register user. Creates pending game
    accept        Accept pending game issued by challenger. Creates open game
    won           Winner records result of open game
    leaderboard   Lists users and their records
  \`\`\`
  `;

module.exports = {
  getHelp,
};
