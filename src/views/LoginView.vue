<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import TextField from '@/components/ui/TextField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import GSpinner from '@/components/ui/GSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permissions'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'
import { getDemoAccounts } from '@/services/auth'

const auth = useAuthStore()
const perms = usePermissionsStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { isDark, toggle } = useTheme()

const username = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const pendingDemo = ref('')
const error = ref('')
const fieldErrors = ref({})
const showHelp = ref(false)
const demo = ref([])

onMounted(async () => {
  demo.value = await getDemoAccounts()
})

function validate() {
  const e = {}
  if (!username.value.trim()) e.username = 'Нэвтрэх нэрээ оруулна уу.'
  if (!password.value) e.password = 'Нууц үгээ оруулна уу.'
  fieldErrors.value = e
  return !Object.keys(e).length
}

async function submit() {
  error.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await auth.login(username.value, password.value, remember.value)
    toast.success(`Тавтай морил, ${auth.member.firstName}`, 'DAHUB-д амжилттай нэвтэрлээ.')
    const target = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    router.replace(target)
  } catch (e) {
    error.value = e.message || 'Нэвтрэхэд алдаа гарлаа.'
  } finally {
    loading.value = false
    pendingDemo.value = ''
  }
}

function loginAs(account) {
  username.value = account.username
  password.value = account.password
  pendingDemo.value = account.username
  submit()
}
</script>

<template>
  <div class="login">
    <div class="login__bg" aria-hidden="true">
      <img class="login__mark" src="/brand/golomt-white.png" alt="" width="1800" height="510" />
    </div>

    <IconButton class="login__theme" variant="on-hero" :icon="isDark ? 'sun' : 'moon'" :label="isDark ? 'Light горим' : 'Dark горим'" @click="toggle" />

    <main class="login__main">
      <section class="login__card" aria-labelledby="login-title">
        <h1 id="login-title" class="sr-only">DAHUB системд нэвтрэх</h1>
        <div class="login__logo"><BrandLogo variant="vertical" :height="92" /></div>

        <form class="login__form" novalidate @submit.prevent="submit">
          <TextField
            v-model="username"
            label="Нэвтрэх нэр"
            icon="user"
            autocomplete="username"
            placeholder="жишээ: auditor"
            :error="fieldErrors.username"
          />
          <TextField
            v-model="password"
            label="Нууц үг"
            icon="lock"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            :error="fieldErrors.password"
            @enter="submit"
          >
            <template #suffix>
              <IconButton :icon="showPassword ? 'eye-off' : 'eye'" :label="showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'" size="sm" @click="showPassword = !showPassword" />
            </template>
          </TextField>

          <div class="login__row">
            <Checkbox v-model="remember" label="Намайг сана" />
            <button type="button" class="login__help-btn" :aria-expanded="showHelp" @click="showHelp = !showHelp">Нууц үгээ мартсан?</button>
          </div>
          <Transition name="rise">
            <p v-if="showHelp" class="login__help"><AppIcon name="info" :size="16" />Нууц үг сэргээх хүсэлтээ МТ-ийн тусламжийн төвийн дотуур 1111 дугаарт эсвэл servicedesk@golomtbank.com хаягаар илгээнэ үү.</p>
          </Transition>

          <Transition name="rise">
            <p v-if="error" class="login__error" role="alert"><AppIcon name="alert-circle" :size="16" />{{ error }}</p>
          </Transition>

          <BaseButton type="submit" size="lg" block :loading="loading && !pendingDemo">Нэвтрэх</BaseButton>
        </form>

        <div v-if="demo.length" class="login__demo">
          <p class="login__demo-title"><span>Demo хэрэглэгчээр нэвтрэх</span></p>
          <div class="login__demo-grid">
            <button v-for="a in demo" :key="a.username" type="button" class="demo" :disabled="loading" @click="loginAs(a)">
              <span class="demo__role">{{ perms.roleLabel(a.role) }}</span>
              <span class="demo__name">{{ a.name }}</span>
              <GSpinner v-if="pendingDemo === a.username" :size="16" class="demo__spin" />
              <AppIcon v-else name="arrow-right" :size="16" class="demo__arrow" />
            </button>
          </div>
          <p class="login__demo-hint">Нууц үг: <code>dahub2026</code></p>
        </div>
      </section>
    </main>

    <p class="login__foot">© {{ new Date().getFullYear() }} Голомт банк · Дотоод аудитын газар</p>
  </div>
</template>

<style scoped>
.login {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--hero-fill);
  overflow: hidden;
  isolation: isolate;
}
.login__bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
/* Large, faint watermark of the white logo — proportional, partially off-canvas */
.login__mark {
  position: absolute;
  left: -14vw;
  bottom: -9vw;
  width: 118vw;
  max-width: none;
  height: auto;
  opacity: 0.055;
}
/* Soft blue overlay: gentle light from the top, deeper toward the bottom */
.login__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(70% 55% at 78% 0%, rgba(255, 255, 255, 0.1), transparent 70%),
    linear-gradient(to bottom, transparent 30%, color-mix(in srgb, var(--hero-fill-2) 70%, transparent));
}
.login__theme { position: absolute; top: 20px; right: 20px; }
.login__main { flex: 1; display: grid; place-items: center; padding: 56px 16px 24px; }
.login__card {
  width: min(420px, 100%);
  padding: 40px 36px 32px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  box-shadow: 0 30px 80px -30px rgba(3, 18, 40, 0.55), 0 2px 8px rgba(3, 18, 40, 0.12);
  animation: card-in 560ms var(--ease-out) both;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.login__logo { display: flex; justify-content: center; margin-bottom: 32px; }
.login__form { display: flex; flex-direction: column; gap: 16px; }
.login__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.login__help-btn { font-size: var(--fs-sm); color: var(--primary); }
.login__help-btn:hover { text-decoration: underline; text-underline-offset: 3px; }
.login__help,
.login__error {
  display: flex;
  gap: 8px;
  font-size: var(--fs-sm);
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: 8px;
}
.login__help { background: var(--primary-soft); color: var(--text-2); }
.login__help .icon { color: var(--primary); flex: none; margin-top: 2px; }
.login__error { background: var(--danger-soft); color: var(--danger); }
.login__error .icon { flex: none; margin-top: 2px; }
.login__demo { margin-top: 28px; }
.login__demo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--fs-xs);
  color: var(--text-3);
  margin-bottom: 12px;
}
.login__demo-title::before,
.login__demo-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.login__demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.demo {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 32px 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: left;
  transition: border-color var(--dur-fast), background-color var(--dur-fast), transform var(--dur-base) var(--ease-out);
}
.demo:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); background: var(--primary-soft); transform: translateY(-1px); }
.demo:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.demo:disabled { opacity: 0.6; }
.demo__role { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text); }
.demo__name { font-size: var(--fs-xs); color: var(--text-3); }
.demo__arrow, .demo__spin { position: absolute; right: 10px; top: 50%; margin-top: -8px; color: var(--text-3); transition: transform var(--dur-base) var(--ease-out), color var(--dur-fast); }
.demo:hover .demo__arrow { color: var(--primary); transform: translateX(2px); }
.login__demo-hint { margin-top: 10px; text-align: center; font-size: var(--fs-xs); color: var(--text-3); }
.login__demo-hint code { font-family: var(--font-mono); color: var(--text-2); background: var(--surface-2); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border); }
.login__foot { text-align: center; padding: 0 16px 24px; font-size: var(--fs-xs); color: var(--on-hero-2); }
</style>
