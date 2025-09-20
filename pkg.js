// pkg.js - Unified package manager for TSPOS
window.commands = window.commands || {};

commands.pkg = {
  desc: "TSPOS package manager",
  async fn(args, print, fs) {
    const sub = args[0];

    if (!sub || sub === "help") {
      print(`Usage:
  pkg make <file.pkg>      - Compile .pkg to executable
  pkg install <name.js>    - Install JS package from GitHub
  pkg list                 - List installed packages
  pkg remove <name.js>     - Delete installed package
  pkg help                 - Show this help message`);
      return;
    }

    if (sub === "make") {
      const filename = args[1];
      if (!filename || !filename.endsWith(".pkg")) {
        print("Usage: pkg make <file.pkg>", "error");
        return;
      }

      if (!fs.exists(filename)) {
        print(`pkg: file '${filename}' not found`, "error");
        return;
      }

      const content = fs.getNode(filename);
      const match = content.match(/command:\s*(\S+)/);
      if (!match) {
        print("pkg: No command name found in pkg", "error");
        return;
      }

      const commandName = match[1];
      const script = content
        .split("\n")
        .filter(line => !line.trim().startsWith("command:") && line.trim())
        .map(line => line.trim());

      const runner = [
        `commands["${commandName}"] = {`,
        `  desc: "Installed from ${filename}",`,
        `  async fn(args, print, fs, runCommand) {`,
        `    const script = ${JSON.stringify(script)};`,
        `    for (const line of script) {`,
        `      await runCommand(line, print, fs, runCommand);`,
        `    }`,
        `  }`,
        `};`
      ].join("\n");

      fs.setNode(`/packages/${commandName}.js`, runner);
      print(`Created executable command: ${commandName}`);
      return;
    }

    if (sub === "install") {
      const file = args[1];
      if (!file || !file.endsWith(".js")) {
        print("Usage: pkg install <name.js>", "error");
        return;
      }

      const baseUrl = `https://raw.githubusercontent.com/jhlbrothers2-stack/TSPOS/main/${file}`;
      try {
        const res = await fetch(baseUrl);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const code = await res.text();
        fs.setNode(`/packages/${file}`, code);
        print(`Installed ${file}`);
      } catch (err) {
        print(`Failed to fetch ${file}: ${err.message}`, "error");
      }
      return;
    }

    if (sub === "list") {
      const dir = fs.getNode("/packages");
      if (!dir || typeof dir !== "object") {
        print("No packages installed.");
        return;
      }

      const files = Object.keys(dir);
      if (files.length === 0) {
        print("No packages installed.");
      } else {
        print("Installed packages:\n" + files.join("\n"));
      }
      return;
    }

    if (sub === "remove") {
      const file = args[1];
      if (!file) {
        print("Usage: pkg remove <name.js>", "error");
        return;
      }

      const path = `/packages/${file}`;
      if (!fs.exists(path)) {
        print(`${file} not found.`, "error");
        return;
      }

      fs.rm(path);
      print(`Removed ${file}`);
      return;
    }

    print(`Unknown subcommand: ${sub}`, "error");
  }
};
