/**
 * TrackerAdapter Interface
 */
class TrackerAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Push an approved action item to the tracker.
   * @param {Object} item
   * @returns {Promise<{ success: boolean, url?: string, id?: string, error?: string }>}
   */
  async push(item) {
    throw new Error('push() must be implemented by subclass');
  }

  /**
   * Check connection status
   * @returns {Promise<{ connected: boolean, details?: string }>}
   */
  async checkConnection() {
    return { connected: true };
  }
}

module.exports = { TrackerAdapter };
