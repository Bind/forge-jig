const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  rollup(config) {
    // Delete the external config property.
    // This essentially means we're allowing all packages to be bundled.
    delete config.external;

    // Manually use the commonjs plugin.
    // This is opposed to specifying umd as the format as there's more implications that, again, are unclear.
    config.plugins.push(commonjs());

    return config;
  },
};
