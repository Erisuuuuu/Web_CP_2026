type Level = 'info' | 'warn' | 'error'

function log(level: Level, module: string, message: string, data?: unknown) {
  const ts = new Date().toISOString()
  const line = `[${ts}] [${level.toUpperCase()}] [${module}] ${message}`
  if (data !== undefined) {
    console[level](line, data)
  } else {
    console[level](line)
  }
}

export const logger = {
  info:  (module: string, msg: string, data?: unknown) => log('info',  module, msg, data),
  warn:  (module: string, msg: string, data?: unknown) => log('warn',  module, msg, data),
  error: (module: string, msg: string, data?: unknown) => log('error', module, msg, data),
}
