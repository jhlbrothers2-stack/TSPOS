window.commands.gui = {
  desc: "Launch GUI HTML window from stored .html file",
  fn: (args, print) => {
    const name = args[0];
    if (!name) return print("Usage: gui <filename.html>", "error");

    const html = window.htmlFiles?.[name];
    if (!html) return print(`HTML file not found: ${name}`, "error");

    // Basic floating window
    const win = document.createElement("div");
    win.innerHTML = html;
    Object.assign(win.style, {
      position: "fixed",
      top: "100px",
      left: "100px",
      width: "600px",
      height: "400px",
      background: "#fff",
      border: "1px solid #999",
      overflow: "auto",
      zIndex: 1000,
      padding: "8px"
    });
    document.body.appendChild(win);
    print(`Opened ${name}`, "success");
  }
};
