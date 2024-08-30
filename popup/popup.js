document.getElementById('saveSession').addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      const tabUrls = tabs.map(tab => tab.url);
      chrome.storage.local.set({ savedSession: tabUrls }, () => {
        alert('Session saved!');
      });
    });
  });
  
  document.getElementById('restoreSession').addEventListener('click', () => {
    chrome.storage.local.get('savedSession', data => {
      const tabUrls = data.savedSession || [];
      tabUrls.forEach(url => chrome.tabs.create({ url }));
    });
  });
  
  document.getElementById('searchInput').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
  
    // Search open tabs
    chrome.tabs.query({ currentWindow: true }, tabs => {
      const results = tabs.filter(tab =>
        tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
      );
  
      results.forEach(tab => {
        const tabItem = document.createElement('div');
        tabItem.textContent = tab.title;
        tabItem.style.cursor = 'pointer';
        tabItem.style.margin = '5px 0';
        tabItem.addEventListener('click', () => {
          chrome.tabs.update(tab.id, { active: true });
        });
        resultsContainer.appendChild(tabItem);
      });
  
      if (results.length === 0) {
        const noResultsItem = document.createElement('div');
        noResultsItem.textContent = 'No matching open tabs found.';
        resultsContainer.appendChild(noResultsItem);
      }
    });
  
    // Search closed tabs
    chrome.storage.local.get('closedTabs', data => {
      const closedTabs = data.closedTabs || [];
      const matchingClosedTabs = closedTabs.filter(url => url.toLowerCase().includes(query));
  
      matchingClosedTabs.forEach(url => {
        const closedTabItem = document.createElement('div');
        closedTabItem.textContent = url;
        closedTabItem.style.cursor = 'pointer';
        closedTabItem.style.margin = '5px 0';
        closedTabItem.style.color = 'gray';
        closedTabItem.className = 'closed-tab';
        closedTabItem.addEventListener('click', () => {
          chrome.tabs.create({ url: url });
        });
        resultsContainer.appendChild(closedTabItem);
      });
  
      if (matchingClosedTabs.length === 0 && resultsContainer.innerHTML === '') {
        const noResultsItem = document.createElement('div');
        noResultsItem.textContent = 'No matching tabs found.';
        noResultsItem.className = 'no-results';
        resultsContainer.appendChild(noResultsItem);
      }
    });
  });
  
  
  // Listen for tab closures and store the closed tab URLs
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.tabs.get(tabId, closedTab => {
      chrome.storage.local.get(['closedTabs', 'savedSession'], data => {
        const closedTabs = data.closedTabs || [];
        closedTabs.push(closedTab.url);
        chrome.storage.local.set({ closedTabs: closedTabs });
      });
    });
  });

  