module.exports = class Student {
  constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
    this.config = config;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.httpExposed = [
      'createStudent',
      'get=getStudent',
      'get=listStudents',
      'updateStudent',
      'deleteStudent',
      'transferStudent',
    ];
  }

  async createStudent({ __schoolAdmin, name, email, age, schoolId, classroomId }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };

    if (__schoolAdmin.role === 'school_admin' && __schoolAdmin.schoolId?.toString() !== schoolId) {
      return { error: 'forbidden: you can only manage your own school' };
    }

    const result = await this.validators.student.createStudent({
      name,
      email,
      age,
      schoolId,
      classroomId,
    });
    if (result) return result;

    const student = await this.mongomodels.student.create({
      name,
      email,
      age,
      schoolId,
      classroomId: classroomId || null,
    });
    return { student };
  }

  async getStudent({ __schoolAdmin, id }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'student id is required' };

    const student = await this.mongomodels.student.findById(id);
    if (!student) return { error: 'student not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      student.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    return { student };
  }

  async listStudents({ __schoolAdmin, schoolId }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };

    const query = {};
    if (__schoolAdmin.role === 'school_admin') {
      query.schoolId = __schoolAdmin.schoolId;
    } else if (schoolId) {
      query.schoolId = schoolId;
    }

    const students = await this.mongomodels.student.find(query);
    return { students };
  }

  async updateStudent({ __schoolAdmin, id, name, email, age }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'student id is required' };

    const student = await this.mongomodels.student.findById(id);
    if (!student) return { error: 'student not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      student.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    const result = await this.validators.student.updateStudent({ name, email, age });
    if (result) return result;

    const updated = await this.mongomodels.student.findByIdAndUpdate(
      id,
      { name, email, age },
      { new: true, runValidators: true }
    );

    return { student: updated };
  }

  async deleteStudent({ __schoolAdmin, id }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'student id is required' };

    const student = await this.mongomodels.student.findById(id);
    if (!student) return { error: 'student not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      student.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    await this.mongomodels.student.findByIdAndDelete(id);
    return { message: 'student deleted successfully' };
  }

  async transferStudent({ __schoolAdmin, id, schoolId, classroomId }) {
    if (!__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'student id is required' };

    const student = await this.mongomodels.student.findById(id);
    if (!student) return { error: 'student not found' };

    if (
      __schoolAdmin.role === 'school_admin' &&
      student.schoolId.toString() !== __schoolAdmin.schoolId?.toString()
    ) {
      return { error: 'forbidden' };
    }

    const result = await this.validators.student.transferStudent({ schoolId, classroomId });
    if (result) return result;

    const updated = await this.mongomodels.student.findByIdAndUpdate(
      id,
      { schoolId, classroomId: classroomId || null },
      { new: true }
    );

    return { student: updated };
  }
};
