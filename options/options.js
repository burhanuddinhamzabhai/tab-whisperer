document.addEventListener('DOMContentLoaded', () => {
    const autoGroupTabsCheckbox = document.getElementById('autoGroupTabs');
  
    chrome.storage.sync.get('autoGroupTabs', data => {
      autoGroupTabsCheckbox.checked = data.autoGroupTabs || false;
    });
  
    autoGroupTabsCheckbox.addEventListener('change', () => {
      chrome.storage.sync.set({ autoGroupTabs: autoGroupTabsCheckbox.checked });
    });
  });
  