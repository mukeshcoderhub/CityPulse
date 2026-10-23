
const USERS_KEY = 'citypulse-users'
const SESSION_KEY = 'citypulse-user'

export const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const notifyAuthChange = () => {
  window.dispatchEvent(new Event('citypulse-auth-change'))
}

const createSalt = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash), byte =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export const signup = async ({ name, mobile, password }) => {
  const users = getUsers()

  if (users.some(user => user.mobile === mobile)) {
    throw new Error('An account with this mobile number already exists.')
  }

  const salt = createSalt()
  const passwordHash = await hashPassword(password, salt)

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    mobile,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  saveUsers([...users, user])
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    mobile: user.mobile,
  }))

  notifyAuthChange()
  return user
}

export const login = async (mobile, password) => {
  const user = getUsers().find(item => item.mobile === mobile)

  if (!user) {
    throw new Error('No account found. Please sign up first.')
  }

  const passwordHash = await hashPassword(password, user.salt)

  if (passwordHash !== user.passwordHash) {
    throw new Error('Incorrect mobile number or password.')
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    mobile: user.mobile,
  }))

  notifyAuthChange()
  return user
}

export const resetPassword = async (mobile, newPassword) => {
  const users = getUsers()
  const index = users.findIndex(user => user.mobile === mobile)

  if (index === -1) {
    throw new Error('No account found with this mobile number.')
  }

  const salt = createSalt()
  const passwordHash = await hashPassword(newPassword, salt)

  users[index] = {
    ...users[index],
    salt,
    passwordHash,
  }

  saveUsers(users)
}

export const logout = () => {
  localStorage.removeItem(SESSION_KEY)
  notifyAuthChange()
}
