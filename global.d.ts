// In a global.d.ts file or any other .d.ts file included in your project
declare namespace NodeJS {
  interface Global {
    mongoose: {
      conn: mongoose.Connection | null,
      promise: Promise<mongoose.Connection> | null
    }
  }
}