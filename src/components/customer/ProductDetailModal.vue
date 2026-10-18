<template>
  <Teleport to="body">
    <Transition name="pizza-modal-fade">
      <div 
        v-if="isOpen" 
        class="pizza-modal-backdrop" 
        @click.self="closeModal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'modal-title-' + (product?.id || 'pizza')"
      >
        <div class="pizza-modal-container">
          <div class="pizza-modal-card">
            <!-- Close Button -->
            <button 
              class="pizza-modal-close" 
              @click="closeModal" 
              aria-label="Close product details"
              title="Close (Esc)"
            >
              <i class="fas fa-times"></i>
            </button>

            <div class="pizza-modal-content">
              <!-- Left: Image Showcase -->
              <div class="pizza-modal-media">
                <div class="pizza-modal-img-wrap">
                  <img
                    :src="getProductImageUrl(product)"
                    :alt="product?.name || 'Pizza'"
                    class="pizza-modal-img"
                    @error="handleImageError"
                  />
                  <div class="pizza-modal-glow"></div>
                </div>

                <!-- Badges under image -->
                <div class="pizza-modal-tags">
                  <span class="pizza-tag tag-category" v-if="categoryName">
                    <i class="fas fa-utensils me-1"></i> {{ categoryName }}
                  </span>
                  <span class="pizza-tag tag-size" v-if="product?.size">
                    <i class="fas fa-pizza-slice me-1"></i> {{ product.size }}
                  </span>
                  <span class="pizza-tag tag-fresh">
                    <i class="fas fa-fire me-1"></i> Hot & Fresh
                  </span>
                </div>
              </div>

              <!-- Right: Product Info & Actions -->
              <div class="pizza-modal-details">
                <div class="pizza-modal-header">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="pizza-modal-accent">{{ categoryName || 'Chef Special' }}</span>
                    <div class="pizza-modal-rating">
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star"></i>
                      <i class="fas fa-star-half-alt"></i>
                      <span class="rating-text">4.9 / 5</span>
                    </div>
                  </div>

                  <h2 :id="'modal-title-' + (product?.id || 'pizza')" class="pizza-modal-title">
                    {{ product?.name }}
                  </h2>

                  <div class="pizza-modal-price-row">
                    <div class="pizza-modal-price">
                      ৳{{ formattedPrice }}
                    </div>
                    <div class="pizza-modal-stock">
                      <span v-if="isOutOfStock" class="stock-badge out-of-stock">
                        <i class="fas fa-times-circle me-1"></i> Out of Stock
                      </span>
                      <span v-else class="stock-badge in-stock">
                        <i class="fas fa-check-circle me-1"></i> In Stock {{ stockDisplay }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Description & Extras -->
                <div class="pizza-modal-body">
                  <h6 class="section-subtitle">
                    <i class="fas fa-info-circle me-1 text-gold"></i> Description
                  </h6>
                  <p class="pizza-modal-desc">
                    {{ product?.description || 'Authentic artisan pizza prepared with hand-stretched dough, savory Italian tomato sauce, creamy melted mozzarella, and premium fresh toppings, baked to golden perfection.' }}
                  </p>

                  <!-- Highlights -->
                  <div class="pizza-modal-highlights">
                    <div class="highlight-item">
                      <i class="fas fa-seedling"></i>
                      <span>Fresh Ingredients</span>
                    </div>
                    <div class="highlight-item">
                      <i class="fas fa-temperature-high"></i>
                      <span>Wood-Fired Oven</span>
                    </div>
                    <div class="highlight-item">
                      <i class="fas fa-clock"></i>
                      <span>15-20 Mins Delivery</span>
                    </div>
                  </div>

                  <!-- Optional Extras Section -->
                  <div class="pizza-extras-section" v-if="availableExtras.length > 0">
                    <div class="pizza-extras-header">
                      <div>
                        <h6 class="pizza-extras-title">Extras</h6>
                        <span class="pizza-extras-subtitle">Optional</span>
                      </div>
                      <div v-if="selectedExtras.length > 0" class="pizza-extras-summary">
                        <span class="extras-selected-badge">
                          {{ selectedExtras.length }} selected (+৳{{ extrasUnitTotal.toFixed(2) }})
                        </span>
                        <button
                          type="button"
                          class="extras-clear-btn"
                          @click="clearExtras"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div class="pizza-extras-list">
                      <div
                        v-for="extra in availableExtras"
                        :key="extra.name"
                        class="pizza-extra-row"
                        :class="{ 'is-selected': isExtraSelected(extra) }"
                        @click="toggleExtra(extra)"
                        role="button"
                        tabindex="0"
                        :aria-pressed="isExtraSelected(extra)"
                        @keydown.enter.prevent="toggleExtra(extra)"
                        @keydown.space.prevent="toggleExtra(extra)"
                      >
                        <span class="pizza-extra-name">{{ extra.name }}</span>

                        <div class="pizza-extra-right">
                          <span class="pizza-extra-price">
                            + ৳{{ formatExtraPrice(extra.price) }}
                          </span>
                          <button
                            type="button"
                            class="pizza-extra-btn"
                            :class="{ 'is-selected': isExtraSelected(extra) }"
                            @click.stop="toggleExtra(extra)"
                            :aria-label="(isExtraSelected(extra) ? 'Remove ' : 'Add ') + extra.name"
                          >
                            <i :class="isExtraSelected(extra) ? 'fas fa-check' : 'fas fa-plus'"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions / Cart -->
                <div class="pizza-modal-footer">
                  <!-- Quantity Stepper -->
                  <div class="quantity-row">
                    <span class="quantity-label">Quantity:</span>
                    <div class="quantity-stepper">
                      <button 
                        type="button" 
                        class="stepper-btn" 
                        @click="decrementQuantity" 
                        :disabled="quantity <= 1 || isOutOfStock"
                        aria-label="Decrease quantity"
                      >
                        <i class="fas fa-minus"></i>
                      </button>
                      <span class="stepper-value">{{ quantity }}</span>
                      <button 
                        type="button" 
                        class="stepper-btn" 
                        @click="incrementQuantity" 
                        :disabled="isMaxQuantity || isOutOfStock"
                        aria-label="Increase quantity"
                      >
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>

                    <div class="total-preview-wrap">
                      <div class="total-preview">
                        <span class="total-label">Subtotal:</span>
                        <span class="total-amount">৳{{ subtotal }}</span>
                      </div>
                      <small v-if="extrasUnitTotal > 0" class="extras-subtotal-note">
                        Includes +৳{{ (extrasUnitTotal * quantity).toFixed(2) }} extras
                      </small>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pizza-modal-actions">
                    <button 
                      class="btn btn-modal-cart" 
                      :class="{ 'btn-added': isAdded }"
                      @click="addToCart" 
                      :disabled="isOutOfStock || isAdded"
                    >
                      <i :class="isAdded ? 'fas fa-check' : 'fas fa-cart-plus'" class="me-2"></i>
                      {{ isAdded ? 'Added to Cart!' : 'Add to Cart' }}
                    </button>
                    
                    <button 
                      class="btn btn-modal-order" 
                      @click="orderNow" 
                      :disabled="isOutOfStock"
                    >
                      <i class="fas fa-bolt me-2"></i> Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCartStore } from '@/stores/cart'
