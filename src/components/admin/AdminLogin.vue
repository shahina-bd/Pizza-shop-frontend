<template>
    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-md-6 col-lg-4">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white text-center">
                        <h4 class="mb-0">
                            <i class="fas fa-lock me-2"></i>
                            Admin Login
                        </h4>
                    </div>
                    <div class="card-body">
                        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            {{ errorMessage }}
                            <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                        </div>

                        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
                            <i class="fas fa-check-circle me-2"></i>
                            {{ successMessage }}
                            <button type="button" class="btn-close" @click="successMessage = ''"></button>
                        </div>

                        <form @submit.prevent="handleLogin">
                            <div class="mb-3">
                                <label for="mobile" class="form-label">
                                    <i class="fas fa-phone me-1"></i>
                                    Mobile Number
                                </label>
                                <input type="text" class="form-control" id="mobile" v-model.trim="form.mobile"
                                    placeholder="01700000000" required>
                                <small class="text-muted d-block mt-1">
                                    Default Admin:
                                    <a href="#" @click.prevent="fillDefaultAdmin" class="text-decoration-underline">
                                        01700000000
                                    </a>
                                </small>
                            </div>

                            <div class="mb-3">
                                <label for="otp" class="form-label">
                                    <i class="fas fa-key me-1"></i>
                                    OTP Code
                                </label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="otp" v-model.trim="form.otp"
                                        placeholder="6-digit OTP" maxlength="6" required>
                                    <button type="button" class="btn btn-outline-primary" @click="sendOtp"
                                        :disabled="otpSending">
                                        <span v-if="otpSending">
                                            <span class="spinner-border spinner-border-sm me-1"></span>
                                            Sending...
                                        </span>
                                        <span v-else>
                                            <i class="fas fa-paper-plane me-1"></i>
                                            Send OTP
                                        </span>
                                    </button>
                                </div>
                                <small class="text-muted">Click "Send OTP" to generate &amp; fill your 6-digit OTP</small>
                            </div>

                            <button type="submit" class="btn btn-primary w-100" :disabled="loginLoading">
                                <span v-if="loginLoading">
                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                    Logging in...
                                </span>
                                <span v-else>
                                    <i class="fas fa-sign-in-alt me-1"></i>
                                    Login
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

const router = useRouter()
const authStore = useAuthStore()

// Form Data
const form = ref({
    mobile: '01700000000',
    otp: ''
})

// State Management
const errorMessage = ref('')
const successMessage = ref('')
const otpSending = ref(false)
const loginLoading = ref(false)

const fillDefaultAdmin = () => {
    form.value.mobile = '01700000000'
}

// Function to send OTP
const sendOtp = async () => {
    if (!form.value.mobile) {
        errorMessage.value = 'Please provide a mobile number'
        return
    }

    otpSending.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await api.post('v1/send-otp', {
            mobile: form.value.mobile
        })

        if (response.data?.otp) {
            form.value.otp = String(response.data.otp)
            successMessage.value = `OTP sent! Your OTP code is ${response.data.otp} (auto-filled).`
        } else {
            successMessage.value = 'OTP has been sent. Please check your mobile/email.'
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to send OTP'
    } finally {
        otpSending.value = false
    }
}

// Function to handle Login
const handleLogin = async () => {
    if (!form.value.mobile || !form.value.otp) {
        errorMessage.value = 'Please provide both mobile number and OTP'
        return
    }

    loginLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const success = await authStore.login({
            mobile: form.value.mobile,
            otp: String(form.value.otp).trim()
        })

        if (success) {
            await router.push('/admin/dashboard')
        } else {
            errorMessage.value = 'Invalid mobile number or OTP. Please try again.'
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Invalid or expired OTP. Please try again.'
    } finally {
        loginLoading.value = false
    }
}
</script>
