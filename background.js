chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ autoGroupTabs: true });
  });
  
  chrome.tabs.onCreated.addListener(tab => {
    chrome.storage.sync.get('autoGroupTabs', data => {
      if (data.autoGroupTabs) {
        chrome.tabs.query({ windowId: tab.windowId }, tabs => {
          const domainGroups = {};
  
          tabs.forEach(t => {
            const url = new URL(t.url);
            const domain = url.hostname;
  
            if (!domainGroups[domain]) {
              domainGroups[domain] = [];
            }
            domainGroups[domain].push(t);
          });
  
          Object.values(domainGroups).forEach(group => {
            if (group.length > 1) {
              const groupId = group[0].groupId || -1;
  
              if (groupId === -1) {
                chrome.tabs.group({ tabIds: group.map(t => t.id) }, newGroupId => {
                  chrome.tabGroups.update(newGroupId, { title: group[0].url.hostname });
                });
              } else {
                chrome.tabs.group({ tabIds: group.map(t => t.id), groupId });
              }
            }
          });
        });
      }
    });
  });
  
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.tabs.get(tabId, tab => {
      if (tab && !removeInfo.isWindowClosing) {
        chrome.storage.local.get(['closedTabs', 'savedSession'], data => {
            const closedTabs = data.closedTabs || [];
            const savedSession = data.savedSession || [];
    
            closedTabs.push(tab.url);
            chrome.storage.local.set({ closedTabs });
    
            // Optional: Update saved session to include tab groups
            savedSession.push({ url: tab.url});
            chrome.storage.local.set({ savedSession });
          });
      }
    });
  });
  

  function suspendTab(tabId) {
    chrome.tabs.discard(tabId);
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
      setTimeout(() => suspendTab(tabId), 300000);
    }
  });
  
  chrome.commands.onCommand.addListener(command => {
    if (command === "suspend-all-tabs") {
      chrome.tabs.query({ currentWindow: true, active: false }, tabs => {
        tabs.forEach(tab => suspendTab(tab.id));
      });
    }
  });
  