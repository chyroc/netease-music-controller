import { EventEmitter } from 'events'
import { spawn } from 'child_process'
import { runAppleScript, runCommand } from '../src/run'

jest.mock('child_process', () => ({
  spawn: jest.fn()
}))

const spawnMock = spawn as jest.Mock

interface MockProcess extends EventEmitter {
  stdout: EventEmitter
  stderr: EventEmitter
  killed: boolean
  kill: jest.Mock
}

function createMockProcess(): MockProcess {
  const childProcess = new EventEmitter() as MockProcess
  childProcess.stdout = new EventEmitter()
  childProcess.stderr = new EventEmitter()
  childProcess.killed = false
  childProcess.kill = jest.fn(() => {
    childProcess.killed = true
  })
  return childProcess
}

function mockCompletedProcess(stdout = '', stderr = '', killed = false, code = 0): MockProcess {
  const childProcess = createMockProcess()
  childProcess.killed = killed
  spawnMock.mockReturnValueOnce(childProcess)

  setTimeout(() => {
    if (stdout) {
      childProcess.stdout.emit('data', Buffer.from(stdout))
    }
    if (stderr) {
      childProcess.stderr.emit('data', Buffer.from(stderr))
    }
    childProcess.emit('close', code)
  }, 0)

  return childProcess
}

describe('runCommand', () => {
  beforeEach(() => {
    spawnMock.mockReset()
  })

  it('returns stdout, stderr, exit code, and killed state', async () => {
    mockCompletedProcess('out', 'err', false, 2)

    await expect(runCommand('command', ['arg'], 1000)).resolves.toEqual({
      stdout: 'out',
      stderr: 'err',
      code: 2,
      killed: false
    })
    expect(spawnMock).toHaveBeenCalledWith('command', ['arg'])
  })

  it('rejects spawn errors', async () => {
    const childProcess = createMockProcess()
    spawnMock.mockReturnValueOnce(childProcess)
    setTimeout(() => childProcess.emit('error', new Error('spawn failed')), 0)

    await expect(runCommand('command', [], 1000)).rejects.toThrow('spawn failed')
  })
})

describe('runAppleScript', () => {
  beforeEach(() => {
    spawnMock.mockReset()
  })

  it('returns AppleScript stdout', async () => {
    mockCompletedProcess('result\n')
    await expect(runAppleScript('return "result"')).resolves.toBe('result\n')
  })

  it('throws AppleScript stderr', async () => {
    mockCompletedProcess('', 'execution error')
    await expect(runAppleScript('bad script')).rejects.toThrow('execution error')
  })

  it('throws when osascript is killed', async () => {
    mockCompletedProcess('', '', true)
    await expect(runAppleScript('slow script')).rejects.toThrow('process was killed')
  })

  it('returns an empty string without output', async () => {
    mockCompletedProcess()
    await expect(runAppleScript('return')).resolves.toBe('')
  })

  it('rejects non-macOS platforms', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'linux' })

    try {
      await expect(runAppleScript('return')).rejects.toThrow('macOS only')
    } finally {
      Object.defineProperty(process, 'platform', { value: originalPlatform })
    }
  })
})
