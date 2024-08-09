let _username = "";
const BACKEND_URL = "http://localhost:5000";

function signUp() {
  const username = document.querySelector("#username").value;
  const picture = document.querySelector("#picture").value;

  axios.post(`${BACKEND_URL}/sign-up`, {
    username,
    avatar: picture
  }).then(() => {
    _username = username;
    loadTweets();
  }).catch(err => {
    console.error(err);
    alert("Erro ao fazer cadastro! Consulte os logs.");
  });
}

function loadTweets() {
  let url = `${BACKEND_URL}/tweets`;

  axios.get(url).then(res => {
    const tweets = res.data;
    let tweetsHtml = '';

    for (const tweet of tweets) {
      tweetsHtml += Tweet(tweet);
    }

    document.querySelector(".tweets-page .tweets").innerHTML = tweetsHtml;
    document.querySelector(".pagina-inicial").classList.add("hidden");
    document.querySelector(".tweets-page").classList.remove("hidden");
  });
}

function Tweet({ _id, avatar, username, tweet }) {
  return `
    <div class="tweet">
      <div class="avatar">
        <img src="${avatar}" />
      </div>
      <div class="content">
        <div class="user">
          @${username}
        </div>
        <div class="body">
          ${escapeHtml(tweet)}
        </div>
      </div>
      ${insertButtonToEditOrDelete(_id, username)}
    </div>
  `
}

function insertButtonToEditOrDelete(id, username) {
  if (username === _username) return `
    <div class="delete" onclick="deleteThisTweet('${id}')">❌</div>
    <div class="edit" onclick="editThisTweet('${id}')">✏️</div>
  `;

  return "";
}

function deleteThisTweet(id) {
  axios.delete(`${BACKEND_URL}/tweets/${id}`)
    .then(res => {
      alert("Tweet deletado com sucesso!");
      loadTweets();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao deletar tweet! Consulte os logs.")
    });
}

function editThisTweet(id) {
  const newTweet = prompt("Insira o novo conteúdo do tweet:");
  axios.put(`${BACKEND_URL}/tweets/${id}`, {
    username: _username,
    tweet: newTweet
  }).then(res => {
    alert("Tweet editado com sucesso!");
    loadTweets();
  }).catch(err => {
    console.error(err);
    alert("Erro ao editar tweet! Consulte os logs.")
  })
}

function postTweet() {
  const tweet = document.querySelector("#tweet").value;
  axios.post(`${BACKEND_URL}/tweets`, {
    tweet,
    username: _username,
  })
    .then(() => {
      document.querySelector("#tweet").value = "";
      loadTweets();
    }).catch(err => {
      console.error(err);
      alert("Erro ao fazer tweet! Consulte os logs.")
    })
}

function loadUserTweets(username) {
  axios.get(`${BACKEND_URL}/tweets/${username}`).then(res => {
    const tweets = res.data;
    let tweetsHtml = '';

    for (const tweet of tweets) {
      tweetsHtml += Tweet(tweet);
    }

    document.querySelector(".user-tweets-page .tweets").innerHTML = tweetsHtml;
    document.querySelector(".tweets-page").classList.add("hidden");
    document.querySelector(".user-tweets-page").classList.remove("hidden");
  })
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
