const Student = require('../managers/entities/student/Student.manager');

const mockValidators = {
  student: {
    createStudent: jest.fn().mockResolvedValue(null),
    updateStudent: jest.fn().mockResolvedValue(null),
    transferStudent: jest.fn().mockResolvedValue(null),
  },
};

const mockMongomodels = {
  student: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
};

const schoolAdmin = { role: 'school_admin', userId: 'admin1', schoolId: 'school1' };

const buildStudent = () =>
  new Student({ config: {}, validators: mockValidators, mongomodels: mockMongomodels });

beforeEach(() => jest.clearAllMocks());

describe('Student.createStudent', () => {
  it('should return unauthorized if no token', async () => {
    const student = buildStudent();
    const result = await student.createStudent({ __schoolAdmin: null, name: 'John' });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should reject creating student for another school', async () => {
    const student = buildStudent();
    const result = await student.createStudent({
      __schoolAdmin: schoolAdmin,
      name: 'John',
      schoolId: 'other-school',
    });
    expect(result).toEqual({ error: 'forbidden: you can only manage your own school' });
  });

  it('should create student successfully', async () => {
    mockMongomodels.student.create.mockResolvedValue({
      _id: 'student1',
      name: 'John Doe',
      schoolId: 'school1',
      classroomId: null,
    });

    const student = buildStudent();
    const result = await student.createStudent({
      __schoolAdmin: schoolAdmin,
      name: 'John Doe',
      email: 'john@test.com',
      schoolId: 'school1',
    });

    expect(result).toHaveProperty('student');
    expect(result.student.name).toBe('John Doe');
  });
});

describe('Student.transferStudent', () => {
  it('should return unauthorized without token', async () => {
    const student = buildStudent();
    const result = await student.transferStudent({
      __schoolAdmin: null,
      id: 'student1',
      schoolId: 'school2',
    });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should prevent transferring a student from another school', async () => {
    mockMongomodels.student.findById.mockResolvedValue({
      _id: 'student1',
      schoolId: { toString: () => 'other-school' },
    });

    const student = buildStudent();
    const result = await student.transferStudent({
      __schoolAdmin: schoolAdmin,
      id: 'student1',
      schoolId: 'school2',
    });
    expect(result).toEqual({ error: 'forbidden' });
  });

  it('should transfer student successfully', async () => {
    mockMongomodels.student.findById.mockResolvedValue({
      _id: 'student1',
      schoolId: { toString: () => 'school1' },
    });
    mockMongomodels.student.findByIdAndUpdate.mockResolvedValue({
      _id: 'student1',
      schoolId: 'school2',
      classroomId: 'class2',
    });

    const student = buildStudent();
    const result = await student.transferStudent({
      __schoolAdmin: schoolAdmin,
      id: 'student1',
      schoolId: 'school2',
      classroomId: 'class2',
    });

    expect(result.student.schoolId).toBe('school2');
  });
});

describe('Student.deleteStudent', () => {
  it('should delete student successfully', async () => {
    mockMongomodels.student.findById.mockResolvedValue({
      _id: 'student1',
      schoolId: { toString: () => 'school1' },
    });
    mockMongomodels.student.findByIdAndDelete.mockResolvedValue({ _id: 'student1' });

    const student = buildStudent();
    const result = await student.deleteStudent({ __schoolAdmin: schoolAdmin, id: 'student1' });
    expect(result).toEqual({ message: 'student deleted successfully' });
  });
});
