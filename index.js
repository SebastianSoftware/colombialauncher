const fs = require('node:fs');
const {app, BrowserWindow, ipcMain} = require('electron');
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const client = require('discord-rich-presence')('1108829190654013592');
const path = require('path');
const os = require('os');
const download = require('download');
const decompress = require('decompress');

let game = 'Colombia';
client.updatePresence({
  state: 'Jugando a ' + "'" + game + "'",
  startTimestamp: Date.now(),
  largeImageKey: 'ssoftstudioslauncher1',
  instance: true,
});
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 576,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
    },
    icon: __dirname + '/build/icon.png',
    autoHideMenuBar: true,
  })

  win.loadFile('./LauncherFiles/index.html')
}

app.whenReady().then(() => {
  const Autenticacion = new Promise(async (resolve, reject) => {
    try {
        let firstWindow = new BrowserWindow({
          width: 480,
          height: 640,
          show: true,
          webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
          },
          icon: __dirname + '/build/icon.png',
          autoHideMenuBar: true,
        });
        firstWindow.loadFile('./LauncherFiles/login.html');
        let mcname = null;
        ipcMain.on("namemc", (event, arg) => {
          mcname = arg;
          console.log(arg);
          event.sender.send('name-received');
          const memAvailable = os.freemem() / Math.pow(1024, 2);
        const maxMem = memAvailable * 0.50;
        const minMem = memAvailable * 0.25;
        const username = os.userInfo().username;
        let directory = path.join('C:', 'Users', username, 'AppData', 'Roaming', 'SebastianSoftware', 'Studios', 'Launcher', 'data', 'instances', game);
        if(!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
        let moddir = path.join(directory, 'mods');
        if(!fs.existsSync(moddir)) fs.mkdirSync(moddir, {recursive: true});
        let versiondir = path.join(directory, 'versions', 'fabric-loader-0.15.10-1.19.4');
        if(!fs.existsSync(versiondir)) fs.mkdirSync(versiondir, {recursive: true});
        const VersionURI = "https://files.sebastiangrupo.com/modpacks/v0.1/fabric-loader-0.15.10-1.19.4.json";
        const APIURI = "https://files.sebastiangrupo.com/modpacks/v0.1/colombia.zip";
        fs.readdir(versiondir, (err, files) => {
          if(err) {
            console.log(error);
            return;
          }

          if(files.length == 0) {
            download(VersionURI, versiondir).then(() => {
              console.log("Fabric fabric-loader-0.15.10-1.19.4.json downloaded");
            }).catch((error) => {
              console.log(error);
            })
          }
        })
        fs.readdir(moddir, (err, files) => {
          if(err) {
            console.log("Error while fetching mods.", err);
            return;
          }

          if(files.length == 0) {
            download(APIURI, moddir).then(() => {
              console.log("Mod files downloaded");
              console.log("Uncompressing mods...");
              decompress(path.join(moddir, 'colombia.zip'), moddir).then((files) => {
                console.log("Mod files extracted: " + files);
                console.log("Mod files ready");
                fs.unlink(path.join(moddir, 'colombia.zip'), (error) => {
                  if (error) {
                    console.error("Error while deleting zip file:", error);
                  } else {
                    console.log("Zip file deleted successfully.");
                  }
                });
              }).catch((error) => {
                console.log("error while unzipping mods",  error);
              })
            }).catch((error) => {
              console.log("error while downloading mods zip", error);
            })
          } else {
            console.log("Mods found, number of mods: " + files.length)
          }
        })
        let opts = {
          clientPackage: null,
          authorization: Authenticator.getAuth(mcname),
          root: directory,
          version: {
            number: "1.19.4",
            type: "release",
            custom: "fabric-loader-0.15.10-1.19.4"
          },
          timeout: 30000,
          javaPath: 'javaw',
          server: {
            host: "colombia.sebastiangrupo.com"
          },
          memory: {
            max: Math.floor(maxMem) + "M",
            min: Math.floor(minMem) + "M"
          },
          overrides: {
            detached: true,
          }
        };
        console.log("Ready to Launch...");
        function runMC() {
          console.log("Starting!");
          firstWindow.close();
          launcher.launch(opts);
          launcher.on('debug', (e) => console.log(e));
          launcher.on('data', (e) => console.log(e));
          launcher.addListener(
            "progress",
            (progress) => console.log(progress)
          );
        }
        ipcMain.on("message", (event) => {
          runMC();
        });
        if(mcname != null) resolve(true);
        }); 
    } catch (error) {
      console.log("Ha ocurrido un error en la aplicación al intentar configurar el lanzamiento de Minecraft.");
      console.log("Intentenlo nuevamente. https://studios.sebastiangrupo.com/");
      reject(error);
    }
})
  Autenticacion.then((resolve) => {
    console.log(resolve.toString());
    if(resolve == true) {
      console.log("Succesfully loadad all the settings for Minecraft Launch.");
      createWindow();
    } else {
     console.log("Ha ocurrido un error al cargar la configuración")
    }
  })
})

ipcMain.on('name-received', () => {
  if (win.isVisible() && !firstWindow.isDestroyed()) {
      firstWindow.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', () => {
  console.log('ready');
})
