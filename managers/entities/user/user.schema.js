module.exports = {
  createUser: [
    { model: 'username', required: true },
    { model: 'email', required: true },
    { model: 'password', required: true },
    { model: 'role', required: false },
    { model: 'schoolId', required: false },
  ],
  login: [
    { model: 'email', required: true },
    { model: 'password', required: true },
  ],
};
