let loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  await logIn(username, password);
});

async function checkLogin() {
  let loggedIn = localStorage.getItem("loggedIn");
  if (!loggedIn) {
    let ip = await getIpAddress();
    return {
      userid: 0,
      username: "",
      password: "",
      role: "anon",
      osBrowser: navigator.userAgent,
      ip: ip,
    };
  } else {
    return JSON.parse(localStorage.getItem("user"));
  }
}

async function getIpAddress() {
  return fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => data.ip)
    .catch((error) => {
      console.error("Error fetching IP address:", error);
      return "Unknown IP";
    });
}

async function logIn(username, password) {
  let response = await fetch("http://localhost:3002/login", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password }),
  });

  if (!response.ok) {
    console.error("Login failed:", response.statusText);
    return { error: 1 };
  }

  const data = await response.json();
  if (data) {
    console.log("Login successful:", data);
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("user", JSON.stringify(data));
  } else {
    console.error("Login response error.");
    return { error: 1 };
  }
}
