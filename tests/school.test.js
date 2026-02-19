const School = require('../managers/entities/school/School.manager');

const mockValidators = {
  school: {
    createSchool: jest.fn().mockResolvedValue(null),
    updateSchool: jest.fn().mockResolvedValue(null),
  },
};

const mockMongomodels = {
  school: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
};

const superAdmin = { role: 'superadmin', userId: 'admin1' };

const buildSchool = () =>
  new School({ config: {}, validators: mockValidators, mongomodels: mockMongomodels });

beforeEach(() => jest.clearAllMocks());

describe('School.createSchool', () => {
  it('should return unauthorized if no superadmin token', async () => {
    const school = buildSchool();
    const result = await school.createSchool({ __superAdmin: null, name: 'Test School' });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should create and return school', async () => {
    mockMongomodels.school.create.mockResolvedValue({
      _id: 'school1',
      name: 'Test School',
      address: '123 St',
      email: 'school@test.com',
      phone: '',
    });

    const school = buildSchool();
    const result = await school.createSchool({
      __superAdmin: superAdmin,
      name: 'Test School',
      address: '123 St',
      email: 'school@test.com',
    });

    expect(result).toHaveProperty('school');
    expect(result.school.name).toBe('Test School');
  });
});

describe('School.listSchools', () => {
  it('should return unauthorized if no superadmin token', async () => {
    const school = buildSchool();
    const result = await school.listSchools({ __superAdmin: null });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should return list of schools', async () => {
    mockMongomodels.school.find.mockResolvedValue([{ name: 'School A' }, { name: 'School B' }]);
    const school = buildSchool();
    const result = await school.listSchools({ __superAdmin: superAdmin });
    expect(result.schools).toHaveLength(2);
  });
});

describe('School.getSchool', () => {
  it('should return error if school not found', async () => {
    mockMongomodels.school.findById.mockResolvedValue(null);
    const school = buildSchool();
    const result = await school.getSchool({ __superAdmin: superAdmin, id: 'badid' });
    expect(result).toEqual({ error: 'school not found' });
  });

  it('should return school if found', async () => {
    mockMongomodels.school.findById.mockResolvedValue({ _id: 'school1', name: 'Test School' });
    const school = buildSchool();
    const result = await school.getSchool({ __superAdmin: superAdmin, id: 'school1' });
    expect(result.school.name).toBe('Test School');
  });
});

describe('School.deleteSchool', () => {
  it('should return unauthorized without superadmin', async () => {
    const school = buildSchool();
    const result = await school.deleteSchool({ __superAdmin: null, id: 'school1' });
    expect(result).toEqual({ error: 'unauthorized' });
  });

  it('should delete school and return message', async () => {
    mockMongomodels.school.findByIdAndDelete.mockResolvedValue({ _id: 'school1' });
    const school = buildSchool();
    const result = await school.deleteSchool({ __superAdmin: superAdmin, id: 'school1' });
    expect(result).toEqual({ message: 'school deleted successfully' });
  });
});
