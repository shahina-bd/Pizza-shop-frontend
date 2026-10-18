import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProductImageUrl } from '@/utils/imageHelper'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart_items')) || [])

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => {
      return total + Number(item.price) * item.quantity
    }, 0)
  })

  const saveCart = () => {
    localStorage.setItem('cart_items', JSON.stringify(items.value))
  }

  const buildExtrasKey = (extras = []) => {
    if (!Array.isArray(extras) || extras.length === 0) return ''
    return extras
      .map((e) => `${(e.name || '').trim().toLowerCase()}:${Number(e.price || 0).toFixed(2)}`)
      .sort()
      .join('|')
  }

  const addToCart = (product, quantity = 1, selectedExtras = []) => {
    const qty = Math.max(1, parseInt(quantity) || 1)
    const normalizedExtras = Array.isArray(selectedExtras)
      ? selectedExtras.map((e) => ({
          name: e.name,
          price: Number(e.price) || 0,
        }))
      : []

    const extrasKey = buildExtrasKey(normalizedExtras)
    const cartKey = extrasKey ? `${product.id}__${extrasKey}` : `${product.id}`

    const basePrice = Number(product.price ?? product.selling_price ?? 0)
    const extrasTotal = normalizedExtras.reduce((sum, e) => sum + e.price, 0)
    const unitPrice = Number((basePrice + extrasTotal).toFixed(2))

    const existingItem = items.value.find(
      (item) => (item.cartKey ?? `${item.id}`) === cartKey
    )

    if (existingItem) {
      existingItem.quantity += qty
    } else {
      items.value.push({
        cartKey,
        id: product.id,
        name: product.name,
        basePrice,
        extras: normalizedExtras,
        extrasTotal: Number(extrasTotal.toFixed(2)),
        price: unitPrice,
        image: getProductImageUrl(product),
        quantity: qty,
      })
    }

    saveCart()
  }

  const findItem = (keyOrId) => {
    return items.value.find(
      (item) => item.cartKey === keyOrId || item.id === keyOrId
    )
  }

  const increaseQuantity = (keyOrId) => {
    const item = findItem(keyOrId)

    if (item) {
      item.quantity += 1
      saveCart()
    }
  }

  const decreaseQuantity = (keyOrId) => {
    const item = findItem(keyOrId)

    if (!item) return

    if (item.quantity > 1) {
      item.quantity -= 1
    } else {
      removeItem(keyOrId)
      return
    }

    saveCart()
  }

  const removeItem = (keyOrId) => {
    const target = findItem(keyOrId)
    if (!target) return
    items.value = items.value.filter((item) => item !== target)
    saveCart()
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  return {
    items,
    totalItems,
    totalAmount,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  }
})
