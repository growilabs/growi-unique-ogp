const { GrowiOgpDrawer } = require('../growi-ogp-drawer');

describe('GrowiOgpDrawer', () => {

  describe('createWrappedText', () => {

    // the following lines are dummy data
    const maxWidthOgpImage = 1200 * 0.75;
    const maxTitleLineNumber = 3;

    const growiOgpDrawer = new GrowiOgpDrawer('dummyTitle', 'dummyUserName', Buffer.from('dummyBuf'));

    describe('japanese', () => {
      test('japanese long title text', () => {
        const japaneseTitle = 'これはタイトルです'.repeat(100);
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          japaneseTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        const lastIndex = wrappedTitleList.length - 1;
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
        expect(japaneseTitle).toBe(wrappedTitleList[0]);
      });
    });

    describe('English', () => {
      test('English long title text', () => {
        const englishTitle = 'this is a long title '.repeat(100);
        const wrappedTitleList = growiOgpDrawer.createWrappedText(
          englishTitle,
          maxWidthOgpImage,
          maxTitleLineNumber,
        );
        const lastIndex = wrappedTitleList.length - 1;
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
        expect(englishTitle).toBe(wrappedTitleList[0]);
      });
    });

  });

});
