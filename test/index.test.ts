import NeteaseMusicController from '../src'

describe('Dummy test', () => {
  it('works if true is truthy', async () => {
    expect(true).toBeTruthy()
    const controller = new NeteaseMusicController()
    const res = await controller.exit()
    console.log('res', res)
  })

  it('NeteaseMusicController is instantiable', () => {
    expect(new NeteaseMusicController()).toBeInstanceOf(NeteaseMusicController)
  })
})
