function removePinkTint(element) {
    // Récupère les couleurs initiales stockées et les restaure
    let initialColorBg = element.dataset.initialColorBg
    let initialColorText = element.dataset.initialColorText

    // Vérifie que les couleurs initiales sont définies
    if (initialColorBg && initialColorText) {
        element.style.backgroundColor = initialColorBg
        element.style.color = initialColorText
    }

    // Supprime la casse si elle commence par 'rose-tint-'
    for (let i = element.classList.length - 1; i >= 0; i--) {
        let className = element.classList[i]
        if (className.startsWith("rose-tint-")) {
            element.classList.remove(className)
        }
    }
}

// Arrête d'observer les mutations du DOM
function stopObserving() {
    if (pinkModeObserver) {
        pinkModeObserver.disconnect()
    }
}

var allElements = document.querySelectorAll("*")
for (let element of allElements) {
    removePinkTint(element)
}

for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
    let rule = styleSheet.cssRules[i]
    if (rule.selectorText && rule.selectorText.includes("rose-tint-")) {
        styleSheet.deleteRule(i)
    }
}

var styleElement = document.getElementById("pinkModeStyleSheet")
if (styleElement) {
    styleElement.parentNode.removeChild(styleElement)
}

stopObserving()
