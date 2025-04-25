---
title: 'Pin Printout Maker'
---

<script setup>
import { ref } from 'vue'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Image, Shape } from 'image-js'

// (<any>pdfMake).addVirtualFileSystem(pdfFonts);

const image_data = ref('')
const image_data_transformed = ref('')

const pdf_src = ref('');

const onChangeFile = async (e) => {
    console.log(e.target)
    const file = e.target.files[0]

    const reader = new FileReader();
    reader.addEventListener("load", () => {
        image_data.value = reader.result
    },
    false
    );

    if (file) {
        await reader.readAsDataURL(file);
    }
}

const transform_image = async () => {
    const image = await Image.load(image_data.value)
    const total_size = 1.875 * 72 * 4;
    const inner_size = 1.25 * 72 * 4;
    const margin_size = total_size - inner_size;
    const cut_size = total_size;

    let mask = new Shape({shape: 'circle', size: cut_size}).getMask()
    let out_image = image.resize({width: inner_size, height: inner_size}).pad({size: margin_size / 2}).setChannel(3, mask.colorDepth(8))
    console.log(out_image.bitDepth)
    out_image = out_image
    return out_image.toBuffer()
}

const print = async () => {
    const pdf = await PDFDocument.create()

    const image_embedded = await pdf.embedPng(await transform_image());

    const page = pdf.addPage()
    const { width, height } = page.getSize()
    console.log(page)
    const row_col_to_x_y = (row, col) => {
        return [
            col * ((2 * 72 * 7) / 8.0),
            //(row + (col % 2 == 0) ? 0 : 0.5) * 2 * 72
            (row + (col % 2 == 0 ? 0 : 0.5)) * 2 * 72
        ]
    }
    let col = 0;
    let [x,y] = row_col_to_x_y(10,10);
    console.log(x,y);
    do {
        let row = 0;
        do {
            let [x,y] = row_col_to_x_y(row, col)
            page.drawImage(image_embedded, {
                x: x + 72/2,
                y: y + 72/2,
                width: 1.875 * 72,
                height: 1.875 * 72
            })
            row++;
        }
        while (row < 5)
        col++;
    }
    while (col < 4)

    const pdfBytes = await pdf.save()
    let file = new Blob([pdfBytes], {type: 'application/pdf'});
    var fileURL = URL.createObjectURL(file)
    pdf_src.value = fileURL;
    window.open(fileURL)
    console.log(file)
}

</script>

# Pin Printout Maker

<input type="file" @change="onChangeFile" accept="image/*"/>

<button @click=print>Get PDF</button>

<div :style="'width: 100%; min-height=1000px'">
<iframe v-bind:src="pdf_src" :style="'width: 100%; min-height=100%'"/>
</div>
