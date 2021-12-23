const Canvas = require('canvas');
// todo: if the the followings are unnesessary please remove
// comment out temporarily
// const { registerFont } = require('canvas');

const GROWI_LOGO_IMAGE_PATH = '../resources/growi_logo.svg';
const BACKGROUND_ACCENT_IMAGE_PATH = '../resources/growi_ogp_bg.svg';

const TITLE_FONT_OPTIONS = 'bold 70px sans-serif';
const USERNAME_FONT_OPTIONS = 'bold 40px sans-serif';

const TEXT_COLOR = '#112744';
const BACKGROUND_COLOR = "#ffffff";

const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;
// for gradient line color
const VERTEX_BEGINNING_COLOR = '#39c8ff';
const VERTEX_END_COLOR = "#f32dff";

const GRADIENT_LINE_WIDTH = 13;

exports.GrowiOgpDrawer = class GrowiOgpDrawer {

    constructor(
        title, userName,
        titleFontOptions, userNameFontOptions,
        width, height,
        textColor, backgroundColor, vertexBeginningColor, vertexEndColor, gradientLineWidth) {

        this.drawCanvas = new Canvas.createCanvas(OGP_IMAGE_WIDTH, OGP_IMAGE_HEIGHT);
        this.context = this.drawCanvas.getContext('2d');
        this.textColor = textColor || TEXT_COLOR;
        this.backgroundColor = backgroundColor || BACKGROUND_COLOR;

        this.title = title;
        this.userName = userName;
        this.titleFontOptions = titleFontOptions || TITLE_FONT_OPTIONS;
        this.userNameFontOptions = userNameFontOptions || USERNAME_FONT_OPTIONS;

        this.imageWidth = width || OGP_IMAGE_WIDTH;
        this.imageHeight = height || OGP_IMAGE_HEIGHT;
        this.centerX = this.imageWidth / 2
        this.centerY = this.imageHeight / 2

        this.vertexBeginningColor = vertexBeginningColor || VERTEX_BEGINNING_COLOR;
        this.vertexEndColor = vertexEndColor || VERTEX_END_COLOR;
        this.gradientLineWidth = gradientLineWidth || GRADIENT_LINE_WIDTH;
        
    }

    async drawBackgroundAndLogo(logoMarginTop) {
        const growiLogoImage = await Canvas.loadImage(GROWI_LOGO_IMAGE_PATH);
        const backgroundAccentImage = await Canvas.loadImage(BACKGROUND_ACCENT_IMAGE_PATH);
        const marginTop = logoMarginTop || 40;

        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.imageWidth, this.imageHeight);
        this.context.drawImage(growiLogoImage, this.centerX - (growiLogoImage.width/2), marginTop);
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
        this.context.lineWidth = this.gradientLineWidth ;
        this.context.stroke();
    }

    drawTopLinearGradient() {
        this.drawHorizontalLinearGradient(0, false);
    }

    drawBottomLinearGradient() {
        this.drawHorizontalLinearGradient(this.imageHeight, true);
    }

    setTextOption(fontOptions, textColor, textAlign, textBaseline) {
        this.context.fillStyle = textColor || this.textColor;
        this.context.font = fontOptions;
        this.context.textAlign = textAlign || 'center';
        this.context.textBaseline = textBaseline || 'middle';
    }

    /**
     *
     * @param {number} fontSize like 70 wihtout px
     * @param {string} font canvas font selecter like 'bold sans-serif' except fontsize(px)
     */
    drawTitle(fontOptions, textColor, textAlign, textBaseline, MaxWidth) {
        this.setTextOption(fontOptions, textColor, textAlign, textBaseline);
        
        const fontSize = fontOptions.match(/(\d){1,3}px/)[0].replace('px', '');
        const titleMaxWidth = MaxWidth || this.imageWidth * 0.6

        this.drawWrapText(this.title, titleMaxWidth, Number(fontSize) * 1.15);
    }

    /**
     *
     * @param {number} fontSize like 70 wihtout px
     * @param {string} font canvas font selecter like 'bold sans-serif' except fontsize(px)
     */
    drawByUserName(fontOptions, textColor, textAlign, textBaseline, marginBottom = 50) {
        this.setTextOption(fontOptions, textColor, textAlign, textBaseline);

        const byUserName = `by ${this.userName}`
    
        this.context.fillText(byUserName, this.centerX, this.imageHeight - marginBottom);
    }

    drawWrapText(text, maxWidth, lineHeight, maxLineNumber = 3) {
    
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

        if (textLines.length >= maxLineNumber) {
            
            let lastLineElement = textLines[2];
            const hasSpaceLanguage = lastLineElement.includes(" ");

            if (hasSpaceLanguage) {
                // text truncation
                const matchedText = lastLineElement.match(/^(.)*\s/)[0];
                textLines[2] = `${matchedText}...`;
            }
            else {
                textLines[2] = lastLineElement.replace(/(.){3}$/,"...")      
            }
    
            textLines = textLines.slice(0,3);
        }

        textLines.forEach((line, index) => {
            // shift vertical middle position by line number
            // this.centerY + (index)*lineHeight + 0.5(index-1)*lineHeight
            this.context.fillText(line, this.centerX, this.centerY + (index)*lineHeight - 0.5*lineHeight*(textLines.length-1));
        })
    }

    async drawOgp() {

        await this.drawBackgroundAndLogo();

        this.drawTopLinearGradient();
        this.drawBottomLinearGradient();
        this.drawTitle(this.titleFontOptions);

        // todo: ↓ if user image is placed before username method name must be changed
        this.drawByUserName(this.userNameFontOptions);

        return this.drawCanvas;

    }

}