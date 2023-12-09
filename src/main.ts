import './style.css';

const storedTheme = typeof localStorage !== "undefined" && localStorage.getItem("theme");
const theme = storedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

const root = document.documentElement;

if ((theme === "dark" && root.classList.contains("dark")) || (theme === "light" && !root.classList.contains("dark"))) {

}
else {
  root.classList.toggle("dark", theme === "dark");
}
