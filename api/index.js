const { requestListener } = require('../server/index');

module.exports = (req, res) => {
  return requestListener(req, res);
};
