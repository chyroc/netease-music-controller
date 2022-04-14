import { runAppleScript } from './run'

export namespace NeteaseMusic {
  export enum PlayState {
    Playing = 'playing',
    Paused = 'paused',
    Exit = 'exit',
    Unknown = 'unknown'
  }
}

export default class NeteaseMusicController {
  /*
   * play: 播放
   * */
  public static async play(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.play), [`不能获得“menu item "播放"`])
  }

  /*
   * pause: 暂停
   * */
  public static async pause(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.pause), [`不能获得“menu item "暂停"`])
  }

  /*
   * getPlayState: 获取播放状态
   * */
  public static async getPlayState(): Promise<NeteaseMusic.PlayState> {
    const res = await NeteaseMusicController.runNeteaseMusic(command.getMenuControlFirstItemText, [])
    if (res === NeteaseMusic.PlayState.Exit) {
      return res
    } else if (res.includes('menu item 暂停')) {
      return NeteaseMusic.PlayState.Playing
    } else if (res.includes('menu item 播放')) {
      return NeteaseMusic.PlayState.Paused
    }
    return NeteaseMusic.PlayState.Unknown
  }

  /*
   * nextTrack: 下一首
   * */
  public static async nextTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.nextTrack), [])
  }

  /*
   * previousTrack: 上一首
   * */
  public static async previousTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.previousTrack), [])
  }

  /*
   * likeTrack: 喜欢歌曲
   * */
  public static async likeTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.likeTrack), [`不能获得“menu item "喜欢歌曲"`])
  }

  /*
   * dislikeTrack: 取消喜欢歌曲
   * */
  public static async dislikeTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.dislikeTrack), [`不能获得“menu item "取消喜欢"`])
  }

  /*
   * turnUpVolume: 调高音量
   * */
  public static async turnUpVolume(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.turnUpVolume), [])
  }

  /*
   * turnUpVolume: 调低音量
   * */
  public static async turnDownVolume(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.turnDownVolume), [])
  }

  /*
   * toggleLyrics: 打开/关闭歌词
   * */
  public static async toggleLyrics(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.genMenuControlScript(command.toggleLyrics), [])
  }

  /*
   * exit: 退出程序
   * */
  public static async exit(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(command.exit, [])
  }

  private static async runNeteaseMusic(script: string, ignoreErr: string[]): Promise<string | NeteaseMusic.PlayState> {
    try {
      return await runAppleScript(script)
    } catch (e) {
      const errMessage = `${e}`
      if (errMessage.includes('不能获得“process "NeteaseMusic"”')) {
        return NeteaseMusic.PlayState.Exit
      }
      if (ignoreErr.length > 0) {
        for (const err of ignoreErr) {
          if (errMessage.includes(err)) {
            return ''
          }
        }
      }
      throw e
    }
  }
}

const command = {
  play: `click menu item "播放"`,
  pause: `click menu item "暂停"`,
  nextTrack: `click menu item "下一个"`,
  previousTrack: `click menu item "上一个"`,
  turnUpVolume: `click menu item "升高音量"`,
  turnDownVolume: `click menu item "降低音量"`,
  likeTrack: `click menu item "喜欢歌曲"`,
  dislikeTrack: `click menu item "取消喜欢"`,
  toggleLyrics: `click menu item "打开/关闭歌词"`,
  minimizeWindow: ['窗口', '最小化'],
  exit: `tell application "System Events" to tell process "NeteaseMusic"
    click menu item "退出 网易云音乐" of menu "网易云音乐" of menu bar item "网易云音乐" of menu bar 1
end tell`,
  getMenuControlFirstItemText: `tell application "System Events" to tell process "NeteaseMusic"
  tell menu "控制" of menu bar item "控制" of menu bar 1
    set val to menu item 1
  end tell
end tell

return val
`,
  genMenuControlScript: (controlScript: string) => {
    return `tell application "System Events" to tell process "NeteaseMusic"
  tell menu "控制" of menu bar item "控制" of menu bar 1
    ${controlScript}
  end tell
end tell
`
  }
}

// click menu item "打开/关闭歌词"
