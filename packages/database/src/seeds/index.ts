import { seedReferenceData } from "./reference.seed.js";
import { seedDemoData } from "./demo.seed.js";


async function main() {
  // Always seed reference data first, as demo data depends on it
  await seedReferenceData();

  if (process.env.SEED_DEMO === "true") {
    await seedDemoData();
  }
}

main();