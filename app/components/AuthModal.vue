<script setup lang="ts">
import { EMAIL_RE, type AuthMode } from '~/composables/useAuth'

/**
 * Sign in / create account / reset password, plus the signed-in summary.
 *
 * One dialog with four faces rather than four dialogs, so the focus trap, scroll
 * lock and escape handling only have to be right once. The mock has no network,
 * so a short delay stands in for a real round trip and keeps the pending state
 * honest instead of decorative.
 */
const { user, open, mode, closeAuth, signUp, signIn, requestReset, signOut } = useAuth()

const card = ref<HTMLElement | null>(null)

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const busy = ref(false)
const formError = ref('')
const fieldErrors = reactive<Record<string, string>>({})
const resetSentTo = ref('')

const SIMULATED_LATENCY_MS = 450

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
  signin: {
    title: 'Sign in',
    subtitle: 'Use your App Store account to keep purchases and reviews in sync.',
    submit: 'Sign in',
  },
  signup: {
    title: 'Create account',
    subtitle: 'One account for apps, games and Apple Arcade.',
    submit: 'Create account',
  },
  forgot: {
    title: 'Reset password',
    subtitle: 'We’ll email you a link to choose a new one.',
    submit: 'Send reset link',
  },
  account: { title: 'Your account', subtitle: 'Signed in on this device.', submit: '' },
}

const copy = computed(() => COPY[mode.value])
const headingId = 'auth-modal-title'

const showSent = computed(() => resetSentTo.value !== '')
const showAccount = computed(() => mode.value === 'account' && !showSent.value)
const showForm = computed(() => mode.value !== 'account' && !showSent.value)

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(''),
)

const INPUT_BASE =
  'h-11 w-full rounded-[11px] border bg-fill pr-3 text-[14px] text-ink transition outline-none placeholder:text-muted'
const FOCUS_OK = 'border-transparent focus:border-blue/40 focus:ring-4 focus:ring-blue/12'
const FOCUS_BAD = 'border-error focus:ring-4 focus:ring-error/12'

const fieldClass = (field: string) => (fieldErrors[field] ? FOCUS_BAD : FOCUS_OK)

/* ------------------------------- focus ---------------------------------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let restoreFocus: HTMLElement | null = null
let restoreOverflow = ''

function focusFirst() {
  const target = card.value?.querySelector<HTMLElement>('input, [data-autofocus]')
  ;(target ?? card.value)?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeAuth()
    return
  }
  if (event.key !== 'Tab' || !card.value) return

  // Keep Tab inside the dialog: without this, tabbing walks out into the page
  // behind the overlay, which is invisible to the user.
  const nodes = [...card.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  )
  if (!nodes.length) return

  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  const active = document.activeElement

  if (event.shiftKey && (active === first || !card.value.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(open, async (value) => {
  if (!import.meta.client) return
  if (value) {
    restoreFocus = document.activeElement as HTMLElement | null
    restoreOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    focusFirst()
  } else {
    document.body.style.overflow = restoreOverflow
    restoreFocus?.focus?.()
    restoreFocus = null
  }
})

// Switching faces starts a fresh form, but keeps the email so "forgot password"
// after a failed sign-in doesn't make anyone retype it.
watch(mode, async () => {
  formError.value = ''
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
  resetSentTo.value = ''
  password.value = ''
  confirm.value = ''
  showPassword.value = false
  await nextTick()
  if (open.value) focusFirst()
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = restoreOverflow
})

/* ------------------------------ validation ------------------------------ */

function validate(): boolean {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
  formError.value = ''

  if (mode.value === 'signup' && name.value.trim().length < 2) {
    fieldErrors.name = 'Enter your name.'
  }
  if (!EMAIL_RE.test(email.value.trim())) {
    fieldErrors.email = 'Enter a valid email address.'
  }

  if (mode.value === 'signup') {
    if (password.value.length < 8) fieldErrors.password = 'Use at least 8 characters.'
    else if (!/[a-z]/i.test(password.value) || !/\d/.test(password.value)) {
      fieldErrors.password = 'Include at least one letter and one number.'
    }
    if (!fieldErrors.password && confirm.value !== password.value) {
      fieldErrors.confirm = 'Those passwords don’t match.'
    }
  } else if (mode.value === 'signin' && !password.value) {
    fieldErrors.password = 'Enter your password.'
  }

  const invalid = Object.keys(fieldErrors).length > 0
  if (invalid) {
    void nextTick(() =>
      card.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    )
  }
  return !invalid
}

