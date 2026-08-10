// https://status.cafe/current-status.js?name=aezi
// .status.json
// double check

fetch("./status.json")
    .then(r => r.json())
    .then(r => {
        const usernameEl = document.getElementById("statuscafe-username");
        const contentEl = document.getElementById("statuscafe-content");

        if (!usernameEl || !contentEl) return;

        if (!r.content || !r.content.length) {
            contentEl.innerHTML = "No status yet.";
            return;
        }

        // Injects text with Bulma inline helpers (has-text-link keeps your username colored blue)
        usernameEl.innerHTML = '<a href="https://status.cafe/users/aezi" target="_blank" class="has-text-link has-text-weight-bold">' + r.author + '</a> ' + r.face + ' <span class="status-date is-size-7 ml-1">' + r.timeAgo + '</span>';
        contentEl.innerHTML = r.content;
    })
    .catch(err => {
        console.error("Error reading status.json:", err);
        document.getElementById("statuscafe-content").innerHTML = "Status momentarily offline.";
    });
