export const logout = () => {
  // Only clear authentication-related items, preserve user data
  const keysToRemove = [
    'isLoggedIn',
    'userType', 
    'userRole',
    'username',
    'userName',
    'userEmail',
    'userId',
    'token'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  window.location.href = '/login'
}
