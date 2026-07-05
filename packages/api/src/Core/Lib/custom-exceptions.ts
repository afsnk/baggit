


export class CustomError<T> extends Error {
  public properties: T

  constructor(message: string, properties: T = {} as T) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.properties = properties
  }
}


export class AuthError extends CustomError<{ userName: string; password: string; }> {

  constructor(properties: { userName: string; password: string; }) {
    super(`Invalid username: ${properties.userName} or password: ${properties.password} inputed`, properties)
  }
}


function main() {

  try {
    throw new AuthError({userName: "afullsnack", password: 'kiloBUYE200!'})
  }
  catch (e) {
    if (e instanceof AuthError) {
      console.log(e.message, { props: e.properties })
      return
    }
    console.log(`Some generic BS error`, {e})
  }
}


main()
