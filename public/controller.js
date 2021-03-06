function analysisImg() {
    if (fileSelect.files.length == 0) {
        alert("終了");
        return;
    }
    let colorFormat = document.getElementById('colorFormat');

    switch (colorFormat.value) {
        case "RGB":
            analysisRGB();
            break;
        case "HSV":
            analysisHSV();
            break;
        case "YUV":
            analysisYUV();
            break;
        default:
    }
    drawHistgram();
}

function makeBinCount(binArr, histgramIndex, binNumber) {
    let binRange = COLOR_RANGE / binNumber;

    for (i = 0; i < binNumber; i++) {
        binArr[i] = 0;
    }

    for (i = 0; i < COLOR_RANGE; i++) {
        binArr[Math.floor(i / binRange)] += compArr[histgramIndex][i];
    }
}

function isOperationTypeColorPix() {
    let value = document.getElementById("operationTypeId").operationType.value;
    if (value == "colorPix") return true;
    else return false;
}

function analysisRGB() {
    const rCvs = document.getElementById("colorComponent1Img");
    const gCvs = document.getElementById("colorComponent2Img");
    const bCvs = document.getElementById("colorComponent3Img");
    let binNumberId = document.getElementById('binNumberId');
    let rCtx = rCvs.getContext("2d");
    let gCtx = gCvs.getContext("2d");
    let bCtx = bCvs.getContext("2d");
    let rDst = rCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let gDst = gCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let bDst = bCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let src = imageData;

    for (let i = 0; i < toneArrR.length; ++i) {
        compArr[COLOR.R][i] = 0;
        compArr[COLOR.G][i] = 0;
        compArr[COLOR.B][i] = 0;
    }

    for (let i = 0; i < src.data.length; i = i + 4) {
        let rValue;
        let gValue;
        let bValue;
        let rgbArr = new Array();

        calcTone(rgbArr, src.data[i], src.data[i + 1], src.data[i + 2], binNumberId.value, false);

        // R成分
        rDst.data[i] = rgbArr[COLOR.R];
        rDst.data[i + 1] = rDst.data[i + 2] = 0
        rDst.data[i + 3] = src.data[i + 3]

        // G成分
        gDst.data[i + 1] = rgbArr[COLOR.G];
        gDst.data[i] = gDst.data[i + 2] = 0
        gDst.data[i + 3] = src.data[i + 3]

        // B成分
        bDst.data[i + 2] = rgbArr[COLOR.B];
        bDst.data[i] = bDst.data[i + 1] = 0
        bDst.data[i + 3] = src.data[i + 3]

        calcHistogram(src.data, i);
    }

    rCtx.putImageData(rDst, 0, 0)
    gCtx.putImageData(gDst, 0, 0)
    bCtx.putImageData(bDst, 0, 0)

}

function analysisHSV() {
    let binNumberId = document.getElementById('binNumberId');
    const rCvs = document.getElementById("colorComponent1Img");
    const gCvs = document.getElementById("colorComponent2Img");
    const bCvs = document.getElementById("colorComponent3Img");
    let rCtx = rCvs.getContext("2d");
    let gCtx = gCvs.getContext("2d");
    let bCtx = bCvs.getContext("2d");
    let rDst = rCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let gDst = gCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let bDst = bCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let src = imageData;

    let H = 0;
    let S = 0;
    let V = 0;
    let workH = 0;
    let workS = 0;
    let workV = 0;
    let R = 0;
    let G = 0;
    let B = 0;

    for (let i = 0; i < src.data.length; i = i + 4) {
        let formatedData = [0, 0, 0];

        R = src.data[i];
        G = src.data[i + 1];
        B = src.data[i + 2];

        RGB2HSV(formatedData, R, G, B);
        H = formatedData[0];
        S = formatedData[1];
        V = formatedData[2];

        let rgbArr = new Array();
        calcTone(rgbArr, H, S, V, binNumberId.value, true);

        H = rgbArr[0];
        S = rgbArr[1];
        V = rgbArr[2];

        workH = H;
        workS = 255;
        workV = 255;

        HSV2RGB(rgbArr, workH, workS, workV);
        rDst.data[i] = rgbArr[0];
        rDst.data[i + 1] = rgbArr[1];
        rDst.data[i + 2] = rgbArr[2];
        rDst.data[i + 3] = src.data[i + 3];

        workH = 0;
        workS = S;
        workV = 255;

        HSV2RGB(rgbArr, workH, workS, workV);
        gDst.data[i] = rgbArr[0];
        gDst.data[i + 1] = rgbArr[1];
        gDst.data[i + 2] = rgbArr[2];
        gDst.data[i + 3] = src.data[i + 3];

        rgbArr[0] = V;
        rgbArr[1] = V;
        rgbArr[2] = V;

        bDst.data[i] = rgbArr[0];
        bDst.data[i + 1] = rgbArr[1];
        bDst.data[i + 2] = rgbArr[2];
        bDst.data[i + 3] = src.data[i + 3];

        calcHistogram(src.data, i);

    }
    rCtx.putImageData(rDst, 0, 0);
    gCtx.putImageData(gDst, 0, 0);
    bCtx.putImageData(bDst, 0, 0);
}

