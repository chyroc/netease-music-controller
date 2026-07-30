import { runAppleScript } from './run'

export namespace NeteaseMusic {
  export enum PlayState {
    Playing = 'playing',
    Paused = 'paused',
    Exit = 'exit',
    Unknown = 'unknown'
  }
}

const processName = 'NeteaseMusic'
const controlMenuNames = ['控制', 'Controls']
const appMenuNames = ['网易云音乐', 'NetEaseMusic', 'NeteaseMusic']
const quitMenuItemNames = ['退出 网易云音乐', 'Quit NetEaseMusic', 'Quit NeteaseMusic']

const menuItemNames = {
  play: ['播放', 'Play'],
  pause: ['暂停', 'Pause'],
  next: ['下一个', 'Next'],
  previous: ['上一个', 'Previous'],
  volumeUp: ['升高音量', 'Increase Volume'],
  volumeDown: ['降低音量', 'Decrease Volume'],
  like: ['喜欢歌曲', 'Like'],
  dislike: ['取消喜欢', 'Dislike', 'Unlike'],
  lyrics: ['打开/关闭歌词', 'Show/Hide Lyrics', 'Toggle Lyrics']
}

function quoteAppleScript(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function genMenuSelection(variableName: string, menuNames: string[]): string {
  const conditions = menuNames.map((menuName, index) => {
    const prefix = index === 0 ? 'if' : 'else if'
    const quotedMenuName = quoteAppleScript(menuName)
    return `${prefix} exists menu bar item ${quotedMenuName} of menu bar 1 then
      set ${variableName} to menu ${quotedMenuName} of menu bar item ${quotedMenuName} of menu bar 1`
  })

  return `${conditions.join('\n    ')}
    else
      error "Cannot find menu: ${menuNames.join(' / ')}"
    end if`
}

function genProcessScript(body: string): string {
  return `tell application "System Events"
  if not (exists process "${processName}") then
    return "${NeteaseMusic.PlayState.Exit}"
  end if

  tell process "${processName}"
    if not (exists menu bar 1) then
      return "${NeteaseMusic.PlayState.Exit}"
    end if

    ${body}
  end tell
end tell
`
}

function genControlMenuScript(body: string): string {
  return genProcessScript(`${genMenuSelection('controlsMenu', controlMenuNames)}

    ${body}`)
}

function genClickMenuItemBody(itemNames: string[], optional: boolean): string {
  const conditions = itemNames.map((itemName, index) => {
    const prefix = index === 0 ? 'if' : 'else if'
    const quotedItemName = quoteAppleScript(itemName)
    return `${prefix} exists menu item ${quotedItemName} of controlsMenu then
      click menu item ${quotedItemName} of controlsMenu`
  })
  const missingItemAction = optional ? 'return ""' : `error "Cannot find menu item: ${itemNames.join(' / ')}"`

  return `${conditions.join('\n    ')}
    else
      ${missingItemAction}
    end if`
}

function genClickControlMenuItemScript(itemNames: string[], optional: boolean): string {
  return genControlMenuScript(genClickMenuItemBody(itemNames, optional))
}

function genGetPlayStateScript(): string {
  const pauseConditions = menuItemNames.pause.map(itemName => `(exists menu item ${quoteAppleScript(itemName)} of controlsMenu)`).join(' or ')
  const playConditions = menuItemNames.play.map(itemName => `(exists menu item ${quoteAppleScript(itemName)} of controlsMenu)`).join(' or ')

  return genControlMenuScript(`if ${pauseConditions} then
      return "${NeteaseMusic.PlayState.Playing}"
    else if ${playConditions} then
      return "${NeteaseMusic.PlayState.Paused}"
    end if

    return "${NeteaseMusic.PlayState.Unknown}"`)
}

function genExitScript(): string {
  const quitConditions = quitMenuItemNames.map((itemName, index) => {
    const prefix = index === 0 ? 'if' : 'else if'
    const quotedItemName = quoteAppleScript(itemName)
    return `${prefix} exists menu item ${quotedItemName} of appMenu then
      click menu item ${quotedItemName} of appMenu`
  })

  return genProcessScript(`${genMenuSelection('appMenu', appMenuNames)}

    ${quitConditions.join('\n    ')}
    else
      error "Cannot find menu item: ${quitMenuItemNames.join(' / ')}"
    end if`)
}

/**
 * Kept for compatibility with the unreleased 0.7.0 API.
 * Menu names are now resolved for every command, so there is no cache to reset.
 */
export function resetLangCache(): void {
  return
}

export default class NeteaseMusicController {
  /*
   * play: 播放 / Play
   * */
  public static async play(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.play, true))
  }

  /*
   * pause: 暂停 / Pause
   * */
  public static async pause(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.pause, true))
  }

  /*
   * getPlayState: 获取播放状态 / Get play state
   * */
  public static async getPlayState(): Promise<NeteaseMusic.PlayState> {
    const result = (await NeteaseMusicController.runNeteaseMusic(genGetPlayStateScript())).trim()
    if (result === NeteaseMusic.PlayState.Playing) {
      return NeteaseMusic.PlayState.Playing
    }
    if (result === NeteaseMusic.PlayState.Paused) {
      return NeteaseMusic.PlayState.Paused
    }
    if (result === NeteaseMusic.PlayState.Exit) {
      return NeteaseMusic.PlayState.Exit
    }
    return NeteaseMusic.PlayState.Unknown
  }

  /*
   * togglePlayPause: 切换播放/暂停 / Toggle play/pause
   * */
  public static async togglePlayPause(): Promise<void> {
    const playState = await NeteaseMusicController.getPlayState()
    if (playState === NeteaseMusic.PlayState.Playing) {
      await NeteaseMusicController.pause()
    } else {
      await NeteaseMusicController.play()
    }
  }

  /*
   * nextTrack: 下一首 / Next track
   * */
  public static async nextTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.next, false))
  }

  /*
   * previousTrack: 上一首 / Previous track
   * */
  public static async previousTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.previous, false))
  }

  /*
   * likeTrack: 喜欢歌曲 / Like track
   * */
  public static async likeTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.like, true))
  }

  /*
   * dislikeTrack: 取消喜欢歌曲 / Dislike track
   * */
  public static async dislikeTrack(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.dislike, true))
  }

  /*
   * turnUpVolume: 调高音量 / Increase volume
   * */
  public static async turnUpVolume(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.volumeUp, false))
  }

  /*
   * turnDownVolume: 调低音量 / Decrease volume
   * */
  public static async turnDownVolume(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.volumeDown, false))
  }

  /*
   * toggleLyrics: 打开/关闭歌词 / Show or hide lyrics
   * */
  public static async toggleLyrics(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genClickControlMenuItemScript(menuItemNames.lyrics, false))
  }

  /*
   * exit: 退出程序 / Quit app
   * */
  public static async exit(): Promise<void> {
    await NeteaseMusicController.runNeteaseMusic(genExitScript())
  }

  private static async runNeteaseMusic(script: string): Promise<string> {
    return runAppleScript(script)
  }
}