import { getProductImageUrl, handleImageError } from '@/utils/imageHelper'

const DEFAULT_EXTRAS = [
  { name: 'Bufala', price: 4.00 },
  { name: 'Burrata', price: 4.00 },
  { name: 'Lachs', price: 4.00 },
  { name: 'Parmaschinken', price: 4.00 },
  { name: 'Garnelen', price: 4.00 },
  { name: 'Funghi', price: 2.50 },
  { name: 'gekochterschinken', price: 2.50 },
  { name: 'Salame', price: 2.50 },
  { name: 'Spinat', price: 2.50 },
  { name: 'Gorgonzola', price: 2.50 },
]

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'added'])

const router = useRouter()
const cartStore = useCartStore()

const quantity = ref(1)
const isAdded = ref(false)
const selectedExtras = ref([])
const freshExtras = ref(null)

const fetchLatestProductExtras = async (productId) => {
  if (!productId) return
  try {
    const response = await api.get(`pizzas/${productId}`)
    const pizzaData = response.data?.pizza ?? response.data?.data ?? response.data
    if (Array.isArray(pizzaData?.extras)) {
      freshExtras.value = pizzaData.extras
    }
  } catch (err) {
    // Fallback to props.product.extras or DEFAULT_EXTRAS silently
  }
}

