import NeteaseMusicController, { NeteaseMusic, resetLangCache } from '../src'
import { runAppleScript } from '../src/run'

jest.mock('../src/run', () => ({
  runAppleScript: jest.fn()
}))

const runAppleScriptMock = runAppleScript as jest.Mock

function getScript(callIndex = 0): string {
  return runAppleScriptMock.mock.calls[callIndex][0]
}

describe('NeteaseMusicController', () => {
  beforeEach(() => {
    runAppleScriptMock.mockReset()
    runAppleScriptMock.mockImplementation(() => Promise.resolve(''))
  })

  it('generates bilingual scripts for all control commands', async () => {
    await NeteaseMusicController.play()
    await NeteaseMusicController.pause()
    await NeteaseMusicController.nextTrack()
    await NeteaseMusicController.previousTrack()
    await NeteaseMusicController.likeTrack()
    await NeteaseMusicController.dislikeTrack()
    await NeteaseMusicController.turnUpVolume()
    await NeteaseMusicController.turnDownVolume()
    await NeteaseMusicController.toggleLyrics()

    expect(runAppleScriptMock).toHaveBeenCalledTimes(9)

    const playScript = getScript(0)
    expect(playScript).toContain('menu bar item "控制"')
    expect(playScript).toContain('menu bar item "Controls"')
    expect(playScript).toContain('menu item "播放"')
    expect(playScript).toContain('menu item "Play"')
    expect(playScript).not.toContain('Cannot find menu item: 播放 / Play')

    const pauseScript = getScript(1)
    expect(pauseScript).toContain('menu item "暂停"')
    expect(pauseScript).toContain('menu item "Pause"')
    expect(pauseScript).not.toContain('Cannot find menu item: 暂停 / Pause')

    const nextScript = getScript(2)
    expect(nextScript).toContain('menu item "下一个"')
    expect(nextScript).toContain('menu item "Next"')
    expect(nextScript).toContain('Cannot find menu item: 下一个 / Next')

    const previousScript = getScript(3)
    expect(previousScript).toContain('menu item "上一个"')
    expect(previousScript).toContain('menu item "Previous"')

    const likeScript = getScript(4)
    expect(likeScript).toContain('menu item "喜欢歌曲"')
    expect(likeScript).toContain('menu item "Like"')
    expect(likeScript).not.toContain('Cannot find menu item: 喜欢歌曲 / Like')

    const dislikeScript = getScript(5)
    expect(dislikeScript).toContain('menu item "取消喜欢"')
    expect(dislikeScript).toContain('menu item "Dislike"')
    expect(dislikeScript).toContain('menu item "Unlike"')
    expect(dislikeScript).not.toContain('Cannot find menu item: 取消喜欢 / Dislike / Unlike')

    const volumeUpScript = getScript(6)
    expect(volumeUpScript).toContain('menu item "升高音量"')
    expect(volumeUpScript).toContain('menu item "Increase Volume"')

    const volumeDownScript = getScript(7)
    expect(volumeDownScript).toContain('menu item "降低音量"')
    expect(volumeDownScript).toContain('menu item "Decrease Volume"')

    const lyricsScript = getScript(8)
    expect(lyricsScript).toContain('menu item "打开/关闭歌词"')
    expect(lyricsScript).toContain('menu item "Show/Hide Lyrics"')
    expect(lyricsScript).toContain('menu item "Toggle Lyrics"')
  })

  it('returns each play state reported by AppleScript', async () => {
    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('playing\n'))
    await expect(NeteaseMusicController.getPlayState()).resolves.toBe(NeteaseMusic.PlayState.Playing)

    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('paused\n'))
    await expect(NeteaseMusicController.getPlayState()).resolves.toBe(NeteaseMusic.PlayState.Paused)

    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('exit\n'))
    await expect(NeteaseMusicController.getPlayState()).resolves.toBe(NeteaseMusic.PlayState.Exit)

    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('unknown\n'))
    await expect(NeteaseMusicController.getPlayState()).resolves.toBe(NeteaseMusic.PlayState.Unknown)

    const stateScript = getScript(0)
    expect(stateScript).toContain('menu item "暂停"')
    expect(stateScript).toContain('menu item "Pause"')
    expect(stateScript).toContain('menu item "播放"')
    expect(stateScript).toContain('menu item "Play"')
  })

  it('toggles from playing to paused', async () => {
    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('playing')).mockImplementationOnce(() => Promise.resolve(''))

    await NeteaseMusicController.togglePlayPause()

    expect(runAppleScriptMock).toHaveBeenCalledTimes(2)
    expect(getScript(1)).toContain('menu item "Pause"')
  })

  it('toggles from paused or unknown to playing', async () => {
    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('paused')).mockImplementationOnce(() => Promise.resolve(''))

    await NeteaseMusicController.togglePlayPause()
    expect(getScript(1)).toContain('menu item "Play"')

    runAppleScriptMock.mockClear()
    runAppleScriptMock.mockImplementationOnce(() => Promise.resolve('unknown')).mockImplementationOnce(() => Promise.resolve(''))

    await NeteaseMusicController.togglePlayPause()
    expect(getScript(1)).toContain('menu item "Play"')
  })

  it('generates bilingual quit commands', async () => {
    await NeteaseMusicController.exit()

    const script = getScript()
    expect(script).toContain('menu bar item "网易云音乐"')
    expect(script).toContain('menu bar item "NetEaseMusic"')
    expect(script).toContain('menu item "退出 网易云音乐"')
    expect(script).toContain('menu item "Quit NetEaseMusic"')
  })

  it('keeps resetLangCache as a backwards-compatible no-op', () => {
    expect(resetLangCache()).toBeUndefined()
  })

  it('is instantiable', () => {
    expect(new NeteaseMusicController()).toBeInstanceOf(NeteaseMusicController)
  })
})
