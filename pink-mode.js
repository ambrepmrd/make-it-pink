var styleSheet

function createStyleSheet() {
    let styleElement = document.createElement("style")
    document.head.appendChild(styleElement)
    styleSheet = styleElement.sheet
}

createStyleSheet()




function applyRoseTint(element) {
    let computedStyle = getComputedStyle(element)
    let currentColorBg = computedStyle.backgroundColor
    let currentColorText = computedStyle.color

    // Stocke les couleurs initiales et crée une classe pour chaque élément
    element.dataset.initialColorBg = currentColorBg
    element.dataset.initialColorText = currentColorText

    let uniqueClass = "rose-tint-" + Math.random().toString(36).substring(2, 15)
    element.classList.add(uniqueClass)

    // Vérifie si la couleur de fond est en noir et blanc, ou un dégradé (n'applique pas si c'est en n&b)
    if (
        currentColorBg &&
        currentColorBg !== "rgba(0, 0, 0, 0)" &&
        !isBlackOrWhite(currentColorBg)
    ) {
        if (currentColorBg.includes("linear-gradient")) {
            let gradientMatch = currentColorBg.match(/linear-gradient\((.+)\)/)
            if (gradientMatch) {
                let gradientColors = gradientMatch[1].split(",")
                let newGradientColors = gradientColors.map(function (color) {
                    return convertColorToRoseTint(color.trim())
                })
                element.style.background =
                    "linear-gradient(" + newGradientColors.join(", ") + ")"
            }
        } else {
            // Extrait les valeurs RGB des couleurs de fond
            let rgbaMatch = extractRGBA(currentColorBg)
            if (rgbaMatch) {
                // Convertit le RGB en HSL, change la teinte pour un rose et retransforme en RGB pour l'appliquer
                let hslValuesBg = rgbToHsl(...rgbaMatch)
                hslValuesBg[0] = 330 / 360
                let modifiedRgbBg = hslToRgb(...hslValuesBg)
                element.style.backgroundColor = `rgba(${modifiedRgbBg[0]}, ${modifiedRgbBg[1]}, ${modifiedRgbBg[2]}, ${rgbaMatch[3]})`
            }
        }
    }

    // Modifie la couleur du texte s'il n'est pas en n&b
    if (!isBlackOrWhite(currentColorText)) {
        let rgbValuesText = extractRGBA(currentColorText)
        if (rgbValuesText) {
            let hslValuesText = rgbToHsl(...rgbValuesText)
            hslValuesText[0] = 330 / 360
            let modifiedRgbText = hslToRgb(...hslValuesText)
            element.style.color = `rgb(${modifiedRgbText[0]}, ${modifiedRgbText[1]}, ${modifiedRgbText[2]})`
        }
    }

    // Extrait les couleurs des pseudo-éléments ::before and ::after
    let pseudoelements = ["::before", "::after"]
    pseudoelements.forEach(function (pseudoelement) {
        let pseudoelementStyle = getComputedStyle(element, pseudoelement)
        let currentPseudoelementBgColor = pseudoelementStyle.backgroundColor

        // Modifie la couleur si elle n'est pas en n&b
        if (!isBlackOrWhite(currentPseudoelementBgColor)) {
            let rgbValuesPseudoelementBg = extractRGBA(
                currentPseudoelementBgColor
            )
            if (rgbValuesPseudoelementBg) {
                let hslValuesPseudoelementBg = rgbToHsl(
                    ...rgbValuesPseudoelementBg
                )
                hslValuesPseudoelementBg[0] = 330 / 360
                let modifiedRgbPseudoelementBg = hslToRgb(
                    ...hslValuesPseudoelementBg
                )

                let newRule = `
          .${uniqueClass}${pseudoelement} {
            background-color: rgb(${modifiedRgbPseudoelementBg[0]}, ${modifiedRgbPseudoelementBg[1]}, ${modifiedRgbPseudoelementBg[2]}) !important;
          }
        `
                styleSheet.insertRule(newRule, styleSheet.cssRules.length)
            }
        }
    })
}

function isBlackOrWhite(color) {
    let rgb = extractRGBA(color)
    if (rgb) {
        // Assume qu'une couleur est noire si ses valeurs RGB sont toutes en dessous de 50, et blanc si elles sont au dessus de 200
        return (
            (rgb[0] < 50 && rgb[1] < 50 && rgb[2] < 50) ||
            (rgb[0] > 200 && rgb[1] > 200 && rgb[2] > 200)
        )
    }
    return false
}

// Extrait les valeurs RGBA
function extractRGBA(colorString) {
    let match = colorString.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/
    )
    if (match) {
        return [
            parseInt(match[1]),
            parseInt(match[2]),
            parseInt(match[3]),
            parseFloat(match[4] || 1),
        ]
    }
    return null
}

// Transforme les couleurs en rose
function convertColorToRoseTint(colorString) {
    let rgb = extractRGBA(colorString)
    if (rgb) {
        let hsl = rgbToHsl(...rgb)
        hsl[0] = 330 / 360
        let newRgb = hslToRgb(...hsl)
        return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`
    }
    return colorString
}

// Convertit une couleur RGB en HSL
function rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    let max = Math.max(r, g, b)
    let min = Math.min(r, g, b)
    let h,
        s,
        l = (max + min) / 2

    if (max === min) {
        h = s = 0 // achromatic
    } else {
        let d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }

    return [h, s, l]
}

// Convertit une couleur HSL en RGB
function hslToRgb(h, s, l) {
    let r, g, b

    if (s === 0) {
        r = g = b = l
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s
        let p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Récupère la couleur d'arrière-plan d'un parent
function getValidParentBackgroundColor(element) {
    let parent = element.parentElement

    while (parent) {
        let parentColor = getComputedStyle(parent).backgroundColor
        if (parentColor && parentColor !== "rgba(0, 0, 0, 0)") {
            return parentColor
        }
        parent = parent.parentElement
    }

    return null
}

// Déclare la variable observer globalement
var pinkModeObserver

// Observe les mutations du DOM
function observeDomMutations() {
    // Création d'une instance de MutationObserver
    pinkModeObserver = new MutationObserver(function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                // Parcourt des nœuds ajoutés
                for (let addedNode of mutation.addedNodes) {
                    // Vérifie si l'élément est de type HTMLElement
                    if (addedNode instanceof HTMLElement) {
                        // Appelle la fonction applyRoseTint sur l'élément ajouté
                        applyRoseTint(addedNode)
                    }
                }
            }
        }
    })

    // Configuration de l'observation pour détecter les ajouts de nœuds dans le DOM
    let observerConfig = { childList: true, subtree: true }

    // Démarrage de l'observation du DOM avec la configuration spécifiée
    pinkModeObserver.observe(document.body, observerConfig)
}


var allElements = document.querySelectorAll("*")
for (let element of allElements) {
    applyRoseTint(element)
}



observeDomMutations()
