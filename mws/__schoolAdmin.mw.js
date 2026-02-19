module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    if (!req.headers.token) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
    }

    let decoded = null;
    try {
      decoded = managers.token.verifyShortToken({ token: req.headers.token });
      if (!decoded) {
        return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
      }
    } catch (err) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
    }

    if (!['school_admin', 'superadmin'].includes(decoded.role)) {
      return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: 'forbidden: school admin access required' });
    }

    next(decoded);
  };
};
