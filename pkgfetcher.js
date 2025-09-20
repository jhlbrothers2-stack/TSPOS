// pkgfetcher.js - Fetch JS package files from your GitHub repo into TSPOS

window.commands = window.commands || {};

commands.pkgfetch = {
  desc: "Fetch a JS package file from GitHub repo and save locally",
  async fn(args, print, fs) {
    if (!args.length) {
      print("Usage: pkgfetch <filename.js>", "error");
      return;
    }

    const filename = args[0];

    // Only allow .js files for safety
    if (!filename.endsWith(".js")) {
      print("Error: Only .js files can be fetched", "error");
      return;
    }

    // Construct raw GitHub URL - change user/repo/branch here as needed
    const url = `https://raw.githubusercontent.com/jhlbrothers2-stack/TSPOS/main/${filename}`;

    try {
      print(`Fetching ${filename} from GitHub...`, "info");
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const text = await response.text();

      // Save to virtual FS
      fs.setNode(filename, text);

      print(`Fetched and saved '${filename}' successfully.`, "success");
    } catch (error) {
      print(`Failed to fetch '${filename}': ${error.message}`, "error");
    }
  }
};
