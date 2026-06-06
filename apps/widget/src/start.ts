import { createStart } from '@tanstack/react-start'
import { customErrorAdapter } from './lib/exceptions/exception.entities'
// import { errorTransformMiddleware } from './middleware/error.transform'

export const startInstance = createStart(() => ({
  // functionMiddleware: [errorTransformMiddleware],
  serializationAdapters: [customErrorAdapter],
}))
