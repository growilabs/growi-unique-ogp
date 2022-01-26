const Canvas = require('canvas');
const { createCanvas } = require('canvas');

const GROWI_LOGO_IMAGE_PATH = '../resources/growi_logo.svg';
const BACKGROUND_ACCENT_IMAGE_PATH = '../resources/growi_ogp_bg.svg';

const TITLE_FONT_OPTIONS = '600 65px sans-serif';
const USERNAME_FONT_OPTIONS = 'bold 40px sans-serif';

const TEXT_COLOR = '#112744';
const BACKGROUND_COLOR = '#ffffff';

// for gradient line color
const VERTEX_BEGINNING_COLOR = '#39c8ff';
const VERTEX_END_COLOR = '#f32dff';

const GRADIENT_LINE_WIDTH = 13;

const TITLE_MAX_LINE_NUMBER = 3;
const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;

exports.GrowiOgpDrawer = class GrowiOgpDrawer {

  constructor(
      title,
      userName,
      bufferedUserImage,
      titleFontOptions,
      userNameFontOptions,
      textColor,
      backgroundColor,
      vertexBeginningColor,
      vertexEndColor,
      gradientLineWidth,
      titleMaxLineNumber,
      width,
      height,
  ) {

    this.drawCanvas = createCanvas(OGP_IMAGE_WIDTH, OGP_IMAGE_HEIGHT);
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

    const startPointXCoordinateGrowiLogo = this.centerX - (growiLogoImage.width / 2);

    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.imageWidth, this.imageHeight);

    this.context.drawImage(growiLogoImage, startPointXCoordinateGrowiLogo, logoMarginTop);
    this.context.drawImage(backgroundAccentImage, 0, 0);
  }

  drawHorizontalLinearGradient(yCoordinate, reverse = false) {

    const gradient = reverse
      ? this.context.createLinearGradient(0, 0, this.imageWidth, 0)
      : this.context.createLinearGradient(this.imageWidth, this.imageHeight, 0, this.imageHeight);

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
   * @param {string} fontOptions canvas font selecter like 'bold 70px sans-serif'
   */
  drawTitle(fontOptions, textColor, textAlign, textBaseline, MaxWidth) {

    const titleFontOptions = fontOptions || this.titleFontOptions;
    this.setTextOption(titleFontOptions, textColor, textAlign, textBaseline);

    const fontSize = titleFontOptions.match(/(\d){1,3}px/)[0].replace('px', '');
    const lineHeight = Number(fontSize) * 1.2;
    const titleMaxWidth = MaxWidth || this.imageWidth * 0.75;

    this.drawWrappedText(this.createWrappedText(this.title, titleMaxWidth, this.titleMaxLineNumber), lineHeight);
  }

  /**
   * @param {string} fontOptions canvas font selecter like 'bold 70px sans-serif'
   */
  drawUserNameAndImage(fontOptions, textColor, textAlign, textBaseline, userNameAndImageMargin = 55, marginBottom = 50, userImageSize = 40) {

    const userNameFontOptions = fontOptions || this.userNameFontOptions;
    this.setTextOption(userNameFontOptions, textColor, textAlign, textBaseline);

    const image = new Canvas.Image();
    image.src = Buffer.from(this.bufferedUserImage);

    const userNameWidth = this.context.measureText(this.userName).width;
    const userNameYCoordinate = this.imageHeight - marginBottom;
    const userImageRadius = userImageSize / 2;
    const userImageCenterXCoordinate = this.centerX - (userNameWidth / 2) - userNameAndImageMargin + userImageRadius;

    this.context.fillText(this.userName, this.centerX, userNameYCoordinate);

    // rounded image
    this.context.beginPath();
    this.context.arc(
      userImageCenterXCoordinate,
      userNameYCoordinate,
      userImageRadius,
      0,
      Math.PI * 2,
      false,
    );
    this.context.clip();
    this.context.drawImage(
      image,
      userImageCenterXCoordinate - userImageRadius,
      userNameYCoordinate - userImageRadius,
      userImageSize,
      userImageSize,
    );
  }

  /**
   * draw ogp title splited by one line like ['ogp title is', 'something']
   * @param {Array} textLines: ogp title
   * @param {number} lineHeight: ogp title line height
   */
  drawWrappedText(textLines, lineHeight) {

    const yDistanceMovedByTextLinesLength = 0.5 * lineHeight * (textLines.length - 1);
    const InitialYCoordinate = this.centerY - yDistanceMovedByTextLinesLength;

    textLines.forEach((line, index) => {
      // shift vertical title position by index

      const yDistanceMovedByIndex = index * lineHeight;

      this.context.fillText(
        line,
        this.centerX,
        InitialYCoordinate + yDistanceMovedByIndex,
      );
    });

  }

  /**
   * convert ogp title to array splited by one line like ['ogp title is', 'something']
   * @param {string} text: ogp title
   * @param {number} maxWidth: ogp title max width
   * @param {number} maxLineNumber
   * @return {Array}
   */
  createWrappedText(text, maxWidth, maxLineNumber) {

    let textLines = [];

    const words = text.split(' ');

    let line = '';
    let test = '';
    let metrics;

    // words length is changed in for loop
    for (let i = 0; i < words.length; i++) {
      test = words[i];
      metrics = this.context.measureText(test);

      while (metrics.width > maxWidth) {
        // Determine how much of the word will fit
        test = test.substring(0, test.length - 1);
        metrics = this.context.measureText(test);
      }

      if (words[i] !== test) {
        words.splice(i + 1, 0, words[i].substr(test.length));
        words[i] = test;
      }

      test = `${line + words[i]} `;
      metrics = this.context.measureText(test);

      if (metrics.width > maxWidth && i > 0) {
        textLines.push(line);
        line = `${words[i]} `;
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
      const lastLineElement = textLines[lastIndex];

      const lastLineElementHasNoLastSpace = lastLineElement.substring(0, lastLineElement.length - 1);

      const hasSpaceLanguage = lastLineElementHasNoLastSpace.includes(' ');

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

    let textLinesHasNoLastSpace = [];

    if (textLines.length === 1) {
      const title = textLines[0];
      const lastSpaceRemovedTitle = title.substring(0, text.length);
      textLinesHasNoLastSpace.push(lastSpaceRemovedTitle);
    }
    else {
      textLinesHasNoLastSpace = textLines.map((line, index) => {
        // return last element because it is truncated
        if (index === textLines.length - 1) {
          return line;
        }

        const lineHasNoLastSpace = line.substring(0, line.length - 1);
        const hasSpaceLanguage = lineHasNoLastSpace.includes(' ');

        if (hasSpaceLanguage) {
          // is French, English and so on
          return line;
        }

        // is Japanese, Chinese and so on
        return line.substring(0, line.length - 1);

      });
    }

    return textLinesHasNoLastSpace;

  }

  async drawOgp() {

    await this.drawBackgroundAndLogo();

    this.drawTopLinearGradient();
    this.drawBottomLinearGradient();
    this.drawTitle();
    this.drawUserNameAndImage();

    return this.drawCanvas;

  }

};
