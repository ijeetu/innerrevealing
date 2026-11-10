const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'inner-revealing-backend-tests-'));
try {
  for (const name of ['passwords', 'errors', 'request']) {
    const filename = path.join(process.cwd(), 'src', 'server', `${name}.ts`);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      fileName: filename,
    });
    fs.writeFileSync(path.join(directory, `${name}.js`), compiled.outputText);
  }
  const result = spawnSync(process.execPath, ['--test', 'src/server/__tests__/backend.test.cjs'], {
    stdio: 'inherit', env: { ...process.env, IR_BACKEND_COMPILED: directory },
  });
  process.exitCode = result.status === null ? 1 : result.status;
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
