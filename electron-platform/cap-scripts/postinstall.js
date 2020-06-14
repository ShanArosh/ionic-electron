const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");

function runExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function doPostInstall() {
  if (!fs.existsSync(path.join(__dirname, "../", ".no-postinstall-script"))) {
    const usersProjectCapConfig = path.join(
      process.env.INIT_CWD,
      "capacitor.config.json"
    );
    const srcDir = path.join(__dirname, "../", "electron_template");
    const destDir = path.join(process.env.INIT_CWD, "electron");
    if (usersProjectCapConfig) {
      const capConfigJson = JSON.parse(
        fs.readFileSync(usersProjectCapConfig, "utf-8")
      );
      if (capConfigJson.webDir) {
        const webDirPath = path.join(
          process.env.INIT_CWD,
          capConfigJson.webDir
        );
        if (fs.exists(webDirPath)) {
          if (!fs.exists(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            fse.copySync(srcDir, destDir);
            fse.copySync(
              usersProjectCapConfig,
              path.join(destDir, "capacitor.config.json")
            );
            fse.copySync(webDirPath, path.join(destDir, "app"));
            console.log(await runExec(`cd ${destDir} && npm i`));
            console.log("Electron platform added!");
          } else {
            throw new Error("Electron platform folder already exists.");
          }
        } else {
          throw new Error(
            "The webDir referenced in capcacitor.config.json does not exsist."
          );
        }
      } else {
        throw new Error(
          "Property webDir is not defined in capacitor.config.json."
        );
      }
    } else {
      throw new Error(
        "No capacitor.config.json file found. Did you initiate capcacitor for this project?"
      );
    }
  }
}

(() => {
  doPostInstall();
})();