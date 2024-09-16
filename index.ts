import { App } from "./src/app";

async function main() {
  const app = new App();
  await app.listen();
}
main();
