// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);

if (localStorage) {
    const darkStorage = localStorage.getItem("dark-mode");
	if (!darkStorage) {
        document.body.classList.add("dark");
	} else if (`${darkStorage}` === "true") {
        document.body.classList.add("dark");
	} else {
        document.body.classList.remove("dark");
	}
}

// if (import.meta.env.PROD && "serviceWorker" in navigator) {
//   // Use the window load event to keep the page load performant
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register(`/sw.js`);
//   });
// }
