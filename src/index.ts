import { runAppleScript } from './run'

export default class NeteaseMusicController {
  /*
   * exit: 退出程序
   * */
  public async exit(): Promise<void> {
    try {
      await runAppleScript(command.exit)
    } catch (e) {
      const isExit = `${e}`.includes('不能获得“process "NeteaseMusic"”')
      if (isExit) {
        return
      }
      throw e
    }
  }
}

const command = {
  exit: `tell application "System Events" to tell process "NeteaseMusic"
    click menu item "退出 网易云音乐" of menu "网易云音乐" of menu bar item "网易云音乐" of menu bar 1
end tell`,
  getItemOne: `tell application "System Events" to tell process "NeteaseMusic"
  tell menu "控制" of menu bar item "控制" of menu bar 1
    set val to menu item 1
  end tell
end tell

val
`
}

// click menu item "下一个"
// click menu item "上一个"
// click menu item "升高音量"
// click menu item "降低音量"
// click menu item "喜欢歌曲"
// click menu item "打开/关闭歌词"
