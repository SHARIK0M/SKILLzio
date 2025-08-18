import morgan, { StreamOptions } from 'morgan'

const stream: StreamOptions = {
  write: (message) => console.log(message.trim()),
}
morgan.token('timestamp', () => new Date().toISOString())

const format = ':timestamp :method :url :status :res[content-length] - :response-time ms'

export const logger = morgan(format, { stream })
