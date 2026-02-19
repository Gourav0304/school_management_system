module.exports = class Classroom {
  constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
    this.config = config;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.httpExposed = [
      'createClassroom',
      'get=getClassroom',
      'get=listClassrooms',
      'updateClassroom',
      'deleteClassroom',
    ];
  }

  async createClassroom({ __schoolAdmin, name, schoolId, capacity }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };

    // School admins can only create classrooms in their own school
    const adminSchoolId = __schoolAdmin.schoolId?.toString();
    if (__schoolAdmin.role === 'school_admin' && adminSchoolId !== schoolId) {
      return { error: 'forbidden: you can only manage your own school' };
    }

    let result = await this.validators.classroom.createClassroom({ name, schoolId, capacity });
    if (result) return result;

    const classroom = await this.mongomodels.classroom.create({ name, schoolId, capacity });
    return { classroom };
  }

  async getClassroom({ __schoolAdmin, id }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'classroom id is required' };

    const classroom = await this.mongomodels.classroom.findById(id);
    if (!classroom) return { error: 'classroom not found' };

    // School admins can only view their school's classrooms
    if (
      __schoolAdmin.role === 'school_admin' &&
      classroom.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    return { classroom };
  }

  async listClassrooms({ __schoolAdmin, schoolId }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };

    const query = {};
    if (__schoolAdmin.role === 'school_admin') {
      query.schoolId = __schoolAdmin.schoolId;
    } else if (schoolId) {
      query.schoolId = schoolId;
    }

    const classrooms = await this.mongomodels.classroom.find(query);
    return { classrooms };
  }

  async updateClassroom({ __schoolAdmin, id, name, capacity }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'classroom id is required' };

    const classroom = await this.mongomodels.classroom.findById(id);
    if (!classroom) return { error: 'classroom not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      classroom.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    let result = await this.validators.classroom.updateClassroom({ name, capacity });
    if (result) return result;

    const updated = await this.mongomodels.classroom.findByIdAndUpdate(
      id,
      { name, capacity },
      { new: true, runValidators: true }
    );

    return { classroom: updated };
  }

  async deleteClassroom({ __schoolAdmin, id }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'classroom id is required' };

    const classroom = await this.mongomodels.classroom.findById(id);
    if (!classroom) return { error: 'classroom not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      classroom.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    await this.mongomodels.classroom.findByIdAndDelete(id);
    return { message: 'classroom deleted successfully' };
  }
};
