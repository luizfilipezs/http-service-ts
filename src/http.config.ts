/**
 * Define basic configuration for future requests, as headers
 * and a boolean that allow `request()` method to know if it is necessary
 * to append a slash in the end of the URL.
 */
export default interface HttpConfig {
  /**
   * Define headers that will be used in every request.
   */
  headers: Headers;
  /**
   * If `true` a slash will be always appended to the end of the URL (when there is no one).
   */
  appendSlash: boolean;
}
