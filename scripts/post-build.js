const fs = require('fs');
const path = require('path');

// Assuming the script is in halo-viz/scripts
const projectRoot = path.resolve(__dirname, '..');
const parentDir = path.resolve(projectRoot, '..');

const sourceDir = path.join(projectRoot, 'target');
const destinationDir = path.join(parentDir, 'cloud', 'docker', 'kibana');
const binSourceDir = path.join(projectRoot, 'build', 'kibana-docker', 'default', 'bin');

const filesToMove = [
  'kibana-8.14.4-SNAPSHOT-linux-aarch64.tar.gz',
  'kibana-8.14.4-SNAPSHOT-linux-aarch64.tar.gz.sha512.txt',
  'kibana-8.14.4-SNAPSHOT-linux-x86_64.tar.gz',
  'kibana-8.14.4-SNAPSHOT-linux-x86_64.tar.gz.sha512.txt'
];

function moveFile(source, destination) {
  fs.renameSync(source, destination);
  console.log(`Moved ${source} to ${destination}`);
}

function moveFiles() {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  // Move individual files
  filesToMove.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destinationDir, file);
    if (fs.existsSync(sourcePath)) {
      moveFile(sourcePath, destPath);
    } else {
      console.log(`File not found: ${sourcePath}`);
    }
  });

  // Move bin folder
  const binDestPath = path.join(destinationDir, 'bin');
  if (fs.existsSync(binSourceDir)) {
    if (fs.existsSync(binDestPath)) {
      fs.rmdirSync(binDestPath, { recursive: true });
    }
    fs.renameSync(binSourceDir, binDestPath);
    console.log(`Moved ${binSourceDir} to ${binDestPath}`);
  } else {
    console.log(`Bin folder not found: ${binSourceDir}`);
  }
}

moveFiles();
