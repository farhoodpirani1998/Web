const sanitizeHtml = (html) => html;

sanitizeHtml.simpleTransform = (tagName, attributes) => {
  return (name, attribs) => ({
    name: name || tagName,
    attribs: { ...(attribs || {}), ...(attributes || {}) },
  });
};

module.exports = sanitizeHtml;
module.exports.default = sanitizeHtml;
module.exports.simpleTransform = sanitizeHtml.simpleTransform;
