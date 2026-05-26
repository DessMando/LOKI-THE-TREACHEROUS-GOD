import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import "./style.css"
import { Game } from "./game/core/Game.ts";

window.addEventListener("load", () => {
   new Game();
   const loadingScreen = document.getElementById("loadingScreen");
   if (loadingScreen) {
       loadingScreen.remove();
   }
});