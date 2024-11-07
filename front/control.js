document.addEventListener("DOMContentLoaded", () => {
  fetchArticles();

  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));

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
        loginModal.hide();
        loginButton.disabled = true;
        loginButton.textContent = `Welcome, ${username}`;
        loginButton.classList.remove("btn-outline-secondary");
        loginButton.classList.add("btn-success");
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