// Reset quantity and selected extras when modal opens or product changes
watch(
  [() => props.isOpen, () => props.product?.id],
  ([newOpen, productId]) => {
    if (newOpen) {
      quantity.value = 1
      selectedExtras.value = []
      freshExtras.value = null
      isAdded.value = false
      document.body.style.overflow = 'hidden'
      fetchLatestProductExtras(productId)
    } else {
      document.body.style.overflow = ''
    }
  }
)

const availableExtras = computed(() => {
  const sourceExtras = Array.isArray(freshExtras.value)
    ? freshExtras.value
    : Array.isArray(props.product?.extras) && props.product.extras.length > 0
      ? props.product.extras
      : DEFAULT_EXTRAS

  return sourceExtras
    .filter((extra) => extra && extra.name)
    .map((extra) => ({
      name: String(extra.name).trim(),
      price: Number(extra.price) || 0,
    }))
})

const isExtraSelected = (extra) => {
  return selectedExtras.value.some((item) => item.name === extra.name)
}

const toggleExtra = (extra) => {
  if (isOutOfStock.value) return
  const index = selectedExtras.value.findIndex((item) => item.name === extra.name)
  if (index >= 0) {
    selectedExtras.value.splice(index, 1)
  } else {
    selectedExtras.value.push({
      name: extra.name,
      price: Number(extra.price) || 0,
    })
  }
}

const clearExtras = () => {
  selectedExtras.value = []
}

const formatExtraPrice = (price) => {
  return (Number(price) || 0).toFixed(2)
}

// Price formatting
const priceNum = computed(() => {
  if (!props.product) return 0
  const rawPrice = props.product.price ?? props.product.selling_price ?? 0
  return Number(rawPrice) || 0
})

const extrasUnitTotal = computed(() => {
  return selectedExtras.value.reduce((sum, extra) => sum + (Number(extra.price) || 0), 0)
})

const formattedPrice = computed(() => {
  return priceNum.value.toFixed(2)
})

const subtotal = computed(() => {
  return ((priceNum.value + extrasUnitTotal.value) * quantity.value).toFixed(2)
})

const categoryName = computed(() => {
  if (!props.product) return ''
  return props.product.category?.name || props.product.category || ''
})

const isOutOfStock = computed(() => {
  if (!props.product) return false
  if (props.product.stock !== undefined && props.product.stock !== null) {
    return Number(props.product.stock) <= 0
  }
  return false
})

const stockDisplay = computed(() => {
  if (props.product?.stock !== undefined && props.product?.stock !== null && props.product.stock > 0) {
    return `(${props.product.stock} left)`
  }
  return ''
})

const isMaxQuantity = computed(() => {
  if (props.product?.stock && props.product.stock > 0) {
    return quantity.value >= Number(props.product.stock)
  }
  return quantity.value >= 99
})

