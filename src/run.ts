const { spawn } = require('child_process')

export async function runCommand(command: string, args: string[], timeout: number): Promise<{ killed: boolean; code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const ls = spawn(command, args)

    setTimeout(function() {
      ls.kill()
    }, timeout)

    let stdout = ''
    let stderr = ''

    ls.stdout.on('data', (data: Buffer) => {
      stdout = data.toString()
    })

    ls.stderr.on('data', (data: Buffer) => {
      stderr = data.toString()
    })

    ls.on('close', (code: number) => {
      resolve({ stdout, stderr, code, killed: ls.killed })
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
  const { stdout, stderr, killed, code } = await runCommand('osascript', ['-e', script], 1000)
  if (stdout) {
    return stdout
  } else if (stderr) {
    throw new Error(stderr)
  } else if (killed) {
    throw new Error('process was killed')
  }
  return ''
}
