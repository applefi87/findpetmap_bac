import cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { filterUniqueStringArray } from './stringTool.js'

export function splitImageList(imageList, imageUrls) {
  return imageList.reduce(
    (result, img) => {
      if (imageUrls.includes(img.url)) {
        result.matchedImageObjs.push(img);
      } else {
        result.unmatchedImageObjs.push(img);
      }
      return result;
    },
    { matchedImageObjs: [], unmatchedImageObjs: [] }
  );
}

export function extractThumbnailUrl(content) {
  const regex = /<img.*?src=['"](.*?)['"]/;
  const match = regex.exec(content);
  if (match?.[1]) {
    return match[1];
  }
  return '';
}

export function getPlainTextPreview(htmlContent, maxLength) {
  const $ = cheerio.load(htmlContent);
  $('br').replaceWith(' ');
  let textContent = $('body').text().replace(/\n/g, ' ');
  if (maxLength && textContent.length > maxLength) {
    textContent = textContent.slice(0, maxLength - 3) + '...';
  }
  return textContent;
}

export function extractImageUrlsFromContent(content, bucket = process.env.AWS_S3_BUCKET_NAME, region = process.env.AWS_REGION) {
  // Use template literals to construct the dynamic regex with a capturing group for the version part
  const regex = new RegExp(`^https://${bucket}\\.s3\\.${region}\\.amazonaws\\.com/(.*\\.(?:jpg|png|gif))$`, 'i');

  const dom = new JSDOM(content);
  const imgElements = dom.window.document.querySelectorAll('img'); // Get all <img> elements in the HTML string
  const hrefs = Array.from(imgElements).map(img => img.getAttribute('src')); // Extract the 'src' attribute from each <img> element
  const filteredHrefs = hrefs
    .map(href => {
      const match = regex.exec(href); // Apply regex to each href
      return match ? match[1] : null; // Return the captured group if there's a match, otherwise null
    })
    .filter(href => href !== null); // Filter out null values
  return filteredHrefs;
}

export function extractUniqueImageUrlsFromContent(content, bucket = process.env.AWS_S3_BUCKET_NAME, region = process.env.AWS_REGION) {
  const filteredHrefs = extractImageUrlsFromContent(content, bucket, region)
  return filterUniqueStringArray(filteredHrefs);
}