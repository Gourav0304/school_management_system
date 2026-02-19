module.exports = {
  createSchool: [
    { model: 'name', required: true },
    { model: 'address', required: false },
    { model: 'email', required: false },
    { model: 'phone', required: false },
  ],
  updateSchool: [
    { model: 'name', required: false },
    { model: 'address', required: false },
    { model: 'email', required: false },
    { model: 'phone', required: false },
  ],
};
