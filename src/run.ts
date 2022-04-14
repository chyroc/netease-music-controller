const { spawn } = require('child_process')

export async function runCommand(command: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const ls = spawn(command, args)

    let stdout = ''
    let stderr = ''

    ls.stdout.on('data', (data: Buffer) => {
      stdout = data.toString()
    })

    ls.stderr.on('data', (data: Buffer) => {
      stderr = data.toString()
    })

    ls.on('close', (code: number) => {
      resolve({ stdout, stderr, code })
    })

    ls.on('error', (err: Error) => {
      reject(err)
    })
  })
}

export async function runAppleScript(script: any) {
  if (process.platform !== 'darwin') {
    throw new Error('macOS only')
  }
  const { stdout, stderr, code } = await runCommand('osascript', ['-e', script])
  if (stdout) {
    return stdout
  }
  throw new Error(stderr)
}
