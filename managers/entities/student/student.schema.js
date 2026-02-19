module.exports = {
  createStudent: [
    { model: 'name', required: true },
    { model: 'email', required: false },
    { model: 'age', required: false },
    { model: 'schoolId', required: true },
    { model: 'classroomId', required: false },
  ],
  updateStudent: [
    { model: 'name', required: false },
    { model: 'email', required: false },
    { model: 'age', required: false },
  ],
  transferStudent: [
    { model: 'schoolId', required: true },
    { model: 'classroomId', required: false },
  ],
};
