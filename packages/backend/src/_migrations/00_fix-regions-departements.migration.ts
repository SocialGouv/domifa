import { of } from "rxjs";

async function up() {
  // TEST
  console.log("xxx UUUUUUUUUUUUUUUUUUUUUUUUP");
  await of(undefined).toPromise();
}

async function down() {
  // TEST
  console.log("xxx dddddddddddddown");
  await of(undefined).toPromise();
}

export { up, down };
