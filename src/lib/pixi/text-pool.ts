import { Text } from 'pixi.js'
import { makeStyle } from './helpers'
import type { Params } from './params'

const POOL_CAP = 40

export interface TextPool {
  acquire(str: string, color: number): Text
  release(txt: Text): void
  flush(): void
}

export function createTextPool(params: Params): TextPool {
  const pool: Text[] = []

  return {
    acquire(str: string, color: number): Text {
      if (pool.length > 0) {
        const txt = pool.pop()!
        txt.text = str
        txt.style.fontSize = params.fontSize
        txt.style.fill = color
        txt.visible = true
        return txt
      }
      return new Text({ text: str, style: makeStyle(color, params) })
    },

    release(txt: Text): void {
      txt.visible = false
      if (pool.length < POOL_CAP && txt.style) {
        pool.push(txt)
      } else {
        txt.destroy({ children: true })
      }
    },

    flush(): void {
      for (const t of pool) t.destroy()
      pool.length = 0
    },
  }
}
