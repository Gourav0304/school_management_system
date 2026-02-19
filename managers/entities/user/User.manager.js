const bcrypt = require('bcrypt');

module.exports = class User {
  constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.httpExposed = ['createUser', 'login'];
  }

  async createUser({ username, email, password, role = 'school_admin', schoolId }) {
    // Validation
    let result = await this.validators.user.createUser({ username, email, password, role, schoolId });
    if (result) return result;

    // Check duplicate
    const existing = await this.mongomodels.user.findOne({ email });
    if (existing) return { error: 'email already in use' };

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = await this.mongomodels.user.create({
      username,
      email,
      password: hashedPassword,
      role,
      schoolId: schoolId || null,
    });

    const longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId,
    });

    return {
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
      longToken,
    };
  }

  async login({ email, password }) {
    // Validation
    let result = await this.validators.user.login({ email, password });
    if (result) return result;

    const user = await this.mongomodels.user.findOne({ email });
    if (!user) return { error: 'invalid credentials' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: 'invalid credentials' };

    const longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId,
    });

    return {
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
      longToken,
    };
  }
};
