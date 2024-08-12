import { expect } from 'chai';
import { extractUniqueImageUrlsFromContent } from '../../src/infrastructure/utils/htmlTool.js';

describe('extractUniqueImageUrlsFromContent', () => {
    it('should extract image URLs correctly', () => {
        const content = `
          <html>
            <body>
              <img src="https://production-private.s3.ap-northeast-1.amazonaws.com/2024/07/31/141717399_98.png" />
              <img src="https://i.imgur.com/example.jpg" />
              <img src="https://production-private.s3.ap-northeast-1.amazonaws.com/2023/06/30/another_image.gif" />
              <img src="https://example.com/not_matching.jpg" />
            </body>
          </html>
        `;
        
        const bucket = 'production-private';
        const region = 'ap-northeast-1';
        
        const result = extractUniqueImageUrlsFromContent(content, bucket, region);
        expect(result).to.deep.equal([
            '2024/07/31/141717399_98.png',
            '2023/06/30/another_image.gif'
        ]);
    });

    it('should extract unique image URLs correctly', () => {
      const content = `
        <html>
          <body>
            <img src="https://production-private.s3.ap-northeast-1.amazonaws.com/2024/07/31/141717399_98.png" />
            <img src="https://i.imgur.com/example.jpg" />
            <img src="https://production-private.s3.ap-northeast-1.amazonaws.com/2023/06/30/another_image.gif" />
            <img src="https://example.com/not_matching.jpg" />
            <img src="https://production-private.s3.ap-northeast-1.amazonaws.com/2024/07/31/141717399_98.png" />
          </body>
        </html>
      `;
      
      const bucket = 'production-private';
      const region = 'ap-northeast-1';
      
      const result = extractUniqueImageUrlsFromContent(content, bucket, region);
      expect(result).to.deep.equal([
          '2024/07/31/141717399_98.png',
          '2023/06/30/another_image.gif'
      ]);
  });

    it('should return an empty array if no matching URLs are found', () => {
        const content = `
          <html>
            <body>
              <img src="https://i.imgur.com/example.jpg" />
              <img src="https://example.com/not_matching.jpg" />
            </body>
          </html>
        `;
        
        const bucket = 'production-private';
        const region = 'ap-northeast-1';
        
        const result = extractUniqueImageUrlsFromContent(content, bucket, region);
        expect(result).to.deep.equal([]);
    });

    it('should handle empty content', () => {
        const content = ``;
        
        const bucket = 'production-private';
        const region = 'ap-northeast-1';
        
        const result = extractUniqueImageUrlsFromContent(content, bucket, region);
        expect(result).to.deep.equal([]);
    });

    it('should handle missing src attributes', () => {
        const content = `
          <html>
            <body>
              <img />
              <img src="https://example.com/not_matching.jpg" />
            </body>
          </html>
        `;
        
        const bucket = 'production-private';
        const region = 'ap-northeast-1';
        
        const result = extractUniqueImageUrlsFromContent(content, bucket, region);
        expect(result).to.deep.equal([]);
    });
});
