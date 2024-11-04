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
    return localStorage.getItem("user");
  }
}

async function getIpAddress() {
  return fetch("https://api.ipify.org?format=json")
    .then((response) => response.json)
    .then((data) => data.ip);
}

// Sends auth request to back end server, instantiating user localStorage item if successful
async function logIn(username, password) {
  let response = await fetch("127.0.0.1/login", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password }),
  });
  if (!response) {
    return { error: 1 };
  } else {
    console.log(response);
    // TODO: Update local storage item
  }
}