async function submit() {
  if (busy.value || !validate()) return

  busy.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

    if (mode.value === 'forgot') {
      resetSentTo.value = requestReset(email.value).email
      await nextTick()
      card.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
      return
    }

    const result =
      mode.value === 'signup'
        ? await signUp({ name: name.value, email: email.value, password: password.value })
        : await signIn({ email: email.value, password: password.value })

    if (result.ok) {
      mode.value = 'account'
      return
    }
    if (result.field) fieldErrors[result.field] = result.message
    else formError.value = result.message
  } finally {
    busy.value = false
  }
}

function handleSignOut() {
  signOut()
  closeAuth()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-[7vh] frosted"
        @click.self="closeAuth()"
      >
        <Transition
          appear
          enter-active-class="transition-transform duration-200"
          enter-from-class="scale-[0.97]"
        >
          <div
            ref="card"
            class="relative w-full max-w-[420px] rounded-[22px] bg-card p-6 shadow-apple-float outline-none sm:p-7"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="headingId"
            tabindex="-1"
          >
            <button
              type="button"
              class="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-fill"
              aria-label="Close"
              @click="closeAuth()"
            >
              <UiIcon name="close" :size="16" />
            </button>

            <header class="pr-10">
              <span
                v-if="showAccount"
                class="grid h-12 w-12 place-items-center rounded-full text-[17px] font-semibold text-white"
                style="background: linear-gradient(160deg, #1f9bf7 0%, #0a6ae0 100%)"
                aria-hidden="true"
              >
                {{ initials }}
              </span>
              <h2 :id="headingId" class="text-[21px] leading-tight font-bold tracking-[-0.02em]">
                {{ copy.title }}
              </h2>
              <p class="mt-1.5 text-[13px] leading-[1.5] text-muted">{{ copy.subtitle }}</p>
            </header>

            <!-- Reset link sent -->
            <div v-if="showSent" class="mt-6">
              <div
                class="flex items-start gap-2.5 rounded-[14px] bg-fill-subtle p-3.5"
                role="status"
              >
                <UiIcon name="check" :size="17" class="mt-px shrink-0 text-link" />
                <p class="text-[13px] leading-[1.5] text-ink">
                  If an account exists for
                  <span class="font-medium">{{ resetSentTo }}</span
                  >, a reset link is on its way. The link expires in 30 minutes.
                </p>
              </div>
              <button
                type="button"
                data-autofocus
                class="mt-5 h-11 w-full rounded-full border border-hairline bg-card text-[14px] font-semibold text-ink transition hover:bg-fill-subtle"
                @click="mode = 'signin'"
              >
                Back to sign in
              </button>
            </div>

            <!-- Signed in -->
            <div v-else-if="showAccount" class="mt-6">
              <dl class="rounded-[14px] bg-fill-subtle p-4 text-[13px]">
                <dt class="text-muted">Name</dt>
                <dd class="mt-0.5 font-medium text-ink">{{ user?.name }}</dd>
                <dt class="mt-3 text-muted">Email</dt>
                <dd class="mt-0.5 font-medium break-all text-ink">{{ user?.email }}</dd>
              </dl>
              <button
                type="button"
                data-autofocus
                class="mt-5 h-11 w-full rounded-full bg-blue text-[14px] font-semibold text-on-blue transition hover:bg-blue-hover"
                @click="handleSignOut()"
              >
                Sign out
              </button>
            </div>

            <!-- Forms -->
            <form v-else-if="showForm" class="mt-6 space-y-4" novalidate @submit.prevent="submit()">
              <div v-if="mode === 'signup'">
                <label for="auth-name" class="block text-[12.5px] font-medium text-ink">Name</label>
                <div class="relative mt-1.5">
                  <UiIcon
                    name="person"
                    :size="16"
                    class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-name"
                    v-model="name"
                    type="text"
                    autocomplete="name"
                    placeholder="Alex Rivera"
                    :class="[INPUT_BASE, fieldClass('name'), 'pl-9']"
                    :aria-invalid="fieldErrors.name ? 'true' : undefined"
                    :aria-describedby="fieldErrors.name ? 'auth-name-error' : undefined"
                  />
                </div>
                <p
                  v-if="fieldErrors.name"
                  id="auth-name-error"
                  class="mt-1.5 flex items-start gap-1 text-[12.5px] text-error"
                >
                  <UiIcon name="info" :size="13" class="mt-px" />
                  {{ fieldErrors.name }}
                </p>
              </div>

              <div>
                <label for="auth-email" class="block text-[12.5px] font-medium text-ink">
                  Email
                </label>
                <div class="relative mt-1.5">
                  <UiIcon
                    name="mail"
                    :size="16"
                    class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                    :class="[INPUT_BASE, fieldClass('email'), 'pl-9']"
                    :aria-invalid="fieldErrors.email ? 'true' : undefined"
                    :aria-describedby="fieldErrors.email ? 'auth-email-error' : undefined"
                  />
                </div>
                <p
                  v-if="fieldErrors.email"
                  id="auth-email-error"
                  class="mt-1.5 flex items-start gap-1 text-[12.5px] text-error"
                >
                  <UiIcon name="info" :size="13" class="mt-px" />
                  {{ fieldErrors.email }}
                </p>
              </div>

              <div v-if="mode !== 'forgot'">
                <label for="auth-password" class="block text-[12.5px] font-medium text-ink">
                  Password
                </label>
                <div class="relative mt-1.5">
                  <UiIcon
                    name="lock"
                    :size="16"
                    class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                    placeholder="At least 8 characters"
                    :class="[INPUT_BASE, fieldClass('password'), 'pr-11 pl-9']"
                    :aria-invalid="fieldErrors.password ? 'true' : undefined"
                    :aria-describedby="
                      fieldErrors.password
                        ? 'auth-password-error'
                        : mode === 'signup'
                          ? 'auth-password-hint'
                          : undefined
                    "
                  />
                  <button
                    type="button"
                    class="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-fill-strong"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    @click="showPassword = !showPassword"
                  >
                    <UiIcon :name="showPassword ? 'eyeOff' : 'eye'" :size="16" />
                  </button>
                </div>
                <p
                  v-if="fieldErrors.password"
                  id="auth-password-error"
                  class="mt-1.5 flex items-start gap-1 text-[12.5px] text-error"
                >
                  <UiIcon name="info" :size="13" class="mt-px" />
                  {{ fieldErrors.password }}
                </p>
                <p
                  v-else-if="mode === 'signup'"
                  id="auth-password-hint"
                  class="mt-1.5 text-[12px] text-muted"
                >
                  At least 8 characters, with a letter and a number.
                </p>
              </div>

              <div v-if="mode === 'signup'">
                <label for="auth-confirm" class="block text-[12.5px] font-medium text-ink">
                  Confirm password
                </label>
                <div class="relative mt-1.5">
                  <UiIcon
                    name="lock"
                    :size="16"
                    class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="auth-confirm"
                    v-model="confirm"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Repeat your password"
                    :class="[INPUT_BASE, fieldClass('confirm'), 'pl-9']"
                    :aria-invalid="fieldErrors.confirm ? 'true' : undefined"
                    :aria-describedby="fieldErrors.confirm ? 'auth-confirm-error' : undefined"
                  />
                </div>
                <p
                  v-if="fieldErrors.confirm"
                  id="auth-confirm-error"
                  class="mt-1.5 flex items-start gap-1 text-[12.5px] text-error"
                >
                  <UiIcon name="info" :size="13" class="mt-px" />
                  {{ fieldErrors.confirm }}
                </p>
              </div>

              <p
                v-if="formError"
                class="flex items-start gap-1.5 rounded-[11px] bg-error/8 px-3 py-2 text-[12.5px] leading-[1.45] text-error"
                role="alert"
              >
                <UiIcon name="info" :size="14" class="mt-px shrink-0" />
                {{ formError }}
              </p>

              <button
                type="submit"
                class="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue text-[14px] font-semibold text-on-blue transition hover:bg-blue-hover disabled:opacity-60"
                :disabled="busy"
                :aria-busy="busy"
              >
                <span
                  v-if="busy"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  aria-hidden="true"
                />
                {{ busy ? 'Please wait…' : copy.submit }}
              </button>

              <p v-if="mode === 'signin'" class="text-center text-[13px] text-muted">
                <button
                  type="button"
                  class="font-medium text-link hover:underline"
                  @click="mode = 'forgot'"
                >
                  Forgot password?
                </button>
              </p>

              <p class="text-center text-[13px] text-muted">
                <template v-if="mode === 'signup'">
                  Already have an account?
                  <button
                    type="button"
                    class="font-medium text-link hover:underline"
                    @click="mode = 'signin'"
                  >
                    Sign in
                  </button>
                </template>
                <template v-else>
                  New to the App Store?
                  <button
                    type="button"
                    class="font-medium text-link hover:underline"
                    @click="mode = 'signup'"
                  >
                    Create an account
                  </button>
                </template>
              </p>
            </form>

            <p
              class="mt-5 flex items-start gap-1.5 rounded-[11px] bg-fill-subtle px-3 py-2 text-[11.5px] leading-[1.5] text-muted"
            >
              <UiIcon name="info" :size="13" class="mt-px shrink-0" />
              Demo only — accounts are stored in this browser and nothing is sent anywhere.
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
