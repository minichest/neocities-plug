// /res/js/ice-cap-zone.js
document.addEventListener("DOMContentLoaded", () => {
  // Target configuration data streams
  const FEED_URL = "/ice-cap-zone/feed.xml";
  const POSTS_PER_PAGE = 5;
  let currentActivePage = 1;
  let parsedBlogPosts = [];

  // DOM node connection points
  const titleContainer = document.querySelector(".xml-fetched-title");
  const subtitleContainer = document.querySelector(".xml-fetched-subtitle");
  const feedStreamContainer = document.getElementById("xml-blog-feed");
  const prevBtn = document.getElementById("blog-prev-btn");
  const nextBtn = document.getElementById("blog-next-btn");
  const paginationList = document.getElementById("blog-pagination-list");

  // Step 1: Query the Atom XML over the network
  fetch(FEED_URL)
    .then(response => {
      if (!response.ok) throw new Error("Timeline timeline track broke down.");
      return response.text();
    })
    .then(xmlString => {
      // Step 2: Use native DOMParser to convert string data to an XML DOM structure
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Extract general workspace stream variables
      const feedTitle = xmlDoc.querySelector("feed > title")?.textContent || "ice cap zone";
      const feedSubtitle = xmlDoc.querySelector("feed > subtitle")?.textContent || "logs timeline archive";
      
      // Update your centered hero tags instantly
      titleContainer.textContent = feedTitle.toLowerCase();
      subtitleContainer.textContent = feedSubtitle.toLowerCase();

      // Step 3: Loop through individual entry tags
      const entries = xmlDoc.querySelectorAll("entry");
      entries.forEach(entry => {
        const title = entry.querySelector("title")?.textContent || "untitled log";
        const rawUrl = entry.querySelector("link")?.getAttribute("href") || "#";
        const rawDate = entry.querySelector("updated")?.textContent || "";
        
        // Parse raw content block data nodes cleanly
        const htmlContent = entry.querySelector("content")?.textContent || "...";

        // Isolate post-name.html from the absolute URL if necessary
        const fallbackSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const cleanUrl = rawUrl !== "#" ? rawUrl : `/ice-cap-zone/${fallbackSlug}.html`;

        // Format dates to look uniform
        let formattedDate = "Unknown Date";
        if (rawDate) {
          const dateObj = new Date(rawDate);
          formattedDate = dateObj.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
        }

        // Push data record directly to memory workspace arrays
        parsedBlogPosts.push({
          title: title.toLowerCase(),
          url: cleanUrl,
          date: formattedDate,
          summary: htmlContent
        });
      });

      // Initialize render timeline grid arrays
      renderTimelineView();
    })
    .catch(error => {
      console.error(error);
      feedStreamContainer.innerHTML = `<p class="has-text-danger font-pixel">ERR: timeline link sync failure</p>`;
    });

  // Step 4: Pagination Slice Mapping Logic
  function renderTimelineView() {
    feedStreamContainer.innerHTML = "";

    if (parsedBlogPosts.length === 0) {
      feedStreamContainer.innerHTML = `<p class="is-size-7 font-pixel has-text-grey">No historical logs parsed.</p>`;
      return;
    }

    // Slice records to isolate just the target index page segment
    const startIdx = (currentActivePage - 1) * POSTS_PER_PAGE;
    const endIdx = startIdx + POSTS_PER_PAGE;
    const itemsToDisplay = parsedBlogPosts.slice(startIdx, endIdx);

    // Loop data properties directly into clean Bulma layout rows
    itemsToDisplay.forEach(post => {
      const article = document.createElement("article");
      article.className = "media p-4 my-3";
      article.style.cssText = "border-left: 4px solid #00d1b2; background-color: #fafafa; border-radius: 4px;";
      
      article.innerHTML = `
        <div class="media-content">
          <div class="content">
            <p>
              <strong><a class="has-text-link is-size-5" href="${post.url}">${post.title}</a></strong>
              <br>
              <small class="has-text-grey">Date: ${post.date} | Category: logs</small>
            </p>
            <div class="is-size-6 mt-2">${post.summary}</div>
          </div>
        </div>
      `;
      feedStreamContainer.appendChild(article);
    });

    updatePaginationControls();
  }

  // Step 5: Adjust Button Toggles on Change
  function updatePaginationControls() {
    const totalPages = Math.ceil(parsedBlogPosts.length / POSTS_PER_PAGE) || 1;
    
    // Toggle active status configurations
    prevBtn.disabled = currentActivePage === 1;
    nextBtn.disabled = currentActivePage === totalPages;

    if (currentActivePage === 1) prevBtn.setAttribute("disabled", "true");
    else prevBtn.removeAttribute("disabled");

    if (currentActivePage === totalPages) nextBtn.setAttribute("disabled", "true");
    else nextBtn.removeAttribute("disabled");

    // Clear and draw page list items
    paginationList.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = `pagination-link ${i === currentActivePage ? 'is-current' : ''}`;
      a.textContent = i;
      a.addEventListener("click", () => {
        currentActivePage = i;
        renderTimelineView();
      });
      li.appendChild(a);
      paginationList.appendChild(li);
    }
  }

  // Navigation Click listeners
  prevBtn.addEventListener("click", () => {
    if (currentActivePage > 1) {
      currentActivePage--;
      renderTimelineView();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(parsedBlogPosts.length / POSTS_PER_PAGE);
    if (currentActivePage < totalPages) {
      currentActivePage++;
      renderTimelineView();
    }
  });
});
