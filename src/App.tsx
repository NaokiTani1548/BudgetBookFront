import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
} from '@mui/material'
import {
  Menu as MenuIcon,
  List as ListIcon,
  CalendarMonth,
  Category,
  Repeat,
  Logout,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import theme from './theme'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ListPage from './pages/ListPage'
import CalendarPage from './pages/CalendarPage'
import DayDetailPage from './pages/DayDetailPage'
import CategoryPage from './pages/CategoryPage'
import RecurringExpensePage from './pages/RecurringExpensePage'

const DRAWER_WIDTH = 260

const menuItems = [
  { path: '/list', label: '収支リスト', icon: <ListIcon />, emoji: '📋' },
  { path: '/calendar', label: 'カレンダー', icon: <CalendarMonth />, emoji: '📅' },
  { path: '/recurring', label: '定期支出', icon: <Repeat />, emoji: '🔄' },
  { path: '/categories', label: 'カテゴリ', icon: <Category />, emoji: '🏷️' },
]

function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #5D9C59 0%, #7CB87A 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="KAKEKAKEI"
              sx={{
                height: 36,
                width: 'auto',
                filter: 'brightness(0) invert(1)', // 白色化
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.1em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              KAKEKAKEI
            </Typography>
          </Box>

          {/* ユーザーメニュー */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 500,
              }}
            >
              {user?.name}さん
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'secondary.main',
                  fontSize: '0.9rem',
                }}
              >
                {user?.name?.charAt(0) || '?'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: { mt: 1, borderRadius: 3 },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                ログアウト
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          {/* ウェルカムメッセージ */}
          <Box sx={{ px: 3, pb: 2, mb: 2, borderBottom: '1px dashed #E0D5C8' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              ページ一覧
            </Typography>
          </Box>

          <List sx={{ px: 1 }}>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    selected={isSelected}
                    onClick={handleDrawerToggle}
                    sx={{
                      borderRadius: 3,
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(93, 156, 89, 0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '1.3rem',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {item.emoji}
                    </Box>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: { fontWeight: isSelected ? 600 : 500 },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>
    </>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: isAuthenticated ? 10 : 0,
          pb: 4,
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/list" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <ListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/day/:date"
            element={
              <ProtectedRoute>
                <DayDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <ProtectedRoute>
                <RecurringExpensePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/list" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}