const incrementQuantity = () => {
  if (!isMaxQuantity.value) {
    quantity.value += 1
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

const closeModal = () => {
  emit('close')
}

const addToCart = () => {
  if (!props.product || isOutOfStock.value) return

  cartStore.addToCart(props.product, quantity.value, selectedExtras.value)
  isAdded.value = true
  emit('added', {
    product: props.product,
    quantity: quantity.value,
    extras: [...selectedExtras.value],
  })

  setTimeout(() => {
    isAdded.value = false
  }, 1600)
}

const orderNow = () => {
  if (!props.product || isOutOfStock.value) return

  cartStore.addToCart(props.product, quantity.value, selectedExtras.value)
  closeModal()
  router.push({ name: 'cart' })
}

// Keyboard ESC to close modal
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.pizza-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.pizza-modal-container {
  width: 100%;
  max-width: 900px;
  position: relative;
  margin: auto;
}

.pizza-modal-card {
  position: relative;
  background: #141414;
  border: 1px solid rgba(250, 197, 100, 0.28);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(250, 197, 100, 0.12);
  overflow: hidden;
  color: var(--pizza-white);
  font-family: var(--pizza-font, 'Poppins', sans-serif);
}

.pizza-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(250, 197, 100, 0.3);
  background: rgba(0, 0, 0, 0.6);
  color: var(--pizza-white);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.25s ease;
}

.pizza-modal-close:hover {
  background: var(--pizza-gold);
  color: var(--pizza-black);
  border-color: var(--pizza-gold);
  transform: rotate(90deg);
}

.pizza-modal-content {
  display: flex;
  flex-direction: row;
}

/* Left Media Column */
.pizza-modal-media {
  flex: 0 0 42%;
  width: 42%;
  background: radial-gradient(circle at center, #26170e 0%, #110b06 100%);
  border-right: 1px solid rgba(250, 197, 100, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  position: relative;
}

.pizza-modal-img-wrap {
  position: relative;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.pizza-modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
  border: 3px solid rgba(250, 197, 100, 0.35);
  transition: transform 0.4s ease;
  z-index: 2;
}

.pizza-modal-card:hover .pizza-modal-img {
  transform: scale(1.03) rotate(3deg);
}

.pizza-modal-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(250, 197, 100, 0.25) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.pizza-modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.pizza-tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.tag-category {
  background: rgba(250, 197, 100, 0.15);
  color: var(--pizza-gold);
  border: 1px solid rgba(250, 197, 100, 0.4);
}

.tag-size {
  background: rgba(255, 255, 255, 0.08);
  color: var(--pizza-white);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tag-fresh {
  background: rgba(235, 94, 40, 0.2);
  color: #ff8c5a;
  border: 1px solid rgba(235, 94, 40, 0.4);
}

/* Right Details Column */
.pizza-modal-details {
  flex: 0 0 58%;
  width: 58%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #141414;
}

.pizza-modal-accent {
  font-family: var(--pizza-script, cursive);
  color: var(--pizza-gold);
  font-size: 1.4rem;
  line-height: 1;
}

.pizza-modal-rating {
  font-size: 0.8rem;
  color: #ffc107;
  display: flex;
  align-items: center;
  gap: 3px;
}

.pizza-modal-rating .rating-text {
  color: var(--pizza-muted);
  font-size: 0.75rem;
  margin-left: 6px;
}

.pizza-modal-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--pizza-white);
  letter-spacing: 0.5px;
  margin-bottom: 0.65rem;
  text-transform: capitalize;
}

.pizza-modal-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1rem;
}

.pizza-modal-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--pizza-gold);
  letter-spacing: 0.5px;
}

.stock-badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.stock-badge.in-stock {
  background: rgba(40, 167, 69, 0.15);
  color: #4cd964;
  border: 1px solid rgba(40, 167, 69, 0.35);
}

.stock-badge.out-of-stock {
  background: rgba(220, 53, 69, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.35);
}

.section-subtitle {
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--pizza-muted);
  margin-bottom: 0.35rem;
}

.text-gold {
  color: var(--pizza-gold);
}

.pizza-modal-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.88rem;
  line-height: 1.55;
  font-weight: 300;
  margin-bottom: 1rem;
}

.pizza-modal-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.highlight-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.5rem 0.4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.highlight-item i {
  color: var(--pizza-gold);
  font-size: 0.95rem;
}

.highlight-item span {
  font-size: 0.68rem;
  color: var(--pizza-muted);
  letter-spacing: 0.3px;
}

/* Optional Extras Section (matching 2nd image layout) */
.pizza-extras-section {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a;
  margin-bottom: 1.1rem;
  border-radius: 6px;
  overflow: hidden;
}

.pizza-extras-header {
  background: rgba(255, 255, 255, 0.06);
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pizza-extras-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--pizza-white);
  margin: 0;
  line-height: 1.2;
}

.pizza-extras-subtitle {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-top: 2px;
}

.pizza-extras-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.extras-selected-badge {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--pizza-gold);
  background: rgba(250, 197, 100, 0.14);
  border: 1px solid rgba(250, 197, 100, 0.35);
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
}

.extras-clear-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.74rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.extras-clear-btn:hover {
  color: var(--pizza-gold);
}

.pizza-extras-list {
  max-height: 215px;
  overflow-y: auto;
}

.pizza-extras-list::-webkit-scrollbar {
  width: 6px;
}

.pizza-extras-list::-webkit-scrollbar-track {
  background: #141414;
}

