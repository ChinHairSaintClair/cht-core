const path = require('path');

module.exports = {
  FORM_STYLESHEET: path.join(__dirname, './openrosa2html5form.xsl'),
  MODEL_STYLESHEET: path.join(__dirname, '../../node_modules/enketo-transformer/src/xsl/openrosa2xmlmodel.xsl')
};