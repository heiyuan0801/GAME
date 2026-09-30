/**
 * Front-end-only account handling.
 *
 * There is no backend in this project, so accounts live in `localStorage` and
 * passwords are kept as a salted SHA-256 digest rather than plaintext. This is
 * a UI demo — it is not authentication, and the modal says so out loud. Nothing
 * here should be copied into anything that protects real data.
 */

export type AuthUser = { name: string; email: string }

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'account'

/** Field-scoped failure so the form can put the message next to the input. */
export interface AuthError {
  message: string
  field?: 'name' | 'email' | 'password' | 'confirm'
}

export type AuthResult = { ok: true } | ({ ok: false } & AuthError)

const SESSION_KEY = 'appstor-session'
const ACCOUNTS_KEY = 'appstor-accounts'

interface StoredAccount {
  name: string
  email: string
  passwordHash: string
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function digest(email: string, password: string): Promise<string> {
  const text = `${email.toLowerCase()}:${password}`
  // `crypto.subtle` needs a secure context; localhost counts. Without it we
  // still avoid plaintext by keeping only a marker, and sign-in falls back to
  // matching the stored account's email.
  if (!globalThis.crypto?.subtle) return Promise.resolve('unsupported')
  const bytes = new TextEncoder().encode(text)
  return crypto.subtle.digest('SHA-256', bytes).then((hash) =>
    [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join(''),
  )
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const open = useState('auth:open', () => false)
  const mode = useState<AuthMode>('auth:mode', () => 'signin')

  /** Prefilled when the modal is opened from a "sign up" call to action. */
  function openAuth(next: AuthMode = 'signin') {
    mode.value = next
    open.value = true
  }

  function closeAuth() {
    open.value = false
  }

  function readAccounts(): StoredAccount[] {
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as StoredAccount[]) : []
    } catch {
      return []
    }
  }

  function writeAccounts(list: StoredAccount[]) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
    } catch {
      /* storage full or unavailable — the session still works for this tab */
    }
  }

  function persistSession(next: AuthUser | null) {
    try {
      if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }

  async function signUp(input: {
    name: string
    email: string
    password: string
  }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase()
    const accounts = readAccounts()

    if (accounts.some((a) => a.email === email)) {
      return { ok: false, field: 'email', message: 'An account already uses this email address.' }
    }

    const account: StoredAccount = {
      name: input.name.trim(),
      email,
      passwordHash: await digest(email, input.password),
    }
    writeAccounts([...accounts, account])

    user.value = { name: account.name, email: account.email }
    persistSession(user.value)
    return { ok: true }
  }

  async function signIn(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase()
    const account = readAccounts().find((a) => a.email === email)

    // Deliberately vague: a demo should not teach anyone to build a login form
    // that reveals which half of the credentials was wrong.
    const rejected: AuthResult = {
      ok: false,
      message: 'That email and password combination doesn’t match an account.',
    }
    if (!account) return rejected

    const hash = await digest(email, input.password)
    if (account.passwordHash !== 'unsupported' && account.passwordHash !== hash) return rejected

    user.value = { name: account.name, email: account.email }
    persistSession(user.value)
    return { ok: true }
  }

  /**
   * Always reports success, whether or not the address is registered — the
   * standard way to avoid turning a reset form into an account-enumeration
   * oracle.
   */
  function requestReset(email: string): { ok: true; email: string } {
    return { ok: true, email: email.trim().toLowerCase() }
  }

  function signOut() {
    user.value = null
    persistSession(null)
  }

  /**
   * Reads the stored session. Called after hydration on purpose: the server has
   * no access to `localStorage`, so restoring any earlier would make the first
   * client render disagree with the server-rendered markup.
   */
  function restore() {
    if (!import.meta.client || user.value) return
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AuthUser
      if (parsed?.email) user.value = { name: parsed.name, email: parsed.email }
    } catch {
      /* malformed session — stay signed out */
    }
  }

  return { user, open, mode, openAuth, closeAuth, signUp, signIn, requestReset, signOut, restore }
}
