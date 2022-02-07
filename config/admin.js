module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'a1a9b47c56be7689651266beaba60c66'),
  },
});
