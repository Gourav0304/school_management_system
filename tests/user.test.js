const User = require('../managers/entities/user/User.manager');
const bcrypt = require('bcrypt');

const mockTokenManager = {
  genLongToken: jest.fn().mockReturnValue('mock-long-token'),
};

const mockValidators = {
  user: {
    createUser: jest.fn().mockResolvedValue(null),
    login: jest.fn().mockResolvedValue(null),
  },
};

const mockMongomodels = {
  user: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
};

const buildUser = () =>
  new User({
    config: {},
    cortex: {},
    validators: mockValidators,
    mongomodels: mockMongomodels,
    managers: { token: mockTokenManager },
  });

beforeEach(() => jest.clearAllMocks());

describe('User.createUser', () => {
  it('should return error if email already in use', async () => {
    mockMongomodels.user.findOne.mockResolvedValue({ email: 'test@test.com' });
    const user = buildUser();
    const result = await user.createUser({
      username: 'test',
      email: 'test@test.com',
      password: 'Password1',
    });
    expect(result).toEqual({ error: 'email already in use' });
  });

  it('should create user and return longToken', async () => {
    mockMongomodels.user.findOne.mockResolvedValue(null);
    mockMongomodels.user.create.mockResolvedValue({
      _id: 'abc123',
      username: 'newuser',
      email: 'new@test.com',
      role: 'school_admin',
      schoolId: null,
    });

    const user = buildUser();
    const result = await user.createUser({
      username: 'newuser',
      email: 'new@test.com',
      password: 'Password1',
    });

    expect(result).toHaveProperty('longToken', 'mock-long-token');
    expect(result.user.email).toBe('new@test.com');
  });
});

describe('User.login', () => {
  it('should return error if user not found', async () => {
    mockMongomodels.user.findOne.mockResolvedValue(null);
    const user = buildUser();
    const result = await user.login({ email: 'notfound@test.com', password: 'Password1' });
    expect(result).toEqual({ error: 'invalid credentials' });
  });

  it('should return error if password is wrong', async () => {
    const hashed = await bcrypt.hash('CorrectPass', 10);
    mockMongomodels.user.findOne.mockResolvedValue({
      _id: 'abc123',
      email: 'test@test.com',
      password: hashed,
      role: 'school_admin',
      schoolId: null,
    });

    const user = buildUser();
    const result = await user.login({ email: 'test@test.com', password: 'WrongPass' });
    expect(result).toEqual({ error: 'invalid credentials' });
  });

  it('should return longToken on valid credentials', async () => {
    const hashed = await bcrypt.hash('CorrectPass', 10);
    mockMongomodels.user.findOne.mockResolvedValue({
      _id: 'abc123',
      username: 'testuser',
      email: 'test@test.com',
      password: hashed,
      role: 'school_admin',
      schoolId: null,
    });

    const user = buildUser();
    const result = await user.login({ email: 'test@test.com', password: 'CorrectPass' });
    expect(result).toHaveProperty('longToken', 'mock-long-token');
  });
});
