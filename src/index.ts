import("./setup").then(() => {
  const startButton = document.querySelector("#start") as HTMLButtonElement;
  startButton.removeAttribute("disabled");
});
