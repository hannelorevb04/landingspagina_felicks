module.exports = ({ env }) => ({
  url: env('RENDER_EXTERNAL_URL'), // optioneel voor online URL
  host: '0.0.0.0',
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});

