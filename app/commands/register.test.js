'use strict'

const register = require('./register');

describe('Register command tests', () => {
  test('Register a user', async () => {
    const registeredUser = await register.register('user');
    expect(registeredUser).toContain('registered');
  })
  test('Register an already registerd user', async () => {
    await register.register('user');
    const registeredUser = await register.register('user');
    expect(registeredUser).toContain('already registered');
  })
})
