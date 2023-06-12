let extensionState = "OFF"

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "",
    })
})

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith("chrome://")) {
        return // ignore les onglets avec des URLs commençant par "chrome://"
    }

    extensionState = extensionState === "ON" ? "OFF" : "ON"

    if (extensionState === "ON") {
        await chrome.action.setIcon({
            tabId: tab.id,
            path: {
                16: "images/icon-16.png",
                32: "images/icon-32.png",
                48: "images/icon-48.png",
                128: "images/icon-128.png",
            },
        })
        // lance le CSS
        await chrome.scripting.executeScript({
            files: ["pink-mode.js"],
            target: { tabId: tab.id },
        })
    } else if (extensionState === "OFF") {
        await chrome.action.setIcon({
            tabId: tab.id,
            path: {
                16: "images/iconnb-16.png",
                32: "images/iconnb-32.png",
                48: "images/iconnb-48.png",
                128: "images/iconnb-128.png",
            },
        })
        // enlève le CSS et remet la page comme elle est censée être
        await chrome.scripting.executeScript({
            files: ["remove-pink.js"],
            target: { tabId: tab.id },
        })
    }
})
