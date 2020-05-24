const help = require('./help.js');

describe('Help command tests', () => {
  test('get help', async () => {
    const results = await help.getHelp();
    expect(results).toContain('Pongbot curates and records ping-pong games.');
  });
});
