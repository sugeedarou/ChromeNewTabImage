loadBackgroundImage()

let backgrounds = []
let maxPreloadedImagesCount = 5;

function loadBackgroundImage() {
    chrome.storage.local.get('backgrounds', async (result) => {
        if (typeof result.backgrounds == 'undefined') {
            document.getElementById('loading').style.display = 'block'
            await preloadImages()
            addImageToPage(backgrounds[0])
            document.getElementById('loading').style.display = 'none'
        } else {
            backgrounds = result.backgrounds
            bgImg = backgrounds[0]
            addImageToPage(bgImg)
            // rotate images
            backgrounds.push(backgrounds[0])
            backgrounds.shift()
            chrome.storage.local.set({ backgrounds }, () => {
                preloadImages()
            })
        }
    })
}

async function preloadImages() {
    let date = new Date()
    // offset makes it less likely to get the same pictures
    let iOffset = date.getSeconds() * 1000 + date.getMilliseconds()
    for (let i = backgrounds.length; i < maxPreloadedImagesCount + 1; i++) {
        await preloadImage(i + iOffset)
    }
    chrome.storage.local.set({ backgrounds })
}

async function preloadImage(i) {
    let data = await fetch(`https://source.unsplash.com/2560x1600/?nature&sig=${i}`)
    let img = new Image()
    img.src = data.url
    if (backgrounds.length < maxPreloadedImagesCount) {
        backgrounds.push(img.src)
    } else {
        backgrounds.shift()
        backgrounds.push(img.src)
    }
}

function addImageToPage(src) {
    const bg = document.getElementById('background')
    const img = document.createElement('img')
    img.src = src
    img.addEventListener('load', () => {
        bg.style.backgroundImage = `url(${img.src})`
        bg.classList.add('loaded')
    })
}