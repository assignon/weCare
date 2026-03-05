/**
 * Utility function to translate notification titles and messages
 * Detects common patterns and translates them based on user's language preference
 */

export function translateNotificationTitle(title, t) {
  if (!title) return title

  // Chat / listing message titles (pattern-based for dynamic sender or listing title)
  if (typeof title === 'string') {
    if (title.startsWith('New message from ')) {
      const sender = title.slice('New message from '.length)
      const translated = t('notifications.translate.new_message_from', { sender })
      if (translated && translated !== 'notifications.translate.new_message_from') return translated
    }
    if (title.startsWith('New message about ')) {
      const listingTitle = title.slice('New message about '.length)
      const translated = t('notifications.translate.new_message_about_listing', { title: listingTitle })
      if (translated && translated !== 'notifications.translate.new_message_about_listing') return translated
    }
  }

  // Map common English titles to translation keys
  const titleMap = {
    'Order Status Update': 'notifications.translate.order_status_update',
    'New Order Received': 'notifications.translate.new_order_received',
    'Order Ready for Pickup': 'notifications.translate.order_ready_pickup',
    'Order Is Being Processed': 'notifications.translate.order_being_processed',
    'Order Picked Up': 'notifications.translate.order_picked_up',
    'Order Delivered Successfully': 'notifications.translate.order_delivered',
    'Order Delivered': 'notifications.translate.order_delivered',
    'Order Cancelled': 'notifications.translate.order_cancelled',
    'Order On Hold': 'notifications.translate.order_on_hold',
    'Payment Received': 'notifications.translate.payment_received',
    'Delivery Update': 'notifications.translate.order_status_update',
  }

  const translationKey = titleMap[title]
  if (translationKey) {
    const translated = t(translationKey)
    // If translation exists and is different from key, return it
    if (translated && translated !== translationKey) {
      return translated
    }
  }

  // Return original if no translation found
  return title
}

export function translateNotificationMessage(message, t) {
  if (!message) return message

  // Extract order ID from message (format: #123 or Order #123)
  const orderIdMatch = message.match(/#(\d+)/)
  const orderId = orderIdMatch ? orderIdMatch[1] : null

  // Extract status from message (common patterns)
  let status = null
  const statusPatterns = [
    /status changed to (.+?)(?:\.|$)/i,
    /is now (.+?)(?:\.|$)/i,
    /changed to (.+?)(?:\.|$)/i,
  ]

  for (const pattern of statusPatterns) {
    const match = message.match(pattern)
    if (match) {
      status = match[1].trim()
      break
    }
  }

  // Extract amount from payment messages
  const amountMatch = message.match(/payment of ([^ ]+)/i) || message.match(/(\$\d+\.?\d*)/i)
  const amount = amountMatch ? amountMatch[1] : null

  // Map common message patterns to translation keys
  const messagePatterns = [
    {
      pattern: /status changed to/i,
      key: 'notifications.translate.order_status_changed',
      params: { orderId, status: status || 'unknown' }
    },
    {
      pattern: /ready for pickup/i,
      key: 'notifications.translate.order_ready_pickup_msg',
      params: { orderId }
    },
    {
      pattern: /assigned to.*delivery driver/i,
      key: 'notifications.translate.order_assigned_driver',
      params: { orderId }
    },
    {
      pattern: /being processed/i,
      key: 'notifications.translate.order_being_processed_msg',
      params: { orderId }
    },
    {
      pattern: /picked up.*on the way/i,
      key: 'notifications.translate.order_picked_up_msg',
      params: { orderId }
    },
    {
      pattern: /has been delivered/i,
      key: 'notifications.translate.order_delivered_msg',
      params: { orderId }
    },
    {
      pattern: /has been cancelled/i,
      key: 'notifications.translate.order_cancelled_msg',
      params: { orderId }
    },
    {
      pattern: /has been returned/i,
      key: 'notifications.translate.order_returned_msg',
      params: { orderId }
    },
    {
      pattern: /new order.*received/i,
      key: 'notifications.translate.new_order_msg',
      params: { orderId }
    },
    {
      pattern: /payment.*received/i,
      key: 'notifications.translate.payment_received_msg',
      params: { orderId, amount: amount || 'N/A' }
    },
  ]

  // Try to match patterns
  for (const { pattern, key, params } of messagePatterns) {
    if (pattern.test(message)) {
      try {
        const translated = t(key, params)
        // If translation exists and is different from key, return it
        if (translated && translated !== key) {
          return translated
        }
      } catch (e) {
        // If translation fails, continue to next pattern
        continue
      }
    }
  }

  // Return original message if no pattern matches
  return message
}

