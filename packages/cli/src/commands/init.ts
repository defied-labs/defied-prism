import fs from "node:fs/promises";

export async function initCommand() {
  const config = {
    framework: "react",

    styling: "tailwind",

    componentsPath: "src/components/ui",

    components: [],
  };

  await fs.writeFile(
    "prism.json",

    JSON.stringify(config, null, 2) + "\n",
  );

  /* TODO: RE-ENABLE THIS
  const { exec } = await import("node:child_process");
  await new Promise((resolve, reject) => {
    exec(
      "npm install @defied-prism/react@latest @defied-prism/core@latest",
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      },
    );
  }); */

  console.log("✓ Prism initialized");
}
