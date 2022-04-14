import process from 'process'
import execa from 'execa'

export async function runAppleScript(script: any) {
  if (process.platform !== 'darwin') {
    throw new Error('macOS only')
  }

  const { stdout } = await execa('osascript', ['-e', script])
  return stdout
}

export function runAppleScriptSync(script: any) {
  if (process.platform !== 'darwin') {
    throw new Error('macOS only')
  }

  const { stdout } = execa.sync('osascript', ['-e', script])
  return stdout
}