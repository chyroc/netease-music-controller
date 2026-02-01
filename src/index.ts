import { runAppleScript } from './run'

export namespace NeteaseMusic {
  export enum PlayState {
    Playing = 'playing',
    Paused = 'paused',
    Exit = 'exit',
    Unknown = 'unknown'
  }
}

// Menu item names for different languages
const menuItems = {
  zh: {
    control: '控制',
    play: '播放',
    pause: '暂停',
    next: '下一个',
    previous: '上一个',
    volumeUp: '升高音量',
    volumeDown: '降低音量',
    like: '喜欢歌曲',
    dislike: '取消喜欢',
    lyrics: '打开/关闭歌词',
    appMenu: '网易云音乐',
    quit: '退出 网易云音乐'
  },
  en: {
    control: 'Controls',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    previous: 'Previous',
    volumeUp: 'Increase Volume',
    volumeDown: 'Decrease Volume',
    like: 'Like',
    dislike: 'Unlike',
    lyrics: 'Toggle Lyrics',
    appMenu: 'NeteaseMusic',
    quit: 'Quit NeteaseMusic'
  }
}

type Lang = 'zh' | 'en'

// Cached detected language
let detectedLang: Lang | null = null
// Cached control menu name
let detectedControlMenuName: string | null = null

// Detect language by checking the app's menu bar items
async function detectLang(): Promise<Lang> {
  if (detectedLang && detectedControlMenuName) {
    return detectedLang
  }

  const script = `tell application "System Events" to tell process "NeteaseMusic"
  if exists menu bar item "Controls" of menu bar 1 then
    return "Controls,en"
  else if exists menu bar item "控制" of menu bar 1 then
    return "控制,zh"
  end if

  repeat with m in every menu bar item of menu bar 1
    try
      tell menu of m
        if (exists menu item "Play") or (exists menu item "Pause") then
          return name of m & ",en"
        else if (exists menu item "播放") or (exists menu item "暂停") then
          return name of m & ",zh"
        end if
      end tell
    end try
  end repeat
  return "Controls,en"
end tell`

  try {
    const result = await runAppleScript(script)
    const [menuName, lang] = result.split(',', 2).map(s => s.trim())
    detectedControlMenuName = menuName
    detectedLang = (lang as Lang) || 'en'
    return detectedLang
  } catch {
    // Default to English if detection fails
    detectedControlMenuName = 'Controls'
    detectedLang = 'en'
    return 'en'
  }
}

// Reset cached language (useful if app restarts with different locale)
export function resetLangCache(): void {
  detectedLang = null
  detectedControlMenuName = null
}

function genMenuControlScript(controlScript: string, lang: Lang): string {
  const m = menuItems[lang]
  const controlMenuName = detectedControlMenuName || m.control
  return `tell application "System Events" to tell process "NeteaseMusic"
  tell menu "${controlMenuName}" of menu bar item "${controlMenuName}" of menu bar 1
    try
      ${controlScript}
    end try
  end tell
end tell
`
}

function genClickMenuItem(itemName: string): string {
  return `click menu item "${itemName}"`
}

function getMenuControlFirstItemText(lang: Lang): string {
  const m = menuItems[lang]
  const controlMenuName = detectedControlMenuName || m.control
  return `tell application "System Events" to tell process "NeteaseMusic"
  tell menu "${controlMenuName}" of menu bar item "${controlMenuName}" of menu bar 1
    set val to menu item 1
  end tell
end tell

return val
`
}

function genExitScript(lang: Lang): string {
  const m = menuItems[lang]
  return `tell application "System Events" to tell process "NeteaseMusic"
    click menu item "${m.quit}" of menu "${m.appMenu}" of menu bar item "${m.appMenu}" of menu bar 1
end tell`
}

export default class NeteaseMusicController {
  /*
   * play: 播放 / Play
   * */
  public static async play(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].play), lang), [
      `不能获得"menu item "${menuItems[lang].play}"`,
      `Can't get menu item "${menuItems[lang].play}"`
    ])
  }

  /*
   * pause: 暂停 / Pause
   * */
  public static async pause(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].pause), lang), [
      `不能获得"menu item "${menuItems[lang].pause}"`,
      `Can't get menu item "${menuItems[lang].pause}"`
    ])
  }

  /*
   * getPlayState: 获取播放状态 / Get play state
   * */
  public static async getPlayState(): Promise<NeteaseMusic.PlayState> {
    const lang = await detectLang()
    const res = await NeteaseMusicController.runNeteaseMusic(getMenuControlFirstItemText(lang), [])
    if (res === NeteaseMusic.PlayState.Exit) {
      return res
    }
    // Check for pause menu item (means currently playing)
    if (res.includes(`menu item ${menuItems[lang].pause}`)) {
      return NeteaseMusic.PlayState.Playing
    }
    // Check for play menu item (means currently paused)
    if (res.includes(`menu item ${menuItems[lang].play}`)) {
      return NeteaseMusic.PlayState.Paused
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
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].next), lang), [])
  }

  /*
   * previousTrack: 上一首 / Previous track
   * */
  public static async previousTrack(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].previous), lang), [])
  }

  /*
   * likeTrack: 喜欢歌曲 / Like track
   * */
  public static async likeTrack(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].like), lang), [
      `不能获得"menu item "${menuItems[lang].like}"`,
      `Can't get menu item "${menuItems[lang].like}"`
    ])
  }

  /*
   * dislikeTrack: 取消喜欢歌曲 / Unlike track
   * */
  public static async dislikeTrack(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].dislike), lang), [
      `不能获得"menu item "${menuItems[lang].dislike}"`,
      `Can't get menu item "${menuItems[lang].dislike}"`
    ])
  }

  /*
   * turnUpVolume: 调高音量 / Increase volume
   * */
  public static async turnUpVolume(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].volumeUp), lang), [])
  }

  /*
   * turnDownVolume: 调低音量 / Decrease volume
   * */
  public static async turnDownVolume(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].volumeDown), lang), [])
  }

  /*
   * toggleLyrics: 打开/关闭歌词 / Toggle lyrics
   * */
  public static async toggleLyrics(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genMenuControlScript(genClickMenuItem(menuItems[lang].lyrics), lang), [])
  }

  /*
   * exit: 退出程序 / Quit app
   * */
  public static async exit(): Promise<void> {
    const lang = await detectLang()
    await NeteaseMusicController.runNeteaseMusic(genExitScript(lang), [])
  }

  private static async runNeteaseMusic(script: string, ignoreErr: string[]): Promise<string | NeteaseMusic.PlayState> {
    try {
      return await runAppleScript(script)
    } catch (e) {
      const errMessage = `${e}`
      if (errMessage.includes('不能获得"process "NeteaseMusic""') || errMessage.includes(`Can't get process "NeteaseMusic"`)) {
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
