const sharp = require('sharp')

const helperImg = (filePath, size = 300) =>{
    return sharp(filePath)
    .resize(size)
    .toFile(`./img/optimize/${filename}`)
}

const imgOptimize = sharp({helperImg})
exports.imgOptimize =  async(filePath, size = 300) => {}