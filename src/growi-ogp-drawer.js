const Canvas = require('canvas');

const GROWI_LOGO_IMAGE_PATH = '../resources/growi_logo.svg';
const BACKGROUND_ACCENT_IMAGE_PATH = '../resources/growi_ogp_bg.svg';

const TITLE_FONT_OPTIONS = '600 65px sans-serif';
const USERNAME_FONT_OPTIONS = 'bold 40px sans-serif';

const TEXT_COLOR = '#112744';
const BACKGROUND_COLOR = "#ffffff";

// for gradient line color
const VERTEX_BEGINNING_COLOR = '#39c8ff';
const VERTEX_END_COLOR = "#f32dff";

const GRADIENT_LINE_WIDTH = 13;

const TITLE_MAX_LINE_NUMBER = 3;
const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;


exports.GrowiOgpDrawer = class GrowiOgpDrawer {

    constructor(
        title, userName,
        bufferedUserImage,
        titleFontOptions, userNameFontOptions,
        textColor, backgroundColor,
        vertexBeginningColor, vertexEndColor, gradientLineWidth,
        titleMaxLineNumber,
        width, height
    ) {

        this.drawCanvas = new Canvas.createCanvas(OGP_IMAGE_WIDTH, OGP_IMAGE_HEIGHT);
        this.context = this.drawCanvas.getContext('2d');

        this.title = title;
        this.userName = userName;
        this.bufferedUserImage = bufferedUserImage;
        this.titleFontOptions = titleFontOptions || TITLE_FONT_OPTIONS;
        this.userNameFontOptions = userNameFontOptions || USERNAME_FONT_OPTIONS;

        this.textColor = textColor || TEXT_COLOR;
        this.backgroundColor = backgroundColor || BACKGROUND_COLOR;

        this.vertexBeginningColor = vertexBeginningColor || VERTEX_BEGINNING_COLOR;
        this.vertexEndColor = vertexEndColor || VERTEX_END_COLOR;
        this.gradientLineWidth = gradientLineWidth || GRADIENT_LINE_WIDTH;

        this.titleMaxLineNumber = titleMaxLineNumber || TITLE_MAX_LINE_NUMBER;

        this.imageWidth = width || OGP_IMAGE_WIDTH;
        this.imageHeight = height || OGP_IMAGE_HEIGHT;
        this.centerX = this.imageWidth / 2;
        this.centerY = this.imageHeight / 2;
    }

    async drawBackgroundAndLogo(logoMarginTop = 40) {
        const growiLogoImage = await Canvas.loadImage(GROWI_LOGO_IMAGE_PATH);
        const backgroundAccentImage = await Canvas.loadImage(BACKGROUND_ACCENT_IMAGE_PATH);

        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.imageWidth, this.imageHeight);
        this.context.drawImage(growiLogoImage, this.centerX - (growiLogoImage.width/2), logoMarginTop);
        this.context.drawImage(backgroundAccentImage, 0, 0);
    }

    drawHorizontalLinearGradient(yCoordinate, reverse = false) {
        
        const gradient = reverse ?
            this.context.createLinearGradient(0, 0, this.imageWidth, 0) :
            this.context.createLinearGradient(this.imageWidth, this.imageHeight, 0, this.imageHeight);
            ;

        gradient.addColorStop(0.3, this.vertexBeginningColor);
        gradient.addColorStop(1, this.vertexEndColor);

        this.context.strokeStyle = gradient;
        
        this.context.beginPath();
        this.context.moveTo(0, yCoordinate);
        this.context.lineTo(this.imageWidth, yCoordinate);
        this.context.lineWidth = this.gradientLineWidth;
        this.context.stroke();
    }

    drawTopLinearGradient() {
        this.drawHorizontalLinearGradient(0, false);
    }

    drawBottomLinearGradient() {
        this.drawHorizontalLinearGradient(this.imageHeight, true);
    }

    setTextOption(fontOptions, textColor, textAlign, textBaseline) {
        this.context.font = fontOptions;
        this.context.fillStyle = textColor || this.textColor;
        this.context.textAlign = textAlign || 'center';
        this.context.textBaseline = textBaseline || 'middle';
    }

    /**
     *
     * @param {string} fontOptions canvas font selecter like 'bold 70px sans-serif'
     */
    drawTitle(fontOptions, textColor, textAlign, textBaseline, MaxWidth) {
        
        const titleFontOptions = fontOptions || this.titleFontOptions;
        this.setTextOption(titleFontOptions, textColor, textAlign, textBaseline);
        
        const fontSize = titleFontOptions.match(/(\d){1,3}px/)[0].replace('px', '');
        const lineHeight = Number(fontSize) * 1.2;
        const titleMaxWidth = MaxWidth || this.imageWidth * 0.75

        this.drawWrapText(this.title, titleMaxWidth, lineHeight, this.titleMaxLineNumber);
    }

    /**
     *
     * @param {string} fontOptions canvas font selecter like 'bold 70px sans-serif'
     */
     drawUserNameAndImage(fontOptions, textColor, textAlign, textBaseline, userNameAndImageMargin = 55, marginBottom = 50, userImageSize = 40) {

        const userNameFontOptions = fontOptions || this.userNameFontOptions;
        this.setTextOption(userNameFontOptions, textColor, textAlign, textBaseline);

        const image = new Canvas.Image();
        image.src = Buffer.from(this.bufferedUserImage);

        const userNameWidth = this.context.measureText(this.userName).width;
        
        // todo: adjust position and image will be rounded
        this.context.drawImage(image, this.centerX - (userNameWidth / 2) - userNameAndImageMargin, this.imageHeight - marginBottom - (userImageSize/2) , userImageSize, userImageSize);
        this.context.fillText(this.userName, this.centerX, this.imageHeight - marginBottom);
    }

    drawWrapText(text, maxWidth, lineHeight, maxLineNumber) {
    
        let textLines = [];
    
        const words = text.split(' ');

        let line = '';
        let test = '';
        let metrics;
    
        for (let i = 0; i < words.length; i++) {
            test = words[i];
            metrics = this.context.measureText(test);

            while (metrics.width > maxWidth) {
                // Determine how much of the word will fit
                test = test.substring(0, test.length - 1);
                metrics = this.context.measureText(test);
            }

            if (words[i] != test) {
                words.splice(i + 1, 0,  words[i].substr(test.length))
                words[i] = test;
            }  
    
            test = line + words[i] + ' ';  
            metrics = this.context.measureText(test);
    
            if (metrics.width > maxWidth && i > 0) {
                textLines.push(line);
                line = words[i] + ' ';
            }
            else {
                line = test;
            }
        }

        textLines.push(line);

        // in this line
        // each element of textLines has unnesessary last space
        // like ['blabla ', 'blabla ', 'blablablabla ']

        if (textLines.length > maxLineNumber) {
            
            const lastIndex = maxLineNumber - 1;
            let lastLineElement = textLines[lastIndex];

            const lastLineElementHasNoLastSpace = lastLineElement.substring(0, lastLineElement.length - 1);
            
            const hasSpaceLanguage = lastLineElementHasNoLastSpace.includes(" ");

            // text truncation
            if (hasSpaceLanguage) {
                const matchedText = lastLineElementHasNoLastSpace.match(/^(.)*\s/)[0];
                textLines[lastIndex] = `${matchedText} ...`;
            }
            else {
                textLines[lastIndex] = `${lastLineElement.substring(0, lastLineElement.length - 3)}...`;     
            }
    
            textLines = textLines.slice(0, maxLineNumber);
        }

        // todo: move the following operation to other method 
        // and write unit test
        textLines.forEach((line, index) => {
            // shift vertical middle position by line number
            // this.centerY + (index)*lineHeight + 0.5(index-1)*lineHeight
            this.context.fillText(
                index === textLines.length && /\.{3}$/.test(line) ? line : line.substring(0, line.length - 1),
                this.centerX,
                this.centerY + (index)*lineHeight - 0.5*lineHeight*(textLines.length-1)
            );
        })
    }

    async drawOgp() {

        await this.drawBackgroundAndLogo();

        this.drawTopLinearGradient();
        this.drawBottomLinearGradient();
        this.drawTitle();
        this.drawUserNameAndImage();

        return this.drawCanvas;

    }

}
