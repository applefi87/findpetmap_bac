import articleConfigs from "../../infrastructure/configs/articleConfigs.js";
/**
 * Extends a region defined by two points (bottomLeft and topRight) by a buffer multiplier.
 *
 * @param {Object} bottomLeft - The bottom-left corner of the region with latitude and longitude.
 * @param {Object} topRight - The top-right corner of the region with latitude and longitude.
 * @param {number} bufferMultiplier - The multiplier to extend the region (e.g., 1.5).
 * @returns {Object} - The adjusted bottomLeft and topRight points.
 */
export function extendRegion(bottomLeft, topRight) {
  const bufferMultiplier = articleConfigs.region.bufferMultiplier;
  const adjustedBottomLeft = {
    lat: bottomLeft.lat - (topRight.lat - bottomLeft.lat) * (bufferMultiplier - 1) / 2,
    lng: bottomLeft.lng - (topRight.lng - bottomLeft.lng) * (bufferMultiplier - 1) / 2,
  };

  const adjustedTopRight = {
    lat: topRight.lat + (topRight.lat - bottomLeft.lat) * (bufferMultiplier - 1) / 2,
    lng: topRight.lng + (topRight.lng - bottomLeft.lng) * (bufferMultiplier - 1) / 2,
  };

  return { adjustedBottomLeft, adjustedTopRight };
}
