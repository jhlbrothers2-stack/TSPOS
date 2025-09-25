// pkgmaker.js - Package creation system for TSPOS Terminal
window.commands = window.commands || {};

commands.pkgmake = {
  desc: "Create a new command from a .pkg script file",
  fn: async function(args, print, fs, runCommand) {
    if (!args.length) {
      print("Usage: pkgmake filename.pkg", "error");
      return;
    }
    
    const filename = args[0];
    if (!fs.exists(filename)) {
      print(`File "${filename}" does not exist.`, "error");
      return;
    }
    
    const content = fs.getNode(filename);
    if (typeof content !== "string") {
      print(`File "${filename}" is not a text file.`, "error");
      return;
    }

    // Parse the .pkg file content line by line
    const lines = content.split(/\r?\n/).map(l => l.trim());
    let commandName = null;
    let description = "";
    let runLines = [];
    let inRun = false;

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (lineLower.startsWith("command:")) {
        commandName = line.slice(line.indexOf(":") + 1).trim();
      } else if (lineLower.startsWith("description:")) {
        description = line.slice(line.indexOf(":") + 1).trim();
      } else if (lineLower === "run:") {
        inRun = true;
      } else if (inRun) {
        if (line === "" || line.startsWith("#")) continue;
        runLines.push(line);
      }
    }

    if (!commandName) {
      print("Error: No 'command:' found in the .pkg file.", "error");
      return;
    }
    if (!runLines.length) {
      print("Error: No 'run:' block found or empty in the .pkg file.", "error");
      return;
    }

    const vars = {};

    function substituteVars(str) {
      return str.replace(/\{([^}]+)\}/g, (_, v) => {
        if (v in vars) return vars[v];
        return `{${v}}`;
      });
    }

    async function runScript(args, print, fs, runCommand) {
      for (const line of runLines) {
        if (line.startsWith("set ")) {
          const m = line.match(/^set (\S+) = (.+)$/);
          if (!m) {
            print(`Syntax error in set command: ${line}`, "error");
            return;
          }
          const [, varName, valueExpr] = m;
          let userInputMatch = valueExpr.match(/^userinput\s+"(.+)"$/);
          if (userInputMatch) {
            const promptText = userInputMatch[1];
            const input = await new Promise(resolve => {
              let answer = window.prompt(promptText);
              resolve(answer === null ? "" : answer);
            });
            vars[varName] = input;
          } else {
            vars[varName] = substituteVars(valueExpr).replace(/^"(.*)"$/, "$1");
          }
        } else if (line.startsWith("print ")) {
          let toPrint = line.slice(6).trim();
          toPrint = substituteVars(toPrint).replace(/^"(.*)"$/, "$1");
          print(toPrint);
        } else {
          // Assume it's a terminal command line
          const commandLine = substituteVars(line);
          await runCommand(commandLine.split(" "), print, fs, runCommand);
        }
      }
    }

    // Create the new command
    commands[commandName] = {
      desc: description || "No description",
      fn: async function(args, print, fs, runCommand) {
        vars["args"] = args;
        await runScript(args, print, fs, runCommand);
      }
    };

    print(`Command '${commandName}' installed successfully!`, "success");
  }
};