import { spawn } from 'child_process'

export async function runCommand(command: string, args: string[], timeout: number): Promise<{ killed: boolean; code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args)
    const timeoutID = setTimeout(() => {
      childProcess.kill()
    }, timeout)

    let stdout = ''
    let stderr = ''

    childProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    childProcess.on('close', (code: number) => {
      clearTimeout(timeoutID)
      resolve({ stdout, stderr, code, killed: childProcess.killed })
    })

    childProcess.on('error', (err: Error) => {
      clearTimeout(timeoutID)
      reject(err)
    })
  })
}

export async function runAppleScript(script: string): Promise<string> {
  if (process.platform !== 'darwin') {
    throw new Error('macOS only')
  }
  const { stdout, stderr, killed } = await runCommand('osascript', ['-e', script], 1000)
  if (stdout) {
    return stdout
  } else if (stderr) {
    throw new Error(stderr)
  } else if (killed) {
    throw new Error('process was killed')
  }
  return ''
}
