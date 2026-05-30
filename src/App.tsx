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
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  List as ListIcon,
  CalendarMonth,
  Category,
  Repeat,
  AccountCircle,
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

const DRAWER_WIDTH = 240

const menuItems = [
  { path: '/list', label: 'リスト', icon: <ListIcon /> },
  { path: '/calendar', label: 'カレンダー', icon: <CalendarMonth /> },
  { path: '/recurring', label: '定期支出', icon: <Repeat /> },
  { path: '/categories', label: 'カテゴリ', icon: <Category /> },
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            💰 BudgetBook
          </Typography>

          {/* ユーザーメニュー */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
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
          keepMounted: true, // モバイルでのパフォーマンス向上
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* AppBarの高さ分のスペーサー */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: isAuthenticated ? 8 : 0, // AppBarの高さ分のパディング
          minHeight: '100vh',
        }}
      >
        <Routes>
          {/* 認証不要なルート */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* 認証必要なルート */}
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

          {/* 404 */}
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