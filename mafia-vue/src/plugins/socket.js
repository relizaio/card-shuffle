import { io } from 'socket.io-client'

export default {
  install (app, options = {}) {
    const socket = io(options.connection, options.options)

    if (options.debug) {
      socket.onAny((event, ...args) => {
        console.log('[socket]', event, ...args)
      })
    }

    app.config.globalProperties.$socket = socket
    app.provide('socket', socket)

    app.mixin({
      created () {
        const handlers = this.$options.sockets
        if (!handlers) return
        this._socketHandlers = []
        for (const event in handlers) {
          const fn = handlers[event].bind(this)
          socket.on(event, fn)
          this._socketHandlers.push([event, fn])
        }
      },
      beforeUnmount () {
        if (!this._socketHandlers) return
        for (const [event, fn] of this._socketHandlers) {
          socket.off(event, fn)
        }
        this._socketHandlers = null
      }
    })
  }
}