function calcHistogram(imageData, count) {
    cmpValueX = count / 4 % IMAGE_WIDHT;
    cmpValueY = Math.floor(count / 4 / IMAGE_WIDHT);

    if (((firstPosX <= cmpValueX && cmpValueX <= secondPosX) || (secondPosX <= cmpValueX && cmpValueX <= firstPosX)) &&
        ((firstPosY <= cmpValueY && cmpValueY <= secondPosY) || (secondPosY <= cmpValueY && cmpValueY <= firstPosY))) {
        compArr[COLOR.R][imageData[count]] += 1;
        compArr[COLOR.G][imageData[count + 1]] += 1;
        compArr[COLOR.B][imageData[count + 2]] += 1;
    }
}

function HSV2RGB(rgbArr, H, S, V) {
    let R = 0;
    let G = 0;
    let B = 0;

    for (i = 0; i < 3; i++) {
        rgbArr[i] = 0;
    }

    let Max = V;
    let Min = Max - ((S / 255) * Max);
    let Diff = Max - Min;

    if (H >= 0 && H < 60) {
        R = Max;
        G = (H / 60) * Diff + Min;
        B = Min;
    }
    else if (H >= 60 && H < 120) {
        R = ((120 - H) / 60) * Diff + Min;
        G = Max;
        B = Min;
    }
    else if (H >= 120 && H < 180) {
        R = Min;
        G = Max;
        B = ((H - 120) / 60) * Diff + Min;
    }
    else if (H >= 180 && H < 240) {
        R = Min;
        G = ((240 - H) / 60) * Diff + Min;
        B = Max;
    }
    else if (H >= 240 && H < 300) {
        R = ((H - 240) / 60) * Diff + Min;
        G = Min;
        B = Max;
    }
    else {
        R = Max;
        G = Min;
        B = ((360 - H) / 60) * Diff + Min;
    }

    rgbArr[0] = Math.floor(R);
    rgbArr[1] = Math.floor(G);
    rgbArr[2] = Math.floor(B);
}

function calcTone(rgbArr, R, G, B, binNumber, isHSV) {
    let toneDivision = COLOR_RANGE / binNumberId.value;
    let toneDivisionH = 360 / binNumberId.value;

    for (i = 0; i < 3; i++) {
        rgbArr[i] = 0;
    }

    if (binNumberId.value != COLOR_RANGE) {
        if (isHSV) {
            rgbArr[0] = toneDivisionH / 2 + Math.floor(R / toneDivisionH) * toneDivisionH;
        }
        else {
            rgbArr[0] = (R == 0) ? 0 : toneDivision / 2 + Math.floor(R / toneDivision) * toneDivision;
        }
        rgbArr[1] = (G == 0) ? 0 : toneDivision / 2 + Math.floor(G / toneDivision) * toneDivision;
        rgbArr[2] = (B == 0) ? 0 : toneDivision / 2 + Math.floor(B / toneDivision) * toneDivision;
    }
    else {
        rgbArr[0] = R;
        rgbArr[1] = G;
        rgbArr[2] = B;
    }
}

