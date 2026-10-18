<template>
    <div class="pizza-menu-item" :class="{ 'flex-row-reverse': isReversed }">
        <div 
            class="pizza-menu-img" 
            @click="openDetails" 
            role="button" 
            tabindex="0"
            @keydown.enter="openDetails"
            @keydown.space.prevent="openDetails"
            title="Click to view pizza details"
        >
            <img
                :src="getProductImageUrl(product)"
                :alt="product.name"
                @error="handleImageError"
            />
            <div class="pizza-img-overlay">
                <span class="pizza-view-pill">
                    <i class="fas fa-eye me-1"></i> Details
                </span>
            </div>
        </div>

        <div class="pizza-menu-info">
            <h3 @click="openDetails" class="pizza-title-clickable" title="Click to view pizza details">
                {{ product.name }}
            </h3>

            <!-- Extras Preview Strip -->
            <div
                v-if="productExtras.length > 0"
                class="pizza-card-extras"
                @click="openDetails"
                role="button"
                tabindex="0"
                @keydown.enter="openDetails"
                title="Click to choose optional extras"
            >
                <div class="pizza-card-extras-label">
                    <i class="fas fa-plus-circle me-1"></i>
                    <span>Extras (Optional):</span>
                </div>
                <div class="pizza-card-extras-pills">
                    <span
                        v-for="extra in previewExtras"
                        :key="extra.name"
                        class="pizza-card-extra-pill"
                    >
                        + {{ extra.name }} (৳{{ Number(extra.price).toFixed(2) }})
                    </span>
                    <span v-if="remainingExtrasCount > 0" class="pizza-card-extra-more">
                        +{{ remainingExtrasCount }} more
                    </span>
                </div>
            </div>

            <div class="pizza-menu-meta">
                <span class="pizza-menu-price">৳{{ product.price ?? product.selling_price }}</span>

                <div class="pizza-menu-actions">
                    <button class="pizza-menu-order-btn" @click="openDetails" title="Customize extras & order">
                        Order
                    </button>
                    <button 
                        class="pizza-menu-cart-btn" 
                        :class="{ 'added': isAdded }"
                        @click="addToCart" 
                        :disabled="isAdded"
                        title="Quick Add to Cart"
                    >
                        <i :class="isAdded ? 'fas fa-check' : 'fas fa-cart-plus'"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Product Details Pop-Up Modal -->
        <ProductDetailModal 
            :product="product" 
            :is-open="isModalOpen" 
            @close="isModalOpen = false" 
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getProductImageUrl, handleImageError } from '@/utils/imageHelper'
import ProductDetailModal from '@/components/customer/ProductDetailModal.vue'

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
        required: true,
    },
    isReversed: {
        type: Boolean,
        default: false,
    },
})

const cartStore = useCartStore()
const isAdded = ref(false)
const isModalOpen = ref(false)

const productExtras = computed(() => {
    if (Array.isArray(props.product?.extras) && props.product.extras.length > 0) {
        return props.product.extras
    }
    return DEFAULT_EXTRAS
})

const previewExtras = computed(() => productExtras.value.slice(0, 3))
const remainingExtrasCount = computed(() => Math.max(0, productExtras.value.length - 3))

const openDetails = () => {
    isModalOpen.value = true
}

const addToCart = () => {
    cartStore.addToCart(props.product)
    isAdded.value = true
    setTimeout(() => {
        isAdded.value = false
    }, 1500)
}
</script>

<style scoped>
.pizza-menu-img {
    cursor: pointer;
    position: relative;
}

.pizza-img-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;
    z-index: 3;
}

.pizza-menu-img:hover .pizza-img-overlay {
    opacity: 1;
}

.pizza-view-pill {
    background: rgba(18, 18, 18, 0.9);
    color: var(--pizza-gold);
    border: 1px solid var(--pizza-gold);
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    transform: translateY(6px);
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: inline-flex;
    align-items: center;
}

.pizza-menu-img:hover .pizza-view-pill {
    transform: translateY(0);
}

.pizza-title-clickable {
    cursor: pointer;
    transition: color 0.2s ease;
}

.pizza-title-clickable:hover {
    color: var(--pizza-gold);
}

.pizza-card-extras {
    margin-bottom: 10px;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px dashed rgba(250, 197, 100, 0.35);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pizza-card-extras:hover {
    background: rgba(250, 197, 100, 0.08);
    border-color: var(--pizza-gold);
}

.pizza-card-extras-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--pizza-gold);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
}

.pizza-card-extras-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
}

.pizza-card-extra-pill {
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 1px 6px;
    border-radius: 10px;
    white-space: nowrap;
}

.pizza-card-extra-more {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--pizza-gold);
    padding-left: 2px;
}

.pizza-menu-meta {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: auto;
    width: 100%;
}

.pizza-menu-price {
    color: var(--pizza-gold);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.2;
}

.pizza-menu-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
}

.pizza-menu-order-btn {
    flex: 1;
    background: var(--pizza-gold);
    color: var(--pizza-black) !important;
    border: 1px solid var(--pizza-gold);
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pizza-menu-order-btn:hover {
    background: var(--pizza-gold-hover);
    border-color: var(--pizza-gold-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(250, 197, 100, 0.35);
}

.pizza-menu-cart-btn {
    flex: 0 0 38px;
    background: transparent;
    color: var(--pizza-gold);
    border: 1px solid rgba(250, 197, 100, 0.5);
    font-size: 0.95rem;
    width: 38px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.pizza-menu-cart-btn i {
    transition: transform 0.2s ease;
}

.pizza-menu-cart-btn:hover {
    background: rgba(250, 197, 100, 0.1);
    border-color: var(--pizza-gold);
    color: var(--pizza-gold);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(250, 197, 100, 0.2);
}

.pizza-menu-cart-btn:hover i {
    transform: scale(1.15);
}

.pizza-menu-cart-btn.added {
    background: #28a745 !important;
    border-color: #28a745 !important;
    color: var(--pizza-white) !important;
}

.pizza-menu-cart-btn.added i {
    transform: scale(1.1);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }
    100% {
        transform: scale(1.1);
        opacity: 1;
    }
}
</style>
