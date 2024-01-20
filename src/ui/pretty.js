/* -------------------------------------------------------------------------- */
/*                           UI / Pretty (pictures)                           */
/* -------------------------------------------------------------------------- */
import c from "ansi-colors";
import figlet from "figlet";

const solidLine = "___________________________________";
const dashedLine = "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _";
const logo = `
 _____ _         _____             
|_   _|_|___ _ _|   __|_ _ ___ ___ 
  | | | |   | | |__   | | |   |  _|
  |_| |_|_|_|_  |_____|_  |_|_|___|
            |___|     |___|        
`;
const signature = "        made with ❤️ by Brian";
const error = `
 _____ _                    
|     | |_    ___ ___       
|  |  |   |  |   | . |_ _ _ 
|_____|_|_|  |_|_|___|_|_|_|
`;
const spacer = `
`;
const syncing = `
 _____             _               
|   __|_ _ ___ ___|_|___ ___       
|__   | | |   |  _| |   | . |_ _ _ 
|_____|_  |_|_|___|_|_|_|_  |_|_|_|
      |___|             |___|      
`;
const success = `                               __ 
 _____                        |  |
|   __|_ _ ___ ___ ___ ___ ___|  |
|__   | | |  _|  _| -_|_ -|_ -|__|
|_____|___|___|___|___|___|___|__|`;

const ok = `
                    _____ 
      _            |___  |
 ___ | |_            |  _|
| . || '_| _  _  _   |_|  
|___||_,_||_||_||_|  |_|                   
`;

const overload = ``;
const bye = `See ya later! 👋`;

const pictures = {
    solidLine,
    dashedLine,
    logo,
    signature,
    error,
    spacer,
    syncing,
    success,
    overload,
    bye,
    ok,
};

export const pretty = {
    solidLine: () => delayLog(c.dim(pictures.solidLine)),
    dashedLine: () => delayLog(c.dim(pictures.dashedLine)),
    logo: () => delayLog(c.green(pictures.logo)),
    signature: () => delayLog(c.dim(pictures.signature)),
    error: () => delayLog(c.red(pictures.error)),
    spacer: () => delayLog(pictures.spacer),
    syncing: () => delayLog(pictures.syncing),
    success: () => delayLog(c.green(pictures.success)),
    overload: () => delayLog(pictures.overload),
    bye: () => delayLog(c.bold(pictures.bye)),
    log: (message) => delayLog(message),
    logBold: (message) => delayLog(c.bold(message)),
    logHeading: (message) => delayLog(c.inverse.bold(message)),
    ok: () => delayLog(c.yellow(pictures.ok)),
    heading,
};

async function delayLog(message, delay = 25) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    console.log(message);
}

async function heading(message, style = "reset") {
    console.log(
        c[style](
            figlet.textSync(message, {
                font: "Rectangles",
                horizontalLayout: "default",
                verticalLayout: "default",
                width: 80,
                whitespaceBreak: true,
            })
        )
    );
}
