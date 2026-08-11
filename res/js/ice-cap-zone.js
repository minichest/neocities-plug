let currentBlogPage = 1;
const entriesPerPage = 3; 
let parsedBlogEntries = [];

async function initializeBlogFeed() {
  const container = document.getElementById('xml-blog-feed');
  const heroTitle = document.querySelector('.xml-fetched-title');
  const heroSubtitle = document.querySelector('.xml-fetched-subtitle');
  if (!container) return;
  
  try {
    const response = await fetch('feed.xml');
    if (!response.ok) throw new Error('Failed to resolve server feed path reference');
    const textData = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textData, 'text/xml');
    
    // FIXED/ADDED: Scrapes official channel metadata directly out of your Atom head elements
    const feedTitle = xmlDoc.querySelector('feed > title')?.textContent || 'ice cap zone';
    const feedSubtitle = xmlDoc.querySelector('feed > subtitle')?.textContent || '';
    
    // Inject the XML details straight into your hero layout elements text strings
    if (heroTitle) heroTitle.innerText = feedTitle.toLowerCase();
    if (heroSubtitle) heroSubtitle.innerText = feedSubtitle.toLowerCase();

    const entries = xmlDoc.getElementsByTagName('entry');
    parsedBlogEntries = []; 
    
    Array.from(entries).forEach(entry => {
      const title = entry.getElementsByTagName('title')?.textContent || 'Untitled Log';
      
      const linkTags = entry.getElementsByTagName('link');
      let url = '#';
      if (linkTags && linkTags.length > 0) {
        url = linkTags[0].getAttribute('href') || '#';
      }
      
      const dateRaw = entry.getElementsByTagName('updated')?.textContent || '';
      const contentRaw = entry.getElementsByTagName('content')?.textContent || '';
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentRaw;
      const cleanTextContent = tempDiv.textContent || tempDiv.innerText || '';
      const shortExcerpt = cleanTextContent.split(' ').slice(0, 22).join(' ') + '...';
      
      parsedBlogEntries.push({
        title: title,
        url: url,
        date: dateRaw,
        excerpt: shortExcerpt
      });
    });
    
    renderPageSlice();
    setupPaginationControls();

  } catch (error) {
    console.error('Error fetching file attributes stream:', error);
    container.innerHTML = `<p class="is-size-7 has-text-danger font-pixel">Error 404: Subdirectory parsing link broken. Failed to compile Atom metadata loops.</p>`;
    if (heroTitle) heroTitle.innerText = "timeline glitch";
    if (heroSubtitle) heroSubtitle.innerText = "connection lost.";
  }
}

function renderPageSlice() {
  const container = document.getElementById('xml-blog-feed');
  container.innerHTML = '';
  
  if (parsedBlogEntries.length === 0) {
    container.innerHTML = `<p class="is-size-7 has-text-grey font-pixel">No active universe timelines detected in this feed layer.</p>`;
    return;
  }
  
  const startIdx = (currentBlogPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const pageItems = parsedBlogEntries.slice(startIdx, endIdx);
  
  pageItems.forEach(post => {
    let formattedDate = 'Unknown Date';
    if (post.date) {
      formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric'
      });
    }
    
    const article = document.createElement('article');
    article.className = 'blog-summary-item';
    article.innerHTML = `
      <a href="${post.url}" class="blog-post-link">${post.title.toLowerCase()}</a>
      <div class="blog-meta-text">
        <span>Date: ${formattedDate}</span> &nbsp;|&nbsp; <span>Category: logs</span>
      </div>
      <p class="blog-excerpt">${post.excerpt}</p>
    `;
    container.appendChild(article);
  });
}

function setupPaginationControls() {
  const totalPages = Math.ceil(parsedBlogEntries.length / entriesPerPage);
  const prevBtn = document.getElementById('blog-prev-btn');
  const nextBtn = document.getElementById('blog-next-btn');
  const listContainer = document.getElementById('blog-pagination-list');
  
  if (!listContainer) return;
  listContainer.innerHTML = '';
  
  if (currentBlogPage === 1) {
    prevBtn.setAttribute('disabled', 'true');
  } else {
    prevBtn.removeAttribute('disabled');
  }
  
  if (currentBlogPage === totalPages || totalPages === 0) {
    nextBtn.setAttribute('disabled', 'true');
  } else {
    nextBtn.removeAttribute('disabled');
  }
  
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    const isCurrent = i === currentBlogPage ? 'is-current custom-page-current' : 'custom-page-btn';
    
    li.innerHTML = `<a class="pagination-link ${isCurrent}" aria-label="Goto page ${i}">${i}</a>`;
    
    li.querySelector('a').addEventListener('click', () => {
      currentBlogPage = i;
      renderPageSlice();
      setupPaginationControls();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    listContainer.appendChild(li);
  }
}

document.getElementById('blog-prev-btn').addEventListener('click', (e) => {
  if (currentBlogPage > 1) {
    currentBlogPage--;
    renderPageSlice();
    setupPaginationControls();
  }
});

document.getElementById('blog-next-btn').addEventListener('click', (e) => {
  const totalPages = Math.ceil(parsedBlogEntries.length / entriesPerPage);
  if (currentBlogPage < totalPages) {
    currentBlogPage++;
    renderPageSlice();
    setupPaginationControls();
  }
});

document.addEventListener('DOMContentLoaded', initializeBlogFeed);
