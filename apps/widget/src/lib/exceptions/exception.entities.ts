import { createSerializationAdapter } from '@tanstack/react-router'

export class CustomError<T> extends Error {
  public properties: T

  constructor(message: string, properties: T = {} as T) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.properties = properties
  }
}

export const customErrorAdapter = createSerializationAdapter({
  key: `custom-error`,
  test: (v) => v instanceof CustomError,
  toSerializable: ({ message, properties }) => {
    return { message, properties }
  },
  fromSerializable: ({ message, properties }) => {
    return new CustomError(message, properties)
  },
})
