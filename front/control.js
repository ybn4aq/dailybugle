document.addEventListener("DOMContentLoaded", () => {
  fetchArticles();

  const user = checkLogIn();
  if (user) {
    userLoggedIn(user.username);
    console.log("User data:", user);
  }

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const ip = await getIpAddress();
        const user = {
          username: data.username,
          password: data.password,
          role: data.role,
          ip: ip,
          info: navigator.userAgent,
        };
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Stored user:", localStorage.getItem("user"));
        userLoggedIn(data.username);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

async function fetchArticles() {
  try {
    const response = await fetch("http://localhost:3002/articles");
    const articles = await response.json();
    const articlesContainer = document.getElementById("articles");

    articlesContainer.innerHTML = articles
      .map(
        (article) => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${article.title}</h5>
          <p class="card-text">${article.content}</p>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}

function checkLogIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user || null;
}

function userLoggedIn(username) {
  const loginButton = document.getElementById("login-button");
  const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
  
  if (loginModal) {
    loginModal.hide();
  }

  loginButton.disabled = true;
  loginButton.textContent = `Welcome, ${username}`;
  loginButton.classList.remove("btn-outline-secondary");
  loginButton.classList.add("btn-success");
}

async function getIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "Unknown IP";
  }
}
