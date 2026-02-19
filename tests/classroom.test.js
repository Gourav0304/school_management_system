const Classroom = require('../managers/entities/classroom/Classroom.manager');

const mockValidators = {
  classroom: {
    createClassroom: jest.fn().mockResolvedValue(null),
    updateClassroom: jest.fn().mockResolvedValue(null),
  },
};

const mockMongomodels = {
  classroom: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
};

const schoolAdmin = { role: 'school_admin', userId: 'admin1', schoolId: 'school1' };
const superAdmin = { role: 'superadmin', userId: 'admin2', schoolId: null };

const buildClassroom = () =>
  new Classroom({ config: {}, validators: mockValidators, mongomodels: mockMongomodels });

beforeEach(() => jest.clearAllMocks());

describe('Classroom.createClassroom', () => {
  it('should return unauthorized if no token', async () => {
    const classroom = buildClassroom();
    const result = await classroom.createClassroom({ __schoolAdmin: null, name: 'Room A' });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should reject school_admin creating classroom for another school', async () => {
    const classroom = buildClassroom();
    const result = await classroom.createClassroom({
      __schoolAdmin: schoolAdmin,
      name: 'Room A',
      schoolId: 'other-school',
    });
    expect(result).toEqual({ error: 'forbidden: you can only manage your own school' });
  });

  it('should create classroom for own school', async () => {
    mockMongomodels.classroom.create.mockResolvedValue({
      _id: 'class1',
      name: 'Room A',
      schoolId: 'school1',
      capacity: 30,
    });

    const classroom = buildClassroom();
    const result = await classroom.createClassroom({
      __schoolAdmin: schoolAdmin,
      name: 'Room A',
      schoolId: 'school1',
      capacity: 30,
    });

    expect(result).toHaveProperty('classroom');
    expect(result.classroom.name).toBe('Room A');
  });
});

describe('Classroom.deleteClassroom', () => {
  it('should return unauthorized without token', async () => {
    const classroom = buildClassroom();
    const result = await classroom.deleteClassroom({ __schoolAdmin: null, id: 'class1' });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should prevent school_admin from deleting another school classroom', async () => {
    mockMongomodels.classroom.findById.mockResolvedValue({
      _id: 'class1',
      schoolId: { toString: () => 'other-school' },
    });

    const classroom = buildClassroom();
    const result = await classroom.deleteClassroom({ __schoolAdmin: schoolAdmin, id: 'class1' });
    expect(result).toEqual({ error: 'forbidden' });
  });

  it('should delete classroom successfully', async () => {
    mockMongomodels.classroom.findById.mockResolvedValue({
      _id: 'class1',
      schoolId: { toString: () => 'school1' },
    });
    mockMongomodels.classroom.findByIdAndDelete.mockResolvedValue({ _id: 'class1' });

    const classroom = buildClassroom();
    const result = await classroom.deleteClassroom({ __schoolAdmin: schoolAdmin, id: 'class1' });
    expect(result).toEqual({ message: 'classroom deleted successfully' });
  });
});
