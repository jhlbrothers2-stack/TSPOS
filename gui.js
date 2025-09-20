// gui.js — TSPOS GUI package

if (!window.commands) window.commands = {};
if (!window.htmlFiles) window.htmlFiles = {};

window.commands.gui = {
  desc: "Run HTML GUI: gui run <file.html>",
  fn: (args, print) => {
    if (!args || args.length < 2 || args[0] !== "run") {
      print("Usage: gui run <filename.html>");
      return;
    }

    const filename = args[1];
    const html = window.htmlFiles[filename];

    if (!html) {
      print(`HTML file not found: ${filename}`, "error");
      return;
    }

    const win = document.createElement("div");
    win.style.position = "fixed";
    win.style.top = "100px";
    win.style.left = "100px";
    win.style.width = "600px";
    win.style.height = "400px";
    win.style.border = "1px solid #ccc";
    win.style.background = "#fff";
    win.style.boxShadow = "0 0 12px rgba(0,0,0,0.5)";
    win.style.zIndex = 10000;
    win.style.overflow = "hidden";

    const bar = document.createElement("div");
    bar.style.background = "#444";
    bar.style.color = "#fff";
    bar.style.padding = "6px 12px";
    bar.style.fontWeight = "bold";
    bar.style.cursor = "move";
    bar.style.display = "flex";
    bar.style.justifyContent = "space-between";
    bar.innerText = filename;

    const close = document.createElement("button");
    close.innerText = "×";
    close.style.background = "red";
    close.style.color = "white";
    close.style.border = "none";
    close.style.cursor = "pointer";
    close.style.marginLeft = "auto";
    close.onclick = () => win.remove();
    bar.appendChild(close);

    win.appendChild(bar);

    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "calc(100% - 30px)";
    iframe.style.border = "none";
    iframe.srcdoc = html;

    win.appendChild(iframe);
    document.body.appendChild(win);

    // Dragging logic
    let dragging = false, offsetX, offsetY;
    bar.addEventListener("mousedown", e => {
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      document.body.style.userSelect = "none";
    });
    document.addEventListener("mousemove", e => {
      if (!dragging) return;
      win.style.left = e.clientX - offsetX + "px";
      win.style.top = e.clientY - offsetY + "px";
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
      document.body.style.userSelect = "";
    });

    print(`GUI opened: ${filename}`, "success");
  }
};
