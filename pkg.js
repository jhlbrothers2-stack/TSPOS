window.commands = window.commands || {};
// pkg.js - TSPOS package manager command
commands.pkg = {
  desc: "TSPOS package manager",
  fn: async (args, print) => {
    const subcmd = args[0];
    const pkgName = args[1];

    if (subcmd === "install" && pkgName) {
      const rawName = pkgName.endsWith(".js") ? pkgName : `${pkgName}.js`;
      const url = `https://raw.githubusercontent.com/jhlbrothers2-stack/TSPOS/main/${rawName}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const code = await response.text();

        // Execute the fetched package code in global scope
        new Function(code)();

        print(`Installed ${rawName}`, "success");
      } catch (err) {
        print(`Failed to fetch ${rawName}: ${err.message}`, "error");
      }
    } else if (subcmd === "help") {
      print("Usage: pkg install <package.js>");
    } else {
      print("Usage: pkg install <package.js>");
    }
  }
};
