# netease-music-controller

## Install

```shell
npm i --save @chyroc/netease-music-controller
```

## Usage

```typescript
import NeteaseMusicController from "@chyroc/netease-music-controller"

const example = async () => {
  // play
  await NeteaseMusicController.play()

  // pause
  await NeteaseMusicController.pause()

  // next
  await NeteaseMusicController.nextTrack()

  // previous
  await NeteaseMusicController.previousTrack()

  // up volume
  await NeteaseMusicController.turnUpVolume()

  // down volume
  await NeteaseMusicController.turnDownVolume()

  // like
  await NeteaseMusicController.likeTrack()

  // dislike
  await NeteaseMusicController.dislikeTrack()

  // toggle lyrics
  await NeteaseMusicController.toggleLyrics()

  // exit
  await NeteaseMusicController.exit()
}
```