.pizza-extras-list::-webkit-scrollbar-thumb {
  background: rgba(250, 197, 100, 0.35);
  border-radius: 3px;
}

.pizza-extra-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.18s ease;
  user-select: none;
}

.pizza-extra-row:last-child {
  border-bottom: none;
}

.pizza-extra-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.pizza-extra-row.is-selected {
  background: rgba(250, 197, 100, 0.1);
}

.pizza-extra-name {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--pizza-white);
}

.pizza-extra-row.is-selected .pizza-extra-name {
  font-weight: 600;
  color: var(--pizza-gold);
}

.pizza-extra-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pizza-extra-price {
  font-size: 0.88rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}

.pizza-extra-row.is-selected .pizza-extra-price {
  color: var(--pizza-gold);
  font-weight: 600;
}

.pizza-extra-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--pizza-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pizza-extra-row:hover .pizza-extra-btn:not(.is-selected) {
  border-color: var(--pizza-gold);
  color: var(--pizza-gold);
  background: rgba(250, 197, 100, 0.15);
}

.pizza-extra-btn.is-selected {
  background: var(--pizza-gold);
  border-color: var(--pizza-gold);
  color: var(--pizza-black);
}

/* Footer & Stepper */
.pizza-modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1rem;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.quantity-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--pizza-muted);
}

.quantity-stepper {
  display: inline-flex;
  align-items: center;
  background: #0d0d0d;
  border: 1px solid rgba(250, 197, 100, 0.4);
}

.stepper-btn {
  background: transparent;
  border: none;
  color: var(--pizza-gold);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.stepper-btn:hover:not(:disabled) {
  background: rgba(250, 197, 100, 0.15);
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stepper-value {
  width: 44px;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--pizza-white);
}

.total-preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-preview {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.total-label {
  font-size: 0.85rem;
  color: var(--pizza-muted);
}

.total-amount {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--pizza-gold);
}

.extras-subtotal-note {
  font-size: 0.72rem;
  color: rgba(250, 197, 100, 0.85);
}

/* Action Buttons */
.pizza-modal-actions {
  display: flex;
  gap: 0.85rem;
}

.btn-modal-cart {
  flex: 1;
  background: transparent;
  color: var(--pizza-gold);
  border: 2px solid var(--pizza-gold);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.7rem 1.2rem;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-modal-cart:hover:not(:disabled) {
  background: rgba(250, 197, 100, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(250, 197, 100, 0.25);
}

.btn-modal-cart.btn-added {
  background: #28a745 !important;
  border-color: #28a745 !important;
  color: #fff !important;
}

.btn-modal-order {
  flex: 1;
  background: var(--pizza-gold);
  color: var(--pizza-black) !important;
  border: 2px solid var(--pizza-gold);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.7rem 1.2rem;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(250, 197, 100, 0.3);
}

.btn-modal-order:hover:not(:disabled) {
  background: var(--pizza-gold-hover);
  border-color: var(--pizza-gold-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(250, 197, 100, 0.45);
}

.btn-modal-cart:disabled,
.btn-modal-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
.pizza-modal-fade-enter-active,
.pizza-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.pizza-modal-fade-enter-active .pizza-modal-card,
.pizza-modal-fade-leave-active .pizza-modal-card {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
}

.pizza-modal-fade-enter-from,
.pizza-modal-fade-leave-to {
  opacity: 0;
}

.pizza-modal-fade-enter-from .pizza-modal-card {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.pizza-modal-fade-leave-to .pizza-modal-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .pizza-modal-content {
    flex-direction: column;
  }

  .pizza-modal-media {
    flex: 0 0 100%;
    width: 100%;
    padding: 2rem 1.5rem 1.5rem;
    border-right: none;
    border-bottom: 1px solid rgba(250, 197, 100, 0.15);
  }

  .pizza-modal-img-wrap {
    width: 180px;
    height: 180px;
    margin-bottom: 1rem;
  }

  .pizza-modal-details {
    flex: 0 0 100%;
    width: 100%;
    padding: 1.5rem;
  }

  .pizza-modal-title {
    font-size: 1.45rem;
  }

  .pizza-modal-highlights {
    grid-template-columns: repeat(3, 1fr);
  }

  .pizza-modal-actions {
    flex-direction: column;
  }
}
</style>
