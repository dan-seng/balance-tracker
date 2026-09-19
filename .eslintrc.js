module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['website/**'],
      env: {
        browser: true,
      },
      globals: {
        emailjs: 'readonly',
      },
    },
  ],
};
