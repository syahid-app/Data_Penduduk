const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

async function run() {
  console.log('Initializing git repository in', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });

  console.log('Finding files to add...');
  const globby = (dirPath) => {
    let results = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');

      // Check ignore
      if (
        relPath === '.git' ||
        relPath.startsWith('.git/') ||
        relPath === 'node_modules' ||
        relPath.startsWith('node_modules/') ||
        relPath === '.next' ||
        relPath.startsWith('.next/') ||
        relPath === '.env.local' ||
        relPath === '.env' ||
        relPath === 'package-lock.json' ||
        relPath.startsWith('.vercel')
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        results = results.concat(globby(fullPath));
      } else {
        results.push(relPath);
      }
    }
    return results;
  };

  const files = globby(dir);
  console.log(`Adding ${files.length} files to git index...`);

  for (const filepath of files) {
    await git.add({ fs, dir, filepath });
  }

  console.log('Committing files...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Syahid App',
      email: 'syahid.dev@desa-karanghaur.id',
    },
    message: 'feat: tambah kolom Nama Orang Tua (Ayah & Ibu), Tanggal Perkawinan, dan Golongan Darah',
  });

  console.log('Commit completed. SHA:', sha);

  console.log('Setting remote origin to https://github.com/syahid-app/Data_Penduduk.git...');
  await git.setConfig({
    fs,
    dir,
    path: 'remote.origin.url',
    value: 'https://github.com/syahid-app/Data_Penduduk.git',
  });
  await git.setConfig({
    fs,
    dir,
    path: 'remote.origin.fetch',
    value: '+refs/heads/*:refs/remotes/origin/*',
  });

  console.log('Git repository initialized and committed successfully!');
}

run().catch((err) => {
  console.error('Git init error:', err);
  process.exit(1);
});
