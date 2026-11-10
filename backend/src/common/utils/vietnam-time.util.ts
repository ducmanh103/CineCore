/**
 * Vietnam Time Utility (Asia/Ho_Chi_Minh - UTC+7)
 */
export class VietnamTime {
  private static readonly OFFSET_HOURS = 7;

  /**
   * Get current Vietnam local Date object
   */
  static now(): Date {
    const now = new Date();
    return new Date(now.getTime() + this.OFFSET_HOURS * 3600 * 1000);
  }

  /**
   * Convert UTC Date to Vietnam local ISO String (YYYY-MM-DDTHH:mm:ss.sss+07:00)
   */
  static toVietnamIso(date: Date = new Date()): string {
    const vnDate = new Date(date.getTime() + this.OFFSET_HOURS * 3600 * 1000);
    return vnDate.toISOString().replace('Z', '+07:00');
  }

  /**
   * Format Date to standard Vietnamese display: HH:mm, DD/MM/YYYY
   */
  static formatDisplay(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}