function analysisYUV() {
    let binNumberId = document.getElementById('binNumberId');
    const rCvs = document.getElementById("colorComponent1Img");
    const gCvs = document.getElementById("colorComponent2Img");
    const bCvs = document.getElementById("colorComponent3Img");
    let rCtx = rCvs.getContext("2d");
    let gCtx = gCvs.getContext("2d");
    let bCtx = bCvs.getContext("2d");
    let rDst = rCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let gDst = gCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let bDst = bCtx.createImageData(IMAGE_WIDHT, IMAGE_HEIGHT);
    let src = imageData;

    let Y = 0;
    let U = 0;
    let V = 0;
    let R = 0;
    let G = 0;
    let B = 0;

    for (let i = 0; i < src.data.length; i = i + 4) {
        let formatedData = [0, 0, 0];
        rValue = src.data[i];
        gValue = src.data[i + 1];
        bValue = src.data[i + 2];

        R = rValue;
        G = gValue;
        B = bValue;

        RGB2YUV(formatedData, R, G, B);
        Y = formatedData[0];
        U = formatedData[1];
        V = formatedData[2];

        let rgbArr = new Array();
        calcTone(rgbArr, Y, U, V, binNumberId.value, false);

        Y = rgbArr[0];
        U = rgbArr[1];
        V = rgbArr[2];

        rDst.data[i] = rDst.data[i + 1] = rDst.data[i + 2] = Y;
        rDst.data[i + 3] = src.data[i + 3];

        workY = 192;
        workU = U;
        workV = 0;

        YUV2RGB(rgbArr, workY, workU, workV);
        gDst.data[i] = rgbArr[0];
        gDst.data[i + 1] = rgbArr[1];
        gDst.data[i + 2] = rgbArr[2];
        gDst.data[i + 3] = src.data[i + 3];

        workY = 192;
        workU = 0;
        workV = V;

        YUV2RGB(rgbArr, workY, workU, workV);
        bDst.data[i] = rgbArr[0];
        bDst.data[i + 1] = rgbArr[1];
        bDst.data[i + 2] = rgbArr[2];
        bDst.data[i + 3] = src.data[i + 3];

        calcHistogram(src.data, i);
    }
    rCtx.putImageData(rDst, 0, 0);
    gCtx.putImageData(gDst, 0, 0);
    bCtx.putImageData(bDst, 0, 0);
}

function YUV2RGB(rgbArr, Y, U, V) {
    rgbArr[0] = 1.000 * Y + 1.402 * V;
    rgbArr[1] = 1.000 * Y - 0.344 * U - 0.714 * V;
    rgbArr[2] = 1.000 * Y + 1.772 * U;

    rgbArr[0] = Math.floor(rgbArr[0]);
    rgbArr[1] = Math.floor(rgbArr[1]);
    rgbArr[2] = Math.floor(rgbArr[2]);
}

function RGB2HSV(hsvArr, R, G, B) {
    let H = 0;
    let S = 0;
    let V = 0;
    let Max = 0;
    let Min = 0;
    let Diff = 0;

    Max = Math.max(R, G, B);
    Min = Math.min(R, G, B);
    Diff = Max - Min;

    if (Max == Min) {
        H = 0;
    }
    else {
        if (R == Max) {
            H = 60 * ((G - B) / Diff);
        }
        else if (G == Max) {
            H = 60 * ((B - R) / Diff) + 120;
        }
        else {
            H = 60 * ((R - G) / Diff) + 240;
        }
    }

    if (H < 0) {
        H += 360;
    }

    S = (Max == 0) ? 0 : Diff * 255 / Max;
    V = Max;

    hsvArr[0] = Math.floor(H);
    hsvArr[1] = Math.floor(S);
    hsvArr[2] = Math.floor(V);
}

function RGB2YUV(yuvArr, R, G, B) {
    let Y = 0;
    let U = 0;
    let V = 0;

    Y = 0.299 * R + 0.587 * G + 0.114 * B;
    U = -0.169 * R - 0.331 * G + 0.500 * B;
    V = 0.500 * R - 0.419 * G - 0.081 * B;

    yuvArr[0] = Math.floor(Y);
    yuvArr[1] = Math.floor(U);
    yuvArr[2] = Math.floor(V);
}
