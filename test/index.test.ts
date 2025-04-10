import NeteaseMusicController from '../src'

describe('Dummy test', () => {
  it('works if true is truthy', async () => {
    // console.log('getPlayState', await NeteaseMusicController.getPlayState())
    await NeteaseMusicController.nextTrack()
    // await NeteaseMusicController.previousTrack()
    // await NeteaseMusicController.likeTrack()
    // await NeteaseMusicController.dislikeTrack()
    // await NeteaseMusicController.turnDownVolume()
    // await NeteaseMusicController.turnUpVolume()
    // await NeteaseMusicController.play()
    // await NeteaseMusicController.pause()
    // await NeteaseMusicController.toggleLyrics()
    // await NeteaseMusicController.togglePlayPause()
  })

  it('NeteaseMusicController is instantiable', () => {
    expect(new NeteaseMusicController()).toBeInstanceOf(NeteaseMusicController)
  })
})
