const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

module.exports = (phase, { defaultConfig } = {}) => {
  return withNextIntl(defaultConfig || {})
}
