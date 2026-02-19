module.exports = {
  createClassroom: [
    { model: 'name', required: true },
    { model: 'schoolId', required: true },
    { model: 'capacity', required: false },
  ],
  updateClassroom: [
    { model: 'name', required: false },
    { model: 'capacity', required: false },
  ],
};
