module.exports = class School {
  constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
    this.config = config;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.httpExposed = [
      'createSchool',
      'get=getSchool',
      'get=listSchools',
      'updateSchool',
      'deleteSchool',
    ];
  }

  async createSchool({ __superAdmin, name, address, email, phone }) {
    if (!__superAdmin) return { error: 'unauthorized' };

    const result = await this.validators.school.createSchool({ name, address, email, phone });
    if (result) return result;

    const school = await this.mongomodels.school.create({ name, address, email, phone });
    return { school };
  }

  async getSchool({ __superAdmin, __schoolAdmin, id }) {
    if (!__superAdmin && !__schoolAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'school id is required' };

    const school = await this.mongomodels.school.findById(id);
    if (!school) return { error: 'school not found' };

    return { school };
  }

  async listSchools({ __superAdmin }) {
    if (!__superAdmin) return { error: 'unauthorized' };

    const schools = await this.mongomodels.school.find({});
    return { schools };
  }

  async updateSchool({ __superAdmin, id, name, address, email, phone }) {
    if (!__superAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'school id is required' };

    const result = await this.validators.school.updateSchool({ name, address, email, phone });
    if (result) return result;

    const school = await this.mongomodels.school.findByIdAndUpdate(
      id,
      { name, address, email, phone },
      { new: true, runValidators: true }
    );
    if (!school) return { error: 'school not found' };

    return { school };
  }

  async deleteSchool({ __superAdmin, id }) {
    if (!__superAdmin) return { error: 'unauthorized' };
    if (!id) return { error: 'school id is required' };

    const school = await this.mongomodels.school.findByIdAndDelete(id);
    if (!school) return { error: 'school not found' };

    return { message: 'school deleted successfully' };
  }
};
