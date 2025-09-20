window.commands = window.commands || {};

(function () {
  const htmlFiles = {};

  // Handle drag-and-drop HTML files
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", async (e) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.name.endsWith(".html")) {
        const content = await file.text();
        htmlFiles[file.name] = content;
        print(`Loaded ${file.name}`, "success");
      } else {
        print(`Skipped non-HTML file: ${file.name}`, "warn");
      }
    }
  });

  // Add 'gui' command
  window.commands.gui = {
    desc: "Run .html files in a movable window. Usage: gui run filename.html",
    fn(args, print) {
      const subcmd = args[0];
      const filename = args[1];

      if (subcmd !== "run" || !filename) {
        print("Usage: gui run filename.html", "error");
        return;
      }

      const content = htmlFiles[filename];
      if (!content) {
        print(`File not loaded: ${filename}`, "error");
        return;
      }

      const container = document.createElement("div");
      container.style = `
        position: fixed;
        top: 60px;
        left: 60px;
        width: 640px;
        height: 480px;
        border: 1px solid #666;
        background: white;
        resize: both;
        overflow: auto;
        box-shadow: 0 0 12px rgba(0,0,0,0.6);
        z-index: 9999;
      `;
      container.innerHTML = `
        <div style="
          background: #444;
          color: white;
          padding: 6px 12px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
        ">
          <span>GUI: ${filename}</span>
          <button style="background: red; color: white; border: none; padding: 2px 6px; cursor: pointer;">✖</button>
        </div>
        <iframe style="border: none; width: 100%; height: calc(100% - 30px);" srcdoc=""></iframe>
      `;

      // Load content into iframe
      const iframe = container.querySelector("iframe");
      iframe.srcdoc = content;

      // Close button
      container.querySelector("button").onclick = () => {
        container.remove();
      };

      // Make draggable
      makeDraggable(container);

      document.body.appendChild(container);
    }
  };

  // Draggable utility
  function makeDraggable(element) {
    const header = element.firstElementChild;
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }
})();
