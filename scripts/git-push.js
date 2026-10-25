const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.log(`
[Petunjuk Push ke GitHub]
Untuk push otomatis ke repository: https://github.com/syahid-app/Data_Penduduk.git

Opsi 1 (Gunakan Token GitHub):
  node scripts/git-push.js <GITHUB_PERSONAL_ACCESS_TOKEN>

Opsi 2 (Jika Git Desktop / VS Code terpasang):
  Buka VS Code Source Control (Ctrl+Shift+G) -> Klik "Publish Branch" / "Push".
  Atau jika git CLI sudah diinstall:
  git push -u origin main --force
  `);
  process.exit(0);
}

async function run() {
  console.log('Pushing main branch to https://github.com/syahid-app/Data_Penduduk.git ...');
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token }),
  });
  console.log('Push successfully completed!', pushResult);
}

run().catch((err) => {
  console.error('Git push failed:', err.message);
  process.exit(1);
});
