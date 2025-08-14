const pythonSetupRegex = /version\s*=\s*(.*)$/m;

module.exports = {
  commitUrlFormat:
    'https://dndgit.com/sodigital/foregamer/developer-panel/backend/commit/{{hash}}',
  compareUrlFormat:
    'https://dndgit.com/sodigital/foregamer/developer-panel/backend/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat:
    'https://dndgit.com/sodigital/foregamer/developer-panel/backend/issues/{{id}}',
  userUrlFormat: 'https://dndgit.com/{{user}}',
  bumpFiles: [
    {
      filename: 'package.json',
      type: 'json',
    },
    {
      filename: 'pypi-package/setup.py',
      updater: {
        readVersion: function (contents) {
          return contents.match(pythonSetupRegex)[1];
        },
        writeVersion: function (contents, version) {
          return contents.replace(pythonSetupRegex, `version="${version}",`);
        },
      },
    },
  ],
};
