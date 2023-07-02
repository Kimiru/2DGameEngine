import { ImageManipulator } from "./ImageManipulator.js"

export class TextureMapper {

    static map(modelIM: ImageManipulator, colorChartIM: ImageManipulator, textureIM: ImageManipulator): ImageManipulator {


        let outputIM = new ImageManipulator(modelIM.width, modelIM.height)

        for (let x = 0; x < modelIM.width; x++)
            for (let y = 0; y < modelIM.height; y++) {

                let modelColor = modelIM.getPixel(x, y)

                if (modelColor[3] == 0) continue

                // console.log(modelColor)

                let pixelLocation = TextureMapper.#findPixelWithColorInImage(colorChartIM, ...modelColor)

                // console.log(pixelLocation)

                if (!pixelLocation) continue

                let color = textureIM.getPixel(...pixelLocation)

                // console.log(color)

                outputIM.setPixelRGBA(x, y, ...color)

            }

        return outputIM

    }

    static #findPixelWithColorInImage(image: ImageManipulator, r: number, g: number, b: number, a: number): [number, number] | null {

        for (let x = 0; x < image.width; x++)
            for (let y = 0; y < image.height; y++) {

                let data = image.getPixel(x, y)

                if (data[3] == a && data[0] == r && data[1] == g && data[2] == b)
                    return [x, y]
            }

        return null
    }

    static downloadStandardColorChart(width: number, height: number) {

        if (width < 1 || width > 256 || height < 0 || height > 256) throw `Invalid dimensions`

        let im = new ImageManipulator(width, height)

        for (let r = 0; r < width; r++)
            for (let g = 0; g < height; g++) {

                let color = `rgb(${255 - r * 256 / width}, ${255 - g * 256 / height}, ${Math.max(r * 256 / width, g * 256 / height)})`

                console.log(r, g, color)

                im.setPixel(r, g, color)

            }

        im.download('colorchart')

    }

}