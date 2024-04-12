module.exports = function (url, params) {
    const { fork } = require("child_process");
    // Spawn the child process
    const pekuaChild = fork(__dirname + "/engine/pekuaChild.js", [
      url,
      params = JSON.stringify({...params}),
    ]);
  try {
    const notifications = [];
    pekuaChild.defaultMaxListeners = 15;
    // Listen for messages from the child process
    pekuaChild.on("message", (notification) => {
      console.log("Notification from child process:", notification);
      notifications.push(notification);
    });
    pekuaChild.on("spawn", () => {
      pekuaChild.emit("message", "started successfully!");
    });
    pekuaChild.on("error", (error) => {
      pekuaChild.emit("message", "found error!", error);
    });
    // Handle child process exit
    pekuaChild.on("exit", (code) => {
      pekuaChild.emit("message", "process closing! with code " + code);
      // console.log("Child process exited with code", code);
    });
  } catch (error) {
    console.log("error ===>>", error);
    pekuaChild.emit("error", error);
  }
};
