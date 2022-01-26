const { GrowiOgpDrawer } = require('../growi-ogp-drawer');

describe('GrowiOgpDrawer', () => {

  describe('createWrappedText', () => {

    // the following lines are dummy data
    const maxWidthOgpImage = 1200 * 0.75;
    const maxTitleLineNumber = 3;

    const growiOgpDrawer = new GrowiOgpDrawer('dummyTitle', 'dummyUserName', Buffer.from('dummyBuf'));

    describe('all language', () => {
      test('no title text', () => {
        const noTitle = '';
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          noTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        const lastIndex = wrappedTitleList.length - 1;
        expect(wrappedTitleList).toHaveLength(1);
        // expect not text truncation
        expect(wrappedTitleList[lastIndex]).toBe(noTitle);
      });
    });

    describe('has no space language', () => {
      test('japanese long title text', () => {
        const japaneseTitle = 'これはタイトルです'.repeat(100);
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          japaneseTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        const lastIndex = wrappedTitleList.length - 1;
        expect(wrappedTitleList).toHaveLength(maxTitleLineNumber);
        // expect text truncation
        expect(wrappedTitleList[lastIndex]).toMatch(/^(.)*(\.){3}$/);
      });

      test('japanese short title text', () => {
        const japaneseTitle = 'これはタイトルです';
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          japaneseTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        expect(wrappedTitleList).toHaveLength(1);
        // expect not text truncation
        expect(japaneseTitle).toBe(wrappedTitleList[0]);
      });
    });

    describe('has space language', () => {
      test('English long title text', () => {
        const englishTitle = 'this is a long title '.repeat(100);
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          englishTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        const lastIndex = wrappedTitleList.length - 1;
        // expect text truncation
        expect(wrappedTitleList[lastIndex]).toMatch(/^(.)*(\s)(\.){3}$/);
      });

      test('English short title text', () => {
        const englishTitle = 'this is a short title';
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          englishTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        expect(wrappedTitleList).toHaveLength(1);
        // expect not text truncation
        expect(englishTitle).toBe(wrappedTitleList[0]);
      });
    });

  });

});